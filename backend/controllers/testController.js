const db = require("../config/db");
const { sendResultsPublishedEmail } = require("../utils/emailService");

const isAttemptActive = (attempt_id, user_id, callback) => {
  const sql = `
    SELECT status, student_id
    FROM attempts
    WHERE attempt_id = ?
  `;

  db.query(sql, [attempt_id], (err, result) => {
    if (err) return callback(err);

    if (result.length === 0) {
      return callback(null, false, "Attempt not found");
    }

    const attempt = result[0];

    if (attempt.student_id !== user_id) {
      return callback(null, false, "Unauthorized attempt access");
    }

    if (attempt.status !== "ONGOING") {
      return callback(null, false, "Test already submitted");
    }

    callback(null, true);
  });
};


// Start Test (create attempt)
exports.startTest = (req, res) => {
  const { exam_id, exam_code} = req.body;
  const student_id = req.user.user_id; // from JWT

  if (!exam_id || !exam_code) {
    return res.status(400).json({ message: "exam_id and exam_code required" });
  }

  // 0️⃣ Verify exam code and check date/time availability
  const examSql = `
    SELECT exam_id, start_time, end_time, status, duration_minutes
    FROM exams
    WHERE exam_id = ? AND exam_code = ?
  `;

  db.query(examSql, [exam_id, exam_code], (err, examResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to verify exam" });
    }

    if (examResult.length === 0) {
      return res.status(403).json({
        message: "Invalid exam code"
      });
    }

    const exam = examResult[0];
    const now = new Date();
    const startTime = new Date(exam.start_time);
    const endTime = new Date(exam.end_time);

    if (exam.status !== 'PUBLISHED') {
      return res.status(403).json({
        message: "Exam is not published yet"
      });
    }

    if (now < startTime) {
      return res.status(403).json({
        message: "Exam has not started yet"
      });
    }

    if (now > endTime) {
      return res.status(403).json({
        message: "Exam has ended"
      });
    }

    // 1️⃣ Check if attempt already exists
    const checkSql = `
      SELECT attempt_id, status
      FROM attempts
      WHERE exam_id = ? AND student_id = ?
        AND status IN ('ONGOING', 'COMPLETED', 'AUTO_SUBMITTED')
    `;

    db.query(checkSql, [exam_id, student_id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to check attempts" });
      }

      if (result.length > 0) {
        return res.status(403).json({
          message: "You have already attempted this exam",
          attempt_id: result[0].attempt_id,
          status: result[0].status
        });
      }

      // 2️⃣ Create new attempt
      const insertSql = `
        INSERT INTO attempts (exam_id, student_id, start_time, status)
        VALUES (?, ?, NOW(), 'ONGOING')
      `;

      db.query(insertSql, [exam_id, student_id], (err2, result2) => {
        if (err2) {
          console.error(err2);
          return res.status(500).json({ message: "Failed to start exam" });
        }

        res.json({
          message: "Exam started",
          attempt_id: result2.insertId
        });
      });
    });
  });
};


