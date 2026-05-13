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
  const teacher_id = req.user.user_id; // Auth middleware se extracted

  // Step 1: Pehle check karo ki ye course isi teacher ka hai ya nahi (Authorization)
  db.query(
    "SELECT * FROM courses WHERE course_id = ? AND teacher_id = ?",
    [course_id, teacher_id],
    (err, courseResult) => {
      if (err) return res.status(500).json({ message: "Database error" });
      
      if (courseResult.length === 0) {
        return res.status(404).json({ message: "Course not found or unauthorized" });
      }

      // Step 2: Pehle is course se linked saare EXAMS delete karo 
      // (Referential Integrity maintain karne ke liye)
      db.query(
        "DELETE FROM exams WHERE course_id = ?",
        [course_id],
        (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to delete associated exams" });
          }

          // Step 3: Ab jab Exams delete ho gaye, finally COURSE delete karo
          db.query(
            "DELETE FROM courses WHERE course_id = ?",
            [course_id],
            (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({ message: "Failed to delete course" });
              }

              res.json({ 
                message: "Course and all associated exams have been deleted successfully." 
              });
            }
          );
        }
      );
    }
  );
};