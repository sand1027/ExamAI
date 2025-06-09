const mongoose = require("mongoose");

const signalingLogSchema = new mongoose.Schema({
  test_id: { type: String, required: true },
  student_id: { type: String, required: true },
  type: {
    type: String,
    enum: ["offer", "answer", "ice-candidate", "request-new-offer"],
    required: true,
  },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SignalingLog", signalingLogSchema);
