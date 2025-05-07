const mongoose = require("mongoose");

const ProctoringLogSchema = new mongoose.Schema({
  test_id: { type: String, required: true },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  event: {
    type: String,
    enum: ["video_feed", "audio_feed", "other"],
    required: true,
  },
  details: { type: Object },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ProctoringLog", ProctoringLogSchema);
