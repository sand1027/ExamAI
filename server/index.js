const express = require("express");
const { PeerServer } = require("peer");
const connectDB = require("./config/db");
const cors = require("cors");
const dotenv = require("dotenv");
const adminRoutes = require("./routes/adminRoutes");
const pdfRoutes = require("./routes/pdfRoutes");

dotenv.config();
connectDB();

if (!process.env.JWT_SECRET) {
  console.error("[Server] JWT_SECRET is not defined in .env");
  process.exit(1);
}

const app = express();

// Set up PeerJS server (optional for production; comment out for development using cloud server)
const peerServer = PeerServer({
  port: 9000,
  path: "/peerjs",
  debug: true,
});

peerServer.on("connection", (client) => {
  console.log("[PeerServer] Client connected:", client.id);
});

peerServer.on("disconnect", (client) => {
  console.log("[PeerServer] Client disconnected:", client.id);
});

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/tests", require("./routes/tests"));
app.use("/api/student", require("./routes/student"));
app.use("/api/proctor", require("./routes/proctor"));
app.use("/api/support", require("./routes/support"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/admin/proctal", adminRoutes, pdfRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[Server] Running on port ${PORT}`));
