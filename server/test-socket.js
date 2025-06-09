const io = require("socket.io-client");

const API_BASE_URL = "http://localhost:5000";
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MWZhOTA5ZWVkYjcwMmMzODcyM2U4ZiIsInVzZXJfdHlwZSI6InN0dWRlbnQiLCJpYXQiOjE3NDY5MDU0MjgsImV4cCI6MTc0NjkwOTAyOH0.UIAZS32UpX5LZO56ACnCD4g6x1bz9LGhHTHSd75neVU"; // Replace with a valid JWT from localStorage.getItem('token')

if (
  !token ||
  token ===
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MWZhOTA5ZWVkYjcwMmMzODcyM2U4ZiIsInVzZXJfdHlwZSI6InN0dWRlbnQiLCJpYXQiOjE3NDY5MDU0MjgsImV4cCI6MTc0NjkwOTAyOH0.UIAZS32UpX5LZO56ACnCD4g6x1bz9LGhHTHSd75neVU"
) {
  console.error("Error: Please set a valid JWT token in test-socket.js");
  process.exit(1);
}

console.log(
  "Attempting connection with token:",
  token.substring(0, 10) + "..."
);

const socket = io(API_BASE_URL, {
  transports: ["websocket", "polling"],
  query: { role: "professor" },
  auth: { token },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  forceNew: true,
});

socket.on("connect", () => {
  console.log("Connected:", {
    socketId: socket.id,
    transport: socket.io.engine.transport.name,
  });
  socket.emit("join-room", { test_id: "a93fdd1a-af6d-4d73-852c-974c9c197032" });
});

socket.on("connect_error", (err) => {
  console.error("Connect error:", {
    message: err.message,
    description: err.description,
    context: err.context,
    stack: err.stack,
    transport: socket.io.engine.transport?.name,
  });
});

socket.on("error", (err) => {
  console.error("Socket error:", {
    message: err.message,
    description: err.description,
    context: err.context,
  });
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", {
    reason,
    transport: socket.io.engine.transport?.name,
  });
});

socket.on("user-joined", (data) => {
  console.log("User joined:", data);
});

socket.io.on("reconnect_attempt", (attempt) => {
  console.log("Reconnect attempt:", {
    attempt,
    transport: socket.io.engine.transport?.name,
  });
});
