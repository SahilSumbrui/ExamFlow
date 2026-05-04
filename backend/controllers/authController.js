const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendWelcomeEmail, sendPasswordChangedEmail, sendMail } = require("../utils/emailService");
const nodemailer = require("nodemailer");


exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (results.length === 0)
        return res.status(401).json({ message: "Invalid credentials" });

      const user = results[0];

      // Check account status
      if (user.status === 'REJECTED') {
        return res.status(403).json({ 
          message: "Your account has been suspended. Please contact admin.",
          rejected: true 
        });
      }

      //Block login if email not verified
      if (!user.is_verified) {
        return res.status(403).json({ message: "Please verify your email before logging in." });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { user_id: user.user_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        token,
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
  );
};

exports.signup = (req, res) => {
  const { name, email, password, role } = req.body;

  if (!role) {
    return res.status(400).json({ message: "Please select a role (Student or Teacher)" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, existing) => {
      if (err) {
        console.error("SELECT error:", err);
        return res.status(500).json({ message: "DB error", error: err.message });
      }

      if (existing.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const status = "ACTIVE";
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpiry = Date.now() + 15 * 60 * 1000;

        db.query(
          `INSERT INTO users 
          (name, email, password, role, status, is_verified, verification_token, verification_token_expiry) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            name,
            email,
            hashedPassword,
            role,
            status,
            0,
            verificationToken,
            verificationTokenExpiry
          ],
          (err, result) => {
            if (err) {
              console.error("INSERT error:", err);
              return res.status(500).json({ message: "DB error", error: err.message });
            }

            const verifyLink = `http://localhost:5173/verify-email?token=${verificationToken}`;

            sendMail(
              email,
              "Verify your email - ExamFlow",
              `
              <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px;">
                <h2>Verify your Email</h2>
                <p>Hi ${name},</p>
                <p>Click the button below to verify your account:</p>
                <a href="${verifyLink}" style="display:inline-block;padding:10px 20px;background:#6366f1;color:white;text-decoration:none;border-radius:6px;">
                  Verify Email
                </a>
                <p style="margin-top:20px;">This link will expire in 15 minutes.</p>
                <p style="font-size:12px;color:gray;">This is an automated email. Do not respond.</p>
              </div>
              `
            ).catch(err => console.log("Email error:", err));

            return res.status(201).json({
              message: "Account created successfully. Please check your email to verify your account."
            });
          }
        );
      } catch (hashErr) {
        console.error("Hashing error:", hashErr);
        return res.status(500).json({ message: "Password hashing failed" });
      }
    }
  );
};

exports.getUserProfile = (req, res) => {
  const { user_id } = req.params;

  db.query(
    "SELECT user_id, name, email, role FROM users WHERE user_id = ?",
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (results.length === 0) return res.status(404).json({ message: "User not found" });
      
      res.json(results[0]);
    }
  );
};

exports.updateProfile = (req, res) => {
  const { user_id } = req.user;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  db.query(
    "UPDATE users SET name = ?, email = ? WHERE user_id = ?",
    [name, email, user_id],
    (err) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      res.json({
        message: "Profile updated successfully",
        user: {
          user_id,
          name,
          email
        }
      });
    }
  );
};

exports.changePassword = async (req, res) => {
  const { user_id } = req.user;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "New password is required" });
  }

  db.query("SELECT * FROM users WHERE user_id = ?", [user_id], async (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });

    const user = results[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.query(
      "UPDATE users SET password = ? WHERE user_id = ?",
      [hashedPassword, user_id],
      (err) => {
        if (err) return res.status(500).json({ message: "DB error" });
        sendPasswordChangedEmail(user.name, user.email).catch(err => console.error('Password email failed:', err));
        res.json({ message: "Password updated successfully" });
      }
    );
  });
};

exports.googleAuth = async (req, res) => {
  const { name, email, googleId, role } = req.body;

  if (!email || !googleId) return res.status(400).json({ message: "Google auth data required" });

  try {
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });

      // Existing user — log them in
      if (results.length > 0) {
        const user = results[0];

        if (user.status === 'REJECTED') {
          return res.status(403).json({ message: "Your account has been suspended. Please contact admin." });
        }

        const token = jwt.sign(
          { user_id: user.user_id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        return res.json({
          token,
          user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role }
        });
      }

      // New user — role required
      if (!role) {
        return res.status(200).json({ newUser: true, name, email });
      }

      // Create new user
      db.query(
        "INSERT INTO users (name, email, password, role, status) VALUES (?, ?, NULL, ?, 'ACTIVE')",
        [name, email, role],
        (err2, result) => {
          if (err2) return res.status(500) .json({ message: "DB error" });

          const token = jwt.sign(
            { user_id: result.insertId, role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
          );

          // Send welcome email (non-blocking)
          sendWelcomeEmail(name, email, role).catch(err => console.error('Welcome email failed:', err));

          res.status(201).json({
            token,
            user: { user_id: result.insertId, name, email, role }
          });
        }
      );
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Google auth failed" });
  }
};

exports.verifyEmail = (req, res) => {
  const { token } = req.params;

  db.query(
    "SELECT * FROM users WHERE verification_token = ?",
    [token],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });

      if (result.length === 0) {
        return res.status(400).json({ message: "Invalid token" });
      }

      const user = result[0];

      // Check expiry
      if (Date.now() > Number(user.verification_token_expiry)) {
        return res.status(400).json({ message: "Token expired" });
      }

      // Update user
      db.query(
        "UPDATE users SET is_verified = true, verification_token = NULL, verification_token_expiry = NULL WHERE user_id = ?",
        [user.user_id],
        (err) => {
          if (err) return res.status(500).json({ message: "DB error" });

          // ✅ SEND WELCOME EMAIL HERE
          sendWelcomeEmail(user.name, user.email, user.role)
            .catch(err => console.log("Welcome email failed:", err));

          res.json({ message: "Email verified successfully" });
        }
      );
    }
  );
};