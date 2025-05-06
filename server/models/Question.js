const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  test_id: { type: String, required: true },
  qid: { type: Number, required: true },
  question: { type: String, required: true },
  options: {
    a: { type: String, required: true },
    b: { type: String, required: true },
    c: { type: String, required: true },
    d: { type: String, required: true },
  },
  answer: { type: String, required: true },
});

module.exports = mongoose.model("Question", QuestionSchema);
