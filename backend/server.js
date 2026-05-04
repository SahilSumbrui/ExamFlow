const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const db = require("./config/db");

app.use(cors({ origin: "*" }));
app.use(express.json());

const examRoutes = require("./routes/examRoutes");

app.use("/api/exams", examRoutes); 

app.use("/api", require("./routes/testRoutes"));

app.use("/api/questions", require("./routes/questionRoutes"));

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/admin", require("./routes/adminRoutes"));

app.use("/api/courses", require("./routes/courseRoutes"));

// Server
const PORT = process.env.PORT || 5000;
app.get("/test-db", (req, res) => {
  db.query("SELECT * FROM users LIMIT 5", (err, results) => {
    if (err) {
      console.error("Database query failed:", err);
      res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});