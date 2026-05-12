const db = require("../config/db");

// Get all users (for user management table)
exports.getAllUsers = (req, res) => {
  db.query(
    "SELECT user_id, name, email, role, created_at FROM users ORDER BY created_at DESC",
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json(results);
    }
  );
};

// Delete user
exports.deleteUser = (req, res) => {
  const { user_id } = req.params;

  db.query(
    "DELETE FROM users WHERE user_id = ?",
    [user_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    }
  );
};

// Get all exams with details
exports.getAllExamsWithDetails = (req, res) => {
  const query = `
    SELECT 
      e.exam_id,
      e.title,
      e.start_time,
      e.end_time,
      e.total_marks,
      u.name as teacher_name,
      COUNT(DISTINCT a.attempt_id) as attempt_count
    FROM exams e
    LEFT JOIN users u ON e.teacher_id = u.user_id
    LEFT JOIN attempts a ON e.exam_id = a.exam_id
    GROUP BY e.exam_id
    ORDER BY e.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch exams" });
    }
    res.status(200).json(results);
  });
};

// Delete exam
exports.deleteExam = (req, res) => {
  const { exam_id } = req.params;

  // Delete in correct order to avoid foreign key constraints
  db.query("DELETE FROM options WHERE question_id IN (SELECT question_id FROM questions WHERE exam_id = ?)", [exam_id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "DB error deleting options" });
    }
    
    db.query("DELETE FROM answers WHERE attempt_id IN (SELECT attempt_id FROM attempts WHERE exam_id = ?)", [exam_id], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "DB error deleting answers" });
      }
      
      db.query("DELETE FROM attempts WHERE exam_id = ?", [exam_id], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "DB error deleting attempts" });
        }
        
        db.query("DELETE FROM questions WHERE exam_id = ?", [exam_id], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "DB error deleting questions" });
          }
          
          db.query("DELETE FROM exams WHERE exam_id = ?", [exam_id], (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: "DB error deleting exam" });
            }
            if (result.affectedRows === 0) {
              return res.status(404).json({ message: "Exam not found" });
            }
            res.json({ message: "Exam deleted successfully" });
          });
        });
      });
    });
  });
};

// Get all attempts with details
exports.getAllAttempts = (req, res) => {
  const query = `
    SELECT 
      a.attempt_id,
      a.start_time,
      a.end_time,
      a.score,
      a.status,
      u.name as student_name,
      e.title as exam_title,
      e.total_marks
    FROM attempts a
    LEFT JOIN users u ON a.student_id = u.user_id
    LEFT JOIN exams e ON a.exam_id = e.exam_id
    ORDER BY a.start_time DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch attempts" });
    }
    console.log('Attempts data:', results); // Debug log
    res.status(200).json(results);
  });
};

// Get system overview stats
exports.getSystemStats = (req, res) => {
  const queries = {
    totalUsers: "SELECT COUNT(*) as count FROM users",
    totalStudents: "SELECT COUNT(*) as count FROM users WHERE role = 'STUDENT'",
    totalTeachers: "SELECT COUNT(*) as count FROM users WHERE role = 'TEACHER'",
    totalExams: "SELECT COUNT(*) as count FROM exams",
    activeExams: "SELECT COUNT(*) as count FROM exams WHERE NOW() BETWEEN start_time AND end_time",
    totalAttempts: "SELECT COUNT(*) as count FROM attempts",
    avgScore: "SELECT AVG(score) as avg FROM attempts WHERE score IS NOT NULL"
  };

  const results = {};
  let completed = 0;

  Object.keys(queries).forEach(key => {
    db.query(queries[key], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch stats" });
      }
      results[key] = result[0].count || result[0].avg || 0;
      completed++;
      
      if (completed === Object.keys(queries).length) {
        res.json(results);
      }
    });
  });
};

// Get attempts over time for chart
exports.getAttemptsOverTime = (req, res) => {
  const query = `
    SELECT 
      DATE(start_time) as date,
      COUNT(*) as count
    FROM attempts
    WHERE start_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY DATE(start_time)
    ORDER BY date ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch chart data" });
    }
    res.json(results);
  });
};

// Get score distribution for chart
exports.getScoreDistribution = (req, res) => {
  const query = `
    SELECT 
      CASE 
        WHEN score < 40 THEN '0-39'
        WHEN score < 60 THEN '40-59'
        WHEN score < 80 THEN '60-79'
        ELSE '80-100'
      END as score_range,
      COUNT(*) as count
    FROM attempts
    WHERE score IS NOT NULL
    GROUP BY score_range
    ORDER BY score_range
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch score distribution" });
    }
    res.json(results);
  });
};

// Get student analytics for admin view
exports.getStudentAnalytics = (req, res) => {
  const { studentId } = req.params;

  // First, get all courses with attempts for this student
  const query = `
    SELECT DISTINCT
      c.course_id as id,
      c.course_name as title,
      COUNT(DISTINCT a.attempt_id) as examCount,
      ROUND(AVG(a.score), 2) as avg,
      ROUND(AVG(a.score), 2) as classAvg,
      'neutral' as velocity,
      'neutral' as trend
    FROM courses c
    INNER JOIN exams e ON c.course_id = e.course_id
    INNER JOIN attempts a ON e.exam_id = a.exam_id AND a.student_id = ?
    WHERE a.score IS NOT NULL
    GROUP BY c.course_id, c.course_name
  `;

  db.query(query, [studentId], (err, courses) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch student analytics" });
    }

    const statsQuery = `
      SELECT 
        COUNT(DISTINCT a.attempt_id) as totalCompleted,
        ROUND(AVG(a.score), 2) as avgScore,
        c.course_name as coreStrength
      FROM attempts a
      INNER JOIN exams e ON a.exam_id = e.exam_id
      INNER JOIN courses c ON e.course_id = c.course_id
      WHERE a.student_id = ? AND a.score IS NOT NULL
      GROUP BY c.course_id
      ORDER BY AVG(a.score) DESC
      LIMIT 1
    `;

    db.query(statsQuery, [studentId], (err, stats) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch student stats" });
      }

      // Fetch test details for each course
      const testQuery = `
        SELECT 
          c.course_id,
          e.title as name,
          a.score,
          CONCAT(FLOOR(TIME_TO_SEC(TIMEDIFF(a.end_time, a.start_time))/60), 'm') as time
        FROM attempts a
        INNER JOIN exams e ON a.exam_id = e.exam_id
        INNER JOIN courses c ON e.course_id = c.course_id
        WHERE a.student_id = ? AND a.score IS NOT NULL
        ORDER BY a.start_time ASC
      `;

      db.query(testQuery, [studentId], (err, tests) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Failed to fetch test details" });
        }

        // Group tests by course
        const courseTests = {};
        tests.forEach(test => {
          if (!courseTests[test.course_id]) {
            courseTests[test.course_id] = [];
          }
          courseTests[test.course_id].push({
            name: test.name,
            score: test.score,
            time: test.time
          });
        });

        // Attach tests to courses
        const cleanCourses = courses.map(c => ({
          ...c,
          tests: courseTests[c.id] || []
        }));

        res.json({
          totalCompleted: stats[0]?.totalCompleted || 0,
          avgScore: stats[0]?.avgScore || 0,
          coreStrength: stats[0]?.coreStrength || 'N/A',
          courses: cleanCourses
        });
      });
    });
  });
};
