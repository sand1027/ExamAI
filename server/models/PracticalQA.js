const mongoose = require("mongoose");

const PracticalQASchema = new mongoose.Schema({
  practical_test_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PracticalTest",
    required: true,
  },
  qid: { type: Number, required: true },
  question: { type: String, required: true },
  test_cases: [{ input: String, expected_output: String }],
  max_marks: { type: Number, required: true },
});

module.exports = mongoose.model("PracticalQA", PracticalQASchema);
