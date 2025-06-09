const mongoose = require("mongoose");

const proctoringLogSchema = new mongoose.Schema({
  test_id: {
    type: String,
    required: true,
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  event: {
    type: String,
    required: true,
  },
  details: {
    type: Object,
    default: {},
  },
  snapshot_url: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ProctoringLog", proctoringLogSchema);
