const db = require("../config/db");

exports.createExam = (req, res) => {
  const {
    course_id,
    title,
    duration_minutes,
    total_marks,
    start_time,
    end_time
  } = req.body;

  const teacher_id = req.user.user_id; 

  if(req.user.role !== "TEACHER" && req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "You are not authorized to create exams"
    });
  }

  const generateExamCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Basic validation
  if (
    !course_id ||
    !title ||
    !duration_minutes ||
    !total_marks ||
    !start_time ||
    !end_time
  ) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  if (new Date(end_time) <= new Date(start_time)) {
    return res.status(400).json({
      message: "End time must be after start time"
    });
  }

  if (duration_minutes <= 0) {
    return res.status(400).json({
      message: "Duration must be greater than 0"
    });
  }

  // Check course ownership
  const courseCheckSql = `
    SELECT course_id
    FROM courses
    WHERE course_id = ? AND teacher_id = ?
    LIMIT 1
  `;

  db.query(courseCheckSql, [course_id, teacher_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "Course ownership check failed"
      });
    }

    if (result.length === 0) {
      return res.status(403).json({
        message: "You are not authorized to create exam for this course"
      });
    }

    // Course ownership verified, create exam
    const exam_code = generateExamCode();

    const sql = `
      INSERT INTO exams
      (course_id, teacher_id, title, duration_minutes, total_marks, start_time, end_time, exam_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        course_id,
        teacher_id,
        title,
        duration_minutes,
        total_marks,
        start_time,
        end_time,
        exam_code
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            message: "Failed to create exam"
          });
        }

        res.status(201).json({
          message: "Exam created successfully",
          exam_id: result.insertId,
          exam_code: exam_code
        });
      }
    );
  });
};
exports.getExamById = (req, res) => {
  const { exam_id } = req.params;

  const examSql = `
    SELECT e.*, COUNT(DISTINCT a.attempt_id) as submissionsCount
    FROM exams e
    LEFT JOIN attempts a ON e.exam_id = a.exam_id
    WHERE e.exam_id = ?
    GROUP BY e.exam_id
  `;

  db.query(examSql, [exam_id], (err, examResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch exam" });
    }

    if (examResult.length === 0) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const exam = examResult[0];

    const questionsSql = `
      SELECT question_id, type, question_text, marks
      FROM questions
      WHERE exam_id = ?
    `;

    db.query(questionsSql, [exam_id], (err2, questions) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ message: "Failed to fetch questions" });
      }

      exam.questions = questions;
      res.json(exam);
    });
  });
};

exports.updateExamStatus = (req, res) => {
  const { exam_id } = req.params;
  const { status } = req.body;

  if (!['DRAFT', 'PUBLISHED'].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const sql = `UPDATE exams SET status = ? WHERE exam_id = ?`;

  db.query(sql, [status, exam_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to update status" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.json({ message: "Status updated successfully", status });
  });
};

exports.updateExam = (req, res) => {
  const { exam_id } = req.params;
  const { title, end_time, duration_minutes } = req.body;

  if (!title || !end_time || !duration_minutes) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = `UPDATE exams SET title = ?, end_time = ?, duration_minutes = ? WHERE exam_id = ?`;

  db.query(sql, [title, end_time, duration_minutes, exam_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to update exam" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.json({ message: "Exam updated successfully" });
  });
};

exports.getAllExams = (req, res) => {
  const query = "SELECT * FROM exams";

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch exams" });
    }
    res.status(200).json(results);
  });
};
exports.getExamsByTeacher = (req, res) => {
  const { teacher_id } = req.params;

  const query = "SELECT * FROM exams WHERE teacher_id = ?";

  db.query(query, [teacher_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch exams" });
    }
    res.status(200).json(results);
  });
};
exports.getExamQuestions = (req, res) => {
  const { exam_id } = req.params;

  // 1️⃣ Fetch exam details
  const examSql = `
    SELECT exam_id, title, duration_minutes, total_marks
    FROM exams
    WHERE exam_id = ?
  `;

  db.query(examSql, [exam_id], (err, examResults) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch exam" });
    }

    if (examResults.length === 0) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const exam = examResults[0];

    // 2️⃣ Fetch questions + options
    const questionSql = `
      SELECT 
        q.question_id,
        q.type,
        q.question_text,
        q.marks,
        o.option_id,
        o.option_text
      FROM questions q
      LEFT JOIN options o ON q.question_id = o.question_id
      WHERE q.exam_id = ?
    `;

    db.query(questionSql, [exam_id], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch questions" });
      }

      // 3️⃣ Format result (group options by question)
      const questionsMap = {};

      rows.forEach(row => {
        if (!questionsMap[row.question_id]) {
          questionsMap[row.question_id] = {
            question_id: row.question_id,
            type: row.type,
            question_text: row.question_text,
            marks: row.marks,
            options: []
          };
        }

        if (row.option_id) {
          questionsMap[row.question_id].options.push({
            option_id: row.option_id,
            option_text: row.option_text
          });
        }
      });

      res.status(200).json({
        exam_id: exam.exam_id,
        title: exam.title,
        duration_minutes: exam.duration_minutes,
        total_marks: exam.total_marks,
        questions: Object.values(questionsMap)
      });
    });
  });
};


// Get teacher stats
exports.getTeacherStats = (req, res) => {
  const teacher_id = req.user.user_id;

  const queries = {
    activeExams: `SELECT COUNT(*) as count FROM exams WHERE teacher_id = ? AND NOW() BETWEEN start_time AND end_time`,
    totalSubmissions: `SELECT COUNT(*) as count FROM attempts a JOIN exams e ON a.exam_id = e.exam_id WHERE e.teacher_id = ?`,
    avgScore: `SELECT AVG(a.score) as avg FROM attempts a JOIN exams e ON a.exam_id = e.exam_id WHERE e.teacher_id = ? AND a.score IS NOT NULL`
  };

  const results = {};
  let completed = 0;

  Object.keys(queries).forEach(key => {
    db.query(queries[key], [teacher_id], (err, result) => {
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

// Get teacher analytics
exports.getTeacherAnalytics = (req, res) => {
  const teacher_id = req.user.user_id;

  const queries = {
    avgScore: `SELECT AVG((a.score / e.total_marks) * 100) as avg FROM attempts a JOIN exams e ON a.exam_id = e.exam_id WHERE e.teacher_id = ? AND a.score IS NOT NULL`,
    passRate: `SELECT (COUNT(CASE WHEN (a.score / e.total_marks) * 100 >= 40 THEN 1 END) * 100.0 / COUNT(*)) as rate FROM attempts a JOIN exams e ON a.exam_id = e.exam_id WHERE e.teacher_id = ? AND a.score IS NOT NULL`,
    totalStudents: `SELECT COUNT(DISTINCT a.student_id) as count FROM attempts a JOIN exams e ON a.exam_id = e.exam_id WHERE e.teacher_id = ?`,
    needHelp: `SELECT COUNT(DISTINCT a.student_id) as count FROM attempts a JOIN exams e ON a.exam_id = e.exam_id WHERE e.teacher_id = ? AND (a.score / e.total_marks) * 100 < 40`,
    performanceTrend: `SELECT DATE(a.start_time) as date, AVG((a.score / e.total_marks) * 100) as avgScore FROM attempts a JOIN exams e ON a.exam_id = e.exam_id WHERE e.teacher_id = ? AND a.start_time >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND a.score IS NOT NULL GROUP BY DATE(a.start_time) ORDER BY date ASC`,
    scoreDistribution: `SELECT CASE WHEN (a.score / e.total_marks) * 100 < 40 THEN '0-39' WHEN (a.score / e.total_marks) * 100 < 60 THEN '40-59' WHEN (a.score / e.total_marks) * 100 < 80 THEN '60-79' ELSE '80-100' END as score_range, COUNT(*) as count FROM attempts a JOIN exams e ON a.exam_id = e.exam_id WHERE e.teacher_id = ? AND a.score IS NOT NULL GROUP BY score_range ORDER BY score_range`,
    coursePerformance: `SELECT c.course_name, AVG((a.score / e.total_marks) * 100) as avgScore FROM attempts a JOIN exams e ON a.exam_id = e.exam_id JOIN courses c ON e.course_id = c.course_id WHERE e.teacher_id = ? AND a.score IS NOT NULL GROUP BY c.course_id`,
    passFailRatio: `SELECT 'Pass' as name, COUNT(*) as value FROM attempts a JOIN exams e ON a.exam_id = e.exam_id WHERE e.teacher_id = ? AND (a.score / e.total_marks) * 100 >= 40 UNION ALL SELECT 'Fail' as name, COUNT(*) as value FROM attempts a JOIN exams e ON a.exam_id = e.exam_id WHERE e.teacher_id = ? AND (a.score / e.total_marks) * 100 < 40`,
    topPerformers: `SELECT u.name, ROUND(AVG((a.score / e.total_marks) * 100), 1) as avgScore FROM attempts a JOIN exams e ON a.exam_id = e.exam_id JOIN users u ON a.student_id = u.user_id WHERE e.teacher_id = ? AND a.score IS NOT NULL GROUP BY a.student_id ORDER BY avgScore DESC LIMIT 5`,
    needHelpStudents: `SELECT u.name, ROUND(AVG((a.score / e.total_marks) * 100), 1) as avgScore FROM attempts a JOIN exams e ON a.exam_id = e.exam_id JOIN users u ON a.student_id = u.user_id WHERE e.teacher_id = ? AND a.score IS NOT NULL GROUP BY a.student_id HAVING avgScore < 40 ORDER BY avgScore ASC LIMIT 5`
  };

  const results = {};
  let completed = 0;
  const totalQueries = Object.keys(queries).length;

  Object.keys(queries).forEach(key => {
    db.query(queries[key], key === 'passFailRatio' ? [teacher_id, teacher_id] : [teacher_id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch analytics" });
      }
      
      if (key === 'avgScore' || key === 'passRate') {
        results[key] = Math.round(result[0].avg || result[0].rate || 0);
      } else if (key === 'totalStudents' || key === 'needHelp') {
        results[key] = result[0].count || 0;
      } else {
        results[key] = result;
      }
      
      completed++;
      
      if (completed === totalQueries) {
        res.json(results);
      }
    });
  });
};
