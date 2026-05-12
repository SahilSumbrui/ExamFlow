const db = require("../config/db");

exports.createQuestion = (req, res) => {
  const { exam_id, type, question_text, marks, options } = req.body;

  if (!exam_id || !type || !question_text || !marks) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const questionSql = `
    INSERT INTO questions (exam_id, type, question_text, marks)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    questionSql,
    [exam_id, type, question_text, marks],
    (err, questionResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to add question" });
      }

      const question_id = questionResult.insertId;

      // If MCQ, insert options
      if (type === "MCQ" && Array.isArray(options)) {
        const optionSql = `
          INSERT INTO options (question_id, option_text, is_correct)
          VALUES ?
        `;

        const optionValues = options.map(opt => [
          question_id,
          opt.option_text,
          opt.is_correct
        ]);

        db.query(optionSql, [optionValues], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to add options" });
          }

          return res.status(201).json({
            message: "MCQ question added successfully",
            question_id
          });
        });
      } else {
        // Descriptive question
        return res.status(201).json({
          message: "Descriptive question added successfully",
          question_id
        });
      }
    }
  );
};

exports.deleteQuestion = (req, res) => {
  const { question_id } = req.params;

  // 1. First, delete all options linked to this question
  const deleteOptionsSql = `DELETE FROM options WHERE question_id = ?`;

  db.query(deleteOptionsSql, [question_id], (err) => {
    if (err) {
      console.error("Error deleting options:", err);
      return res.status(500).json({ message: "Failed to delete associated options" });
    }

    // 2. Now that the children (options) are gone, delete the parent (question)
    const deleteQuestionSql = `DELETE FROM questions WHERE question_id = ?`;

    db.query(deleteQuestionSql, [question_id], (err, result) => {
      if (err) {
        console.error("Error deleting question:", err);
        return res.status(500).json({ message: "Failed to delete question" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Question not found" });
      }

      res.json({ message: "Question and its options deleted successfully" });
    });
  });
};

exports.updateQuestion = (req, res) => {
  const { question_id } = req.params;
  const { type, question_text, marks, options } = req.body;

  const sql = `UPDATE questions SET type = ?, question_text = ?, marks = ? WHERE question_id = ?`;

  db.query(sql, [type, question_text, marks, question_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to update question" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (type === 'MCQ' && Array.isArray(options)) {
      db.query('DELETE FROM options WHERE question_id = ?', [question_id], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Failed to update options" });
        }

        const optionSql = `INSERT INTO options (question_id, option_text, is_correct) VALUES ?`;
        const optionValues = options.map(opt => [question_id, opt.option_text, opt.is_correct]);

        db.query(optionSql, [optionValues], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to update options" });
          }
          res.json({ message: "Question updated successfully" });
        });
      });
    } else {
      res.json({ message: "Question updated successfully" });
    }
  });
};

exports.getQuestionById = (req, res) => {
  const { question_id } = req.params;

  const sql = `
    SELECT q.question_id, q.type, q.question_text, q.marks,
           o.option_id, o.option_text, o.is_correct
    FROM questions q
    LEFT JOIN options o ON q.question_id = o.question_id
    WHERE q.question_id = ?
  `;

  db.query(sql, [question_id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch question" });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: "Question not found" });
    }

    const question = {
      question_id: rows[0].question_id,
      type: rows[0].type,
      question_text: rows[0].question_text,
      marks: rows[0].marks,
      options: []
    };

    if (rows[0].option_id) {
      question.options = rows.map(row => ({
        option_id: row.option_id,
        option_text: row.option_text,
        is_correct: row.is_correct
      }));
    }

    res.json(question);
  });
};
