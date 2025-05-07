const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const dotenv = require("dotenv");
const aiRoutes = require("./routes/ai");
const auth = require("./middleware/auth");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/tests", require("./routes/tests"));
app.use("/api/student", require("./routes/student"));
app.use("/api/proctor", require("./routes/proctor"));
app.use("/api/support", require("./routes/support"));
app.use("/api/ai", auth(["professor"]), aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