exports.submitAnswer = (req, res) => {
  const {
    attempt_id,
    question_id,
    selected_option_id,
    descriptive_answer
  } = req.body;

  if (!attempt_id || !question_id) {
    return res.status(400).json({ message: "attempt_id and question_id required" });
  }

  const user_id = req.user.user_id;

  isAttemptActive(attempt_id, user_id, (err, isActive, message) => {
    if (err) {
      return res.status(500).json({ message: "Attempt status check failed" });
    }

    if (!isActive) {
      return res.status(403).json({ message });
    }

    const checkSql = `
    SELECT answer_id
    FROM answers
    WHERE attempt_id = ? AND question_id = ?
  `;

  db.query(checkSql, [attempt_id, question_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Failed to check existing answer" });
    }

    // If answer exists, update it instead of inserting
    if (rows.length > 0) {
      const answer_id = rows[0].answer_id;
      
      if (descriptive_answer && descriptive_answer.trim() !== '') {
        const updateSql = `UPDATE answers SET descriptive_answer = ?, marks_awarded = NULL WHERE answer_id = ?`;
        db.query(updateSql, [descriptive_answer, answer_id], (err) => {
          if (err) return res.status(500).json({ message: "Failed to update answer" });
          res.json({ message: "Descriptive answer updated" });
        });
      } else if (selected_option_id) {
        const checkOptionSql = `SELECT o.is_correct, q.marks FROM options o JOIN questions q ON o.question_id = q.question_id WHERE o.option_id = ? AND q.question_id = ?`;
        db.query(checkOptionSql, [selected_option_id, question_id], (err2, result) => {
          if (err2) return res.status(500).json({ message: "Error checking option" });
          if (result.length === 0) return res.status(400).json({ message: "Invalid option" });
          
          const marks = result[0].is_correct ? result[0].marks : 0;
          const updateSql = `UPDATE answers SET selected_option_id = ?, marks_awarded = ? WHERE answer_id = ?`;
          db.query(updateSql, [selected_option_id, marks, answer_id], (err3) => {
            if (err3) return res.status(500).json({ message: "Failed to update answer" });
            res.json({ message: "Answer updated", correct: !!result[0].is_correct, marks_awarded: marks });
          });
        });
      }
      return;
    }

    // 2️⃣ Descriptive case - check this FIRST
    if (descriptive_answer && descriptive_answer.trim() !== '') {
      const insertSql = `
        INSERT INTO answers
        (attempt_id, question_id, descriptive_answer)
        VALUES (?, ?, ?)
      `;

      db.query(insertSql, [attempt_id, question_id, descriptive_answer], (err4) => {
        if (err4) {
          return res.status(500).json({ message: "Failed to submit answer" });
        }

        res.json({ message: "Descriptive answer submitted" });
      });
    }
    // 3️⃣ MCQ case
    else if (selected_option_id) {
      const checkOptionSql = `
        SELECT o.is_correct, q.marks
        FROM options o
        JOIN questions q ON o.question_id = q.question_id
        WHERE o.option_id = ? AND q.question_id = ?
      `;

      db.query(
        checkOptionSql,
        [selected_option_id, question_id],
        (err2, result) => {
          if (err2) {
            return res.status(500).json({ message: "Error checking option" });
          }

          if (result.length === 0) {
            return res.status(400).json({
              message: "Invalid option for this question"
            });
          }

          const isCorrect = result[0].is_correct;
          const marks = isCorrect ? result[0].marks : 0;

          const insertSql = `
            INSERT INTO answers
            (attempt_id, question_id, selected_option_id, marks_awarded)
            VALUES (?, ?, ?, ?)
          `;

          db.query(
            insertSql,
            [attempt_id, question_id, selected_option_id, marks],
            (err3) => {
              if (err3) {
                return res.status(500).json({ message: "Failed to submit answer" });
              }

              res.json({
                message: "Answer submitted",
                correct: !!isCorrect,
                marks_awarded: marks
              });
            }
          );
        }
      );
    }
    else {
      res.status(400).json({ message: "No answer provided" });
    }
  });
  });
};
exports.getQuestionsForTest = (req, res) => {
  const { attempt_id } = req.params;

  if (!attempt_id) {
    return res.status(400).json({ message: "attempt_id required" });
  }

  const sql = `
    SELECT 
      q.question_id,
      q.type,
      q.question_text,
      q.marks,
      o.option_id,
      o.option_text,
      e.title AS exam_title,
      e.duration_minutes,
      e.end_time,
      a.start_time
    FROM attempts a
    JOIN exams e ON a.exam_id = e.exam_id
    JOIN questions q ON e.exam_id = q.exam_id
    LEFT JOIN options o ON q.question_id = o.question_id
    WHERE a.attempt_id = ?
    ORDER BY q.question_id
  `;

  db.query(sql, [attempt_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch questions" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No questions found" });
    }

    const questionsMap = {};
    const examInfo = {
      title: results[0].exam_title,
      duration_minutes: results[0].duration_minutes,
      start_time: results[0].start_time,
      end_time: results[0].end_time
    };

    results.forEach(row => {
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
      ...examInfo,
      questions: Object.values(questionsMap)
    });
  });
};
exports.endTest = (req, res) => {
  const { attempt_id } = req.body;

  if (!attempt_id) {
    return res.status(400).json({ message: "attempt_id required" });
  }

  const user_id = req.user.user_id;

  isAttemptActive(attempt_id, user_id, (err, isActive, message) => {
    if (err) {
      return res.status(500).json({ message: "Attempt status check failed" });
    }

    if (!isActive) {
      return res.status(403).json({ message });
    }

    const attemptSql = `
    SELECT status, integrity_score
    FROM attempts
    WHERE attempt_id = ?
  `;

    db.query(attemptSql, [attempt_id], (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (rows.length === 0)
        return res.status(404).json({ message: "Attempt not found" });

      const { status, integrity_score } = rows[0];

      if (status !== "ONGOING") {
        return res.json({
          message: "Test already ended",
          status,
          integrity_score
        });
      }

      // 2️⃣ Calculate score
      const scoreQuery = `
        SELECT SUM(marks_awarded) AS total_score
        FROM answers
        WHERE attempt_id = ?
      `;

      db.query(scoreQuery, [attempt_id], (err2, result) => {
        if (err2) {
          console.error(err2);
          return res.status(500).json({ message: "Score calculation failed" });
        }

        const totalScore = result[0].total_score || 0;

        // 3️⃣ Manual submit
        const updateAttempt = `
          UPDATE attempts
          SET end_time = NOW(),
              score = ?,
              status = 'COMPLETED'
          WHERE attempt_id = ? AND status = 'ONGOING'
        `;

        db.query(updateAttempt, [totalScore, attempt_id], (err3) => {
          if (err3) {
            console.error(err3);
            return res.status(500).json({ message: "Failed to submit test" });
          }

          res.json({
            message: "Test submitted successfully",
            score: totalScore,
            integrity_score
          });
        });
      });
    });
  });
};
exports.getResultByAttempt = (req, res) => {
  const { attempt_id } = req.params;

  const query = `
    SELECT 
      q.question_text,
      q.type,
      q.marks AS max_marks,
      a.descriptive_answer,
      o.option_text AS selected_option,
      a.marks_awarded
    FROM answers a
    JOIN questions q ON a.question_id = q.question_id
    LEFT JOIN options o ON a.selected_option_id = o.option_id
    WHERE a.attempt_id = ?
  `;

  db.query(query, [attempt_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch result" });
    }

    res.json(results);
  });
};
exports.getDescriptiveAnswers = (req, res) => {
  const { exam_id } = req.params;

  const query = `
    SELECT 
      a.answer_id,
      a.attempt_id,
      q.question_text,
      a.descriptive_answer,
      q.marks AS max_marks,
      a.marks_awarded
    FROM answers a
    JOIN questions q ON a.question_id = q.question_id
    WHERE q.exam_id = ? AND q.type = 'DESC'
  `;

  db.query(query, [exam_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch answers" });
    }

    res.json(results);
  });
};
exports.evaluateAnswer = (req, res) => {
  const { answer_id, marks_awarded } = req.body;

  if (!answer_id || marks_awarded == null) {
    return res.status(400).json({ message: "answer_id and marks required" });
  }

  const query = `
    UPDATE answers
    SET marks_awarded = ?
    WHERE answer_id = ?
  `;

  db.query(query, [marks_awarded, answer_id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Evaluation failed" });
    }

    res.json({ message: "Marks updated successfully" });
  });
};
exports.calculateFinalScore = (req, res) => {
  const { attempt_id } = req.body;

  if (!attempt_id) {
    return res.status(400).json({ message: "attempt_id required" });
  }

  const sumQuery = `
    SELECT SUM(marks_awarded) AS total_score
    FROM answers
    WHERE attempt_id = ?
  `;

  db.query(sumQuery, [attempt_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to calculate score" });
    }

    const totalScore = result[0].total_score || 0;

    const updateQuery = `
      UPDATE attempts
      SET score = ?, status = 'COMPLETED', end_time = NOW()
      WHERE attempt_id = ?
    `;

    db.query(updateQuery, [totalScore, attempt_id], (err2) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ message: "Failed to update attempt" });
      }

      res.json({
        message: "Final score calculated",
        score: totalScore
      });
    });
  });
};
exports.getStudentAttempts = (req, res) => {
  const student_id = req.user.user_id;

  const query = `
    SELECT 
      a.attempt_id,
      e.title AS exam_title,
      a.score,
      e.total_marks,
      a.status,
      a.start_time,
      a.end_time,
      e.results_published
    FROM attempts a
    JOIN exams e ON a.exam_id = e.exam_id
    WHERE a.student_id = ?
    ORDER BY a.start_time DESC
  `;

  db.query(query, [student_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch attempts" });
    }

    res.json(results);
  });
};
exports.getAttemptDetails = (req, res) => {
  const { attempt_id } = req.params;
  const{ user_id, role } = req.user;

  const checkSql = `
    SELECT att.student_id, e.teacher_id, e.results_published
    FROM attempts att
    JOIN exams e ON att.exam_id = e.exam_id
    WHERE att.attempt_id = ?
  `;

  db.query(checkSql, [attempt_id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "DB error" });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    const { student_id, teacher_id, results_published } = rows[0];

    // Security checks
    if (role === "STUDENT") {
      if (student_id !== user_id) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (!results_published) {
        return res.status(403).json({ message: "Results not published yet" });
      }
    }

    if (role === "TEACHER" && teacher_id !== user_id) {
      console.log(`Access denied: Teacher ${user_id} tried to access exam owned by teacher ${teacher_id}`);
      return res.status(403).json({ message: "Access denied - You don't own this exam" });
    }

    const query = `
      SELECT
        u.name AS student_name,
        u.user_id AS student_id,
        e.title AS exam_title,
        e.course_id,
        e.exam_id,
        e.total_marks AS exam_total_marks,
        att.start_time,
        att.end_time,
        att.end_time AS submitted_at,
        att.integrity_score,
        q.question_id,
        q.question_text,
        q.type,
        q.marks AS max_marks,
        a.answer_id,
        o.option_text AS selected_option,
        correct_opt.option_text AS correct_answer,
        a.descriptive_answer,
        a.marks_awarded
      FROM questions q
      JOIN exams e ON q.exam_id = e.exam_id
      JOIN attempts att ON e.exam_id = att.exam_id
      JOIN users u ON att.student_id = u.user_id
      LEFT JOIN answers a ON q.question_id = a.question_id AND a.attempt_id = att.attempt_id
      LEFT JOIN options o ON a.selected_option_id = o.option_id
      LEFT JOIN options correct_opt ON q.question_id = correct_opt.question_id AND correct_opt.is_correct = 1
      WHERE att.attempt_id = ?
      ORDER BY q.question_id
    `;

    db.query(query, [attempt_id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch details" });
      }

      res.json(results);
    });
  });
};
exports.getExamsByTeacher = (req, res) => {
  const { teacher_id } = req.params;

  const query = `
    SELECT 
      e.exam_id,
      e.title,
      e.start_time,
      e.end_time,
      COUNT(a.attempt_id) AS total_attempts
    FROM exams e
    LEFT JOIN attempts a ON e.exam_id = a.exam_id
    WHERE e.teacher_id = ?
    GROUP BY e.exam_id
  `;

  db.query(query, [teacher_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch exams" });
    }

    res.json(results);
  });
};
exports.getExamSubmissions = (req, res) => {
  const { exam_id } = req.params;

  const query = `
    SELECT
      a.attempt_id,
      u.name AS student_name,
      a.score,
      a.status,
      a.start_time,
      a.end_time
    FROM attempts a
    JOIN users u ON a.student_id = u.user_id
    WHERE a.exam_id = ?
  `;

  db.query(query, [exam_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch submissions" });
    }

    res.json(results);
  });
};
exports.logViolation = (req, res) => {
  const { attempt_id, violation_type } = req.body;

  if (!attempt_id || !violation_type) {
    return res.status(400).json({ message: "attempt_id and violation_type required" });
  }

  const user_id = req.user.user_id;

  isAttemptActive(attempt_id, user_id, (err, isActive, message) => {
    if (err) {
      return res.status(500).json({ message: "Attempt status check failed" });
    }

    if (!isActive) {
      return res.status(403).json({ message });
    }
    // 0️⃣ Check attempt status
  const statusSql = `
    SELECT status
    FROM attempts
    WHERE attempt_id = ?
  `;

    db.query(statusSql, [attempt_id], (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (rows.length === 0)
        return res.status(404).json({ message: "Attempt not found" });

      const status = rows[0].status;

      if (status !== "ONGOING") {
        return res.json({
          message: "Test already ended. Violation ignored.",
          status
        });
      }

      // 1️⃣ Insert violation
      const insertSql = `
        INSERT INTO violation_logs (attempt_id, violation_type)
        VALUES (?, ?)
      `;

      db.query(insertSql, [attempt_id, violation_type], (err2) => {
        if (err2) {
          console.error(err2);
          return res.status(500).json({ message: "Failed to log violation" });
        }

        // 2️⃣ Count violations
        const countSql = `
          SELECT COUNT(*) AS total
          FROM violation_logs
          WHERE attempt_id = ?
        `;

        db.query(countSql, [attempt_id], (err3, result) => {
          if (err3) {
            console.error(err3);
            return res.status(500).json({ message: "Failed to count violations" });
          }

          const violations = result[0].total;
          const integrityScore = Math.max(100 - violations * 20, 0);

          // 3️⃣ Update integrity score
          const updateIntegritySql = `
            UPDATE attempts
            SET integrity_score = ?
            WHERE attempt_id = ?
          `;

          db.query(updateIntegritySql, [integrityScore, attempt_id]);

          // 4️⃣ Auto-submit if limit exceeded
          if (violations >= 3) {
            const autoSubmitSql = `
              UPDATE attempts
              SET status = 'AUTO_SUBMITTED', end_time = NOW()
              WHERE attempt_id = ? AND status = 'ONGOING'
            `;

            db.query(autoSubmitSql, [attempt_id], (err4) => {
              if (err4) {
                console.error(err4);
                return res.status(500).json({ message: "Failed to auto-submit test" });
              }

              return res.json({
                message: "Violation logged. Test auto-submitted.",
                violations,
                integrity_score: integrityScore,
                auto_submitted: true
              });
            });
          } else {
            return res.json({
              message: "Violation logged",
              violations,
              integrity_score: integrityScore,
              auto_submitted: false
            });
          }
        });
      });
    });

  });
};
exports.getResult = (req, res) => {
  const { attempt_id } = req.params;
  const { user_id, role } = req.user;

  if (!attempt_id) {
    return res.status(400).json({ message: "attempt_id required" });
  }

  // 1️⃣ Get attempt info
  const attemptSql = `
    SELECT 
      a.attempt_id,
      a.exam_id,
      a.student_id,
      a.status,
      a.score,
      a.integrity_score,
      a.start_time,
      a.end_time,
      e.results_published
    FROM attempts a
    JOIN exams e ON a.exam_id = e.exam_id
    WHERE a.attempt_id = ?
  `;

  db.query(attemptSql, [attempt_id], (err, attemptResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch attempt" });
    }

    if (attemptResult.length === 0) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    const attempt = attemptResult[0];

    // 🔐 SECURITY CHECK
    if (role === "STUDENT"){
      if (attempt.student_id !== user_id) {
        return res.status(403).json({ message: "Access denied" });
      }

      if(!attempt.results_published) {
        return res.status(403).json({ message: "Results not published yet" });
      }

      if(attempt.status === "ONGOING") {
        return res.status(403).json({ message: "Test is still ongoing" });
      }
    } 
    // 2️⃣ Count violations
    const violationSql = `
      SELECT COUNT(*) AS violations
      FROM violation_logs
      WHERE attempt_id = ?
    `;

    db.query(violationSql, [attempt_id], (err2, vResult) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ message: "Failed to count violations" });
      }

      const violations = vResult[0].violations;

      // 3️⃣ Count answered questions
      const answeredSql = `
        SELECT COUNT(*) AS answered
        FROM answers
        WHERE attempt_id = ?
      `;

      db.query(answeredSql, [attempt_id], (err3, aResult) => {
        if (err3) {
          console.error(err3);
          return res.status(500).json({ message: "Failed to count answers" });
        }

        const answered = aResult[0].answered;

        // 4️⃣ Count total questions & max marks
        const questionSql = `
          SELECT COUNT(*) AS total_questions,
                 SUM(marks) AS max_marks
          FROM questions
          WHERE exam_id = ?
        `;

        db.query(questionSql, [attempt.exam_id], (err4, qResult) => {
          if (err4) {
            console.error(err4);
            return res.status(500).json({ message: "Failed to fetch exam stats" });
          }

          const totalQuestions = qResult[0].total_questions;
          const maxMarks = qResult[0].max_marks || 0;

          // ✅ Final Response
          res.json({
            attempt_id: attempt.attempt_id,
            exam_id: attempt.exam_id,
            student_id: attempt.student_id,
            status: attempt.status,
            score: attempt.score,
            integrity_score: attempt.integrity_score,
            violations,
            total_questions: totalQuestions,
            answered_questions: answered,
            max_marks: maxMarks,
            start_time: attempt.start_time,
            end_time: attempt.end_time
          });
        });
      });
    });
  });
};
exports.getLeaderboard = (req, res) => {
  const { exam_id } = req.params;

  const sql = `
    SELECT 
      u.user_id AS student_id,
      u.name,
      a.score,
      a.integrity_score,
      a.end_time,
      e.total_marks
    FROM attempts a
    JOIN users u ON a.student_id = u.user_id
    JOIN exams e ON a.exam_id = e.exam_id
    WHERE a.exam_id = ?
      AND a.status IN ('COMPLETED', 'AUTO_SUBMITTED')
    ORDER BY 
      a.score DESC,
      a.integrity_score DESC,
      a.end_time ASC
  `;

  db.query(sql, [exam_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch leaderboard" });
    }

    // Add rank manually
    let rank = 1;
    let lastScore = null;
    let lastIntegrity = null;

    const leaderboard = results.map((row, index) => {
      if (
        row.score !== lastScore ||
        row.integrity_score !== lastIntegrity
      ) {
        rank = index + 1;
      }

      lastScore = row.score;
      lastIntegrity = row.integrity_score;

      return {
        rank,
        student_id: row.student_id,
        name: row.name,
        score: row.score,
        integrity_score: row.integrity_score,
        total_marks: row.total_marks
      };
    });

    res.json(leaderboard);
  });
};
exports.getExamResultsForTeacher = (req, res) => {
  const { exam_id } = req.params;

  const sql = `
    SELECT
      a.attempt_id,
      u.user_id AS student_id,
      u.name AS student_name,
      a.status,
      a.score,
      a.integrity_score,
      COUNT(v.log_id) AS violations,
      a.start_time,
      a.end_time
    FROM attempts a
    JOIN users u ON a.student_id = u.user_id
    LEFT JOIN violation_logs v ON a.attempt_id = v.attempt_id
    WHERE a.exam_id = ?
    GROUP BY a.attempt_id
    ORDER BY a.start_time ASC
  `;

  db.query(sql, [exam_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch exam results" });
    }

    res.json(results);
  });
};
exports.publishResults = (req, res) => {
  const { exam_id, publish } = req.body;
  const publishStatus = publish !== false;

  const sql = `
    UPDATE exams
    SET results_published = ?
    WHERE exam_id = ?
  `;

  db.query(sql, [publishStatus, exam_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to update results status" });
    }

    // Send emails to all students who attempted this exam (only when publishing, not unpublishing)
    if (publishStatus) {
      const studentsSql = `
        SELECT u.name, u.email, e.title
        FROM attempts a
        JOIN users u ON a.student_id = u.user_id
        JOIN exams e ON a.exam_id = e.exam_id
        WHERE a.exam_id = ? AND a.status IN ('COMPLETED', 'AUTO_SUBMITTED')
      `;
      db.query(studentsSql, [exam_id], (err2, students) => {
        if (!err2 && students.length > 0) {
          const examTitle = students[0].title;
          students.forEach(s => {
            sendResultsPublishedEmail(s.name, s.email, examTitle)
              .catch(err => console.error('Results email failed:', err));
          });
        }
      });
    }

    res.json({ message: `Results ${publishStatus ? 'published' : 'unpublished'} successfully` });
  });
};
exports.getViolationsForAttempt = (req, res) => {
  const { attempt_id } = req.params;

  const sql = `
    SELECT violation_type, timestamp
    FROM violation_logs
    WHERE attempt_id = ?
    ORDER BY timestamp ASC
  `;

  db.query(sql, [attempt_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch violations" });
    }

    res.json(results);
  });
};
exports.getExamSummary = (req, res) => {
  const { exam_id } = req.params;

  const sql = `
    SELECT
      COUNT(*) AS total_attempts,
      AVG(score) AS avg_score,
      AVG(integrity_score) AS avg_integrity,
      SUM(status = 'AUTO_SUBMITTED') AS auto_submitted
    FROM attempts
    WHERE exam_id = ?
  `;

  db.query(sql, [exam_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch summary" });
    }

    res.json(result[0]);
  });
};
exports.requestReevaluation = (req, res) => {
  const { attempt_id, reason } = req.body;
  const student_id = req.user.user_id;

  const sql = `
    INSERT INTO reevaluation_requests (attempt_id, student_id, reason)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [attempt_id, student_id, reason], (err) => {
    if (err) return res.status(500).json({ message: "Request failed" });

    res.json({ message: "Re-evaluation request submitted" });
  });
};
exports.getReevaluationRequests = (req, res) => {
  const { exam_id } = req.params;

  const sql = `
    SELECT r.*, u.name
    FROM reevaluation_requests r
    JOIN attempts a ON r.attempt_id = a.attempt_id
    JOIN users u ON r.student_id = u.user_id
    WHERE a.exam_id = ?
  `;

  db.query(sql, [exam_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Failed" });
    res.json(results);
  });
};
exports.getExamAnalytics = (req, res) => {
  const { exam_id } = req.params;

  const sql = `
    SELECT
      COUNT(*) AS total_attempts,
      AVG(score) AS avg_score,
      MAX(score) AS max_score,
      MIN(score) AS min_score
    FROM attempts
    WHERE exam_id = ?
    AND status IN ('COMPLETED', 'AUTO_SUBMITTED')
  `;

  db.query(sql, [exam_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Analytics failed" });
    res.json(result[0]);
  });
};

exports.getStudentAnalytics = (req, res) => {
  const student_id = req.user.user_id;

  // Overall stats
  const overallSql = `
    SELECT
      COUNT(*) AS totalCompleted,
      ROUND(AVG((a.score / e.total_marks) * 100)) AS avgScore
    FROM attempts a
    JOIN exams e ON a.exam_id = e.exam_id
    WHERE a.student_id = ?
      AND a.status IN ('COMPLETED', 'AUTO_SUBMITTED')
      AND a.score IS NOT NULL
      AND e.results_published = 1
  `;

  // Per-course stats
  const coursesSql = `
    SELECT
      c.course_id,
      c.course_name,
      COUNT(DISTINCT a.attempt_id) AS examCount,
      ROUND(AVG((a.score / e.total_marks) * 100)) AS avg,
      ROUND(AVG((class_avg.class_avg_score))) AS classAvg
    FROM attempts a
    JOIN exams e ON a.exam_id = e.exam_id
    JOIN courses c ON e.course_id = c.course_id
    LEFT JOIN (
      SELECT e2.course_id, AVG((a2.score / e2.total_marks) * 100) AS class_avg_score
      FROM attempts a2
      JOIN exams e2 ON a2.exam_id = e2.exam_id
      WHERE a2.status IN ('COMPLETED', 'AUTO_SUBMITTED') AND a2.score IS NOT NULL AND e2.results_published = 1
      GROUP BY e2.course_id
    ) class_avg ON class_avg.course_id = c.course_id
    WHERE a.student_id = ?
      AND a.status IN ('COMPLETED', 'AUTO_SUBMITTED')
      AND a.score IS NOT NULL
      AND e.results_published = 1
    GROUP BY c.course_id
    ORDER BY avg DESC
  `;

  // Per-test history for each course
  const testsSql = `
    SELECT
      e.course_id,
      e.title AS name,
      ROUND((a.score / e.total_marks) * 100) AS score,
      TIMESTAMPDIFF(MINUTE, a.start_time, a.end_time) AS duration_minutes
    FROM attempts a
    JOIN exams e ON a.exam_id = e.exam_id
    WHERE a.student_id = ?
      AND a.status IN ('COMPLETED', 'AUTO_SUBMITTED')
      AND a.score IS NOT NULL
      AND e.results_published = 1
    ORDER BY a.end_time ASC
  `;

  db.query(overallSql, [student_id], (err, overallResult) => {
    if (err) return res.status(500).json({ message: "Failed to fetch overall stats" });

    db.query(coursesSql, [student_id], (err2, coursesResult) => {
      if (err2) return res.status(500).json({ message: "Failed to fetch course stats" });

      db.query(testsSql, [student_id], (err3, testsResult) => {
        if (err3) return res.status(500).json({ message: "Failed to fetch test history" });

        // Group tests by course_id
        const testsByCourse = {};
        testsResult.forEach(t => {
          if (!testsByCourse[t.course_id]) testsByCourse[t.course_id] = [];
          testsByCourse[t.course_id].push({
            name: t.name,
            score: t.score,
            time: t.duration_minutes ? `${t.duration_minutes}m` : 'N/A'
          });
        });

        // Attach tests to courses and compute trend/velocity
        const courses = coursesResult.map(c => {
          const tests = testsByCourse[c.course_id] || [];
          let trend = 'positive';
          let velocity = '+0%';
          if (tests.length >= 2) {
            const first = tests[0].score;
            const last = tests[tests.length - 1].score;
            const diff = last - first;
            trend = diff >= 0 ? 'positive' : 'negative';
            velocity = `${diff >= 0 ? '+' : ''}${diff}%`;
          }
          return {
            id: c.course_id,
            title: c.course_name,
            examCount: c.examCount,
            avg: c.avg || 0,
            classAvg: c.classAvg || 0,
            trend,
            velocity,
            tests
          };
        });

        const overall = overallResult[0];
        const coreStrength = courses.length > 0 ? courses[0].title : 'N/A';

        res.json({
          totalCompleted: overall.totalCompleted || 0,
          avgScore: overall.avgScore || 0,
          coreStrength,
          courses
        });
      });
    });
  });
};

exports.getGlobalLeaderboard = (req, res) => {
  const sql = `
    SELECT 
      u.user_id AS student_id,
      u.name,
      u.email,
      COUNT(DISTINCT a.exam_id) AS total_exams,
      ROUND(AVG((a.score / e.total_marks) * 100)) AS avg_score
    FROM users u
    JOIN attempts a ON u.user_id = a.student_id
    JOIN exams e ON a.exam_id = e.exam_id
    WHERE u.role = 'STUDENT'
      AND a.status IN ('COMPLETED', 'AUTO_SUBMITTED')
      AND a.score IS NOT NULL
    GROUP BY u.user_id
    HAVING total_exams > 0
    ORDER BY avg_score DESC, total_exams DESC
    LIMIT 50
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
    res.json(results);
  });
};