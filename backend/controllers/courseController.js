const db = require("../config/db");

// Get teacher's courses
exports.getTeacherCourses = (req, res) => {
  const { teacher_id } = req.params;

  const query = `
    SELECT 
      c.course_id,
      c.course_name,
      COUNT(e.exam_id) as exam_count
    FROM courses c
    LEFT JOIN exams e ON c.course_id = e.course_id
    WHERE c.teacher_id = ?
    GROUP BY c.course_id
    ORDER BY c.course_id DESC
  `;

  db.query(query, [teacher_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch courses" });
    }
    res.json(results);
  });
};

// Create course
exports.createCourse = (req, res) => {
  const { course_name } = req.body;
  const teacher_id = req.user.user_id;

  if (!course_name) {
    return res.status(400).json({ message: "Course name is required" });
  }

  const query = "INSERT INTO courses (course_name, teacher_id) VALUES (?, ?)";

  db.query(query, [course_name, teacher_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to create course" });
    }
    res.status(201).json({ message: "Course created successfully", course_id: result.insertId });
  });
};

// Delete course
exports.deleteCourse = (req, res) => {
  const { course_id } = req.params;
  const teacher_id = req.user.user_id;

  // Check if course has exams
  db.query(
    "SELECT COUNT(*) as count FROM exams WHERE course_id = ?",
    [course_id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to check course" });
      }
      
      if (result[0].count > 0) {
        return res.status(400).json({ message: "Cannot delete course with existing exams. Delete exams first." });
      }

      // No exams, safe to delete
      db.query(
        "DELETE FROM courses WHERE course_id = ? AND teacher_id = ?",
        [course_id, teacher_id],
        (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to delete course" });
          }
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Course not found or unauthorized" });
          }
          res.json({ message: "Course deleted successfully" });
        }
      );
    }
  );
};
