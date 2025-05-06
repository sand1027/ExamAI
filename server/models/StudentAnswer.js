const mongoose = require("mongoose");

const StudentAnswerSchema = new mongoose.Schema({
  test_id: { type: String, required: true },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  qid: { type: Number, required: true },
  answer: { type: String }, // Objective (option), Subjective (text), Practical (code)
  marks: { type: Number, default: 0 },
  submitted_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("StudentAnswer", StudentAnswerSchema);
