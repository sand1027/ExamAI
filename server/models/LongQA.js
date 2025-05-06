const mongoose = require("mongoose");

const LongQASchema = new mongoose.Schema({
  long_test_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LongTest",
    required: true,
  },
  qid: { type: Number, required: true },
  question: { type: String, required: true },
  max_marks: { type: Number, required: true },
});

module.exports = mongoose.model("LongQA", LongQASchema);
