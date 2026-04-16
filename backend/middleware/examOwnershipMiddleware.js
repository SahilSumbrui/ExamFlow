const db = require("../config/db");

exports.verifyExamOwner = (req, res, next) => {
  const exam_id = req.params.exam_id || req.body.exam_id;
  const { user_id, role } = req.user;

  // Admin can do anything
  if (role === "ADMIN") return next();

  const sql = `
    SELECT exam_id
    FROM exams
    WHERE exam_id = ? AND teacher_id = ?
  `;

  db.query(sql, [exam_id, user_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Ownership check failed" });
    }

    if (result.length === 0) {
      return res.status(403).json({
        message: "You are not authorized to manage this exam"
      });
    }

    next();
  });
};
