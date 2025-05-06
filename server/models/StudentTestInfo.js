const mongoose = require("mongoose");

const StudentTestInfoSchema = new mongoose.Schema({
  test_id: { type: String, required: true },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  start_time: { type: Date },
  end_time: { type: Date },
  status: {
    type: String,
    enum: ["started", "submitted", "incomplete"],
    default: "started",
  },
  bookmarked_questions: [{ type: Number }], // QIDs bookmarked by student
});

module.exports = mongoose.model("StudentTestInfo", StudentTestInfoSchema);
