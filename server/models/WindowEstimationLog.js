const mongoose = require("mongoose");

const WindowEstimationLogSchema = new mongoose.Schema({
  test_id: { type: String, required: true },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  event: {
    type: String,
    enum: ["focus", "blur", "tab_switch"],
    required: true,
  },
  details: { type: Object }, // e.g., { url: string, timestamp: Date }
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model(
  "WindowEstimationLog",
  WindowEstimationLogSchema
);
