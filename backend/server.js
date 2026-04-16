const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const db = require("./config/db");

app.use(cors());
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
