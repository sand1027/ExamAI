const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema({
  test_id: { type: String, required: true },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  total_marks: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Result", ResultSchema);
