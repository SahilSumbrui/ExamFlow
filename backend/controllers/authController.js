const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendWelcomeEmail, sendPasswordChangedEmail, sendMail } = require("../utils/emailService");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = (email, otp, name) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px;">
      <h1 style="color:#6366f1;font-size:28px;margin-bottom:4px;">Verify Your Email</h1>
      <p style="color:#64748b;font-size:14px;margin-bottom:24px;">Your OTP for ExamFlow registration</p>
      <div style="background:white;border-radius:12px;padding:24px;border:1px solid #e2e8f0;">
        <p style="margin:0 0 16px;color:#0f172a;font-size:16px;">Hi <strong>${name}</strong>,</p>
        <p style="margin:0 0 24px;color:#475569;">Your one-time password (OTP) is:</p>
        <div style="background:#f1f5f9;border:2px solid #6366f1;border-radius:8px;padding:16px;text-align:center;margin:0 0 24px;">
          <p style="margin:0;font-size:32px;font-weight:bold;color:#6366f1;letter-spacing:4px;">${otp}</p>
        </div>
        <p style="margin:0 0 8px;color:#475569;">This OTP is valid for <strong>5 minutes</strong>.</p>
        <p style="margin:0;color:#e11d48;font-weight:bold;">Do not share this OTP with anyone.</p>
      </div>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px;text-align:center;">This is an automated message from ExamFlow. Please do not reply.</p>
    </div>
  `;
  return sendMail(email, "ExamFlow: Your OTP for Email Verification", html);
};

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

      if (!user.password) {
        return res.status(403).json({ 
          message: "This account was created with Google Sign-In. Please use 'Continue with Google' to log in. You can set a password in Security & Access settings."
        });
      }

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
        const otp = generateOTP();
        const otpExpiry = Date.now() + 5 * 60 * 1000;

        db.query(
          `INSERT INTO users 
          (name, email, password, role, is_verified, otp, otp_expiry) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            name,
            email,
            hashedPassword,
            role,
            0,
            otp,
            otpExpiry
          ],
          (err, result) => {
            if (err) {
              console.error("INSERT error:", err);
              return res.status(500).json({ message: "DB error", error: err.message });
            }

            sendOTPEmail(email, otp, name)
              .then(() => {
                res.status(201).json({
                  message: "Account created. OTP sent to your email.",
                  email: email
                });
              })
              .catch(err => {
                console.error('OTP email failed:', err);
                res.status(201).json({
                  message: "Account created but OTP email failed. Please try resending.",
                  email: email
                });
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

exports.verifyOTP = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });

      if (result.length === 0) {
        return res.status(400).json({ message: "User not found" });
      }

      const user = result[0];

      if (Date.now() > user.otp_expiry) {
        return res.status(400).json({ message: "OTP expired" });
      }

      if (user.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      db.query(
        "UPDATE users SET is_verified = 1, otp = NULL, otp_expiry = NULL WHERE user_id = ?",
        [user.user_id],
        (err) => {
          if (err) return res.status(500).json({ message: "DB error" });

          sendWelcomeEmail(user.name, user.email, user.role)
            .catch(err => console.log("Welcome email failed:", err));

          res.json({ message: "Email verified successfully" });
        }
      );
    }
  );
};

exports.resendOTP = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });

      if (result.length === 0) {
        return res.status(400).json({ message: "User not found" });
      }

      const user = result[0];

      if (user.is_verified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      const otp = generateOTP();
      const otpExpiry = Date.now() + 5 * 60 * 1000;

      db.query(
        "UPDATE users SET otp = ?, otp_expiry = ? WHERE user_id = ?",
        [otp, otpExpiry, user.user_id],
        (err) => {
          if (err) return res.status(500).json({ message: "DB error" });

          sendOTPEmail(email, otp, user.name)
            .then(() => {
              res.json({ message: "OTP resent successfully" });
            })
            .catch(err => {
              console.error('OTP email failed:', err);
              res.status(500).json({ message: "Failed to send OTP" });
            });
        }
      );
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
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  db.query(
    "UPDATE users SET name = ? WHERE user_id = ?",
    [name, user_id],
    (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Profile updated successfully", user: { user_id, name } });
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
        sendPasswordChangedEmail(user.name, user.email)
          .then(() => console.log('Password change email sent successfully'))
          .catch(err => {
            console.error('Password email failed:', err?.response?.body || err.message);
          });
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

      if (results.length > 0) {
        const user = results[0];

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

      if (!role) {
        return res.status(200).json({ newUser: true, name, email });
      }

      db.query(
        "INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, NULL, ?, 1)",
        [name, email, role],
        (err2, result) => {
          if (err2) return res.status(500).json({ message: "DB error" });

          const token = jwt.sign(
            { user_id: result.insertId, role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
          );

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
