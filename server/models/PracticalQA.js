const mongoose = require("mongoose");

const PracticalQASchema = new mongoose.Schema({
  practical_test_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PracticalTest",
    required: true,
  },
  qid: {
    type: Number,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  test_cases: [
    {
      input: String,
      expected_output: String,
      marks: { type: Number, default: 0 },
    },
  ],
  max_marks: {
    type: Number,
    required: true,
  },
  studentAnswers: [
    {
      student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      answer: {
        type: String, // Student's code
        required: true,
      },
      input: {
        type: String, // Student's input
        default: "",
      },
      output: {
        type: String, // Execution output
        default: "",
      },
      language: {
        type: String, // Selected compiler (e.g., 'javascript', 'python')
        required: true,
      },
      marks: {
        type: Number,
        default: 0,
      },
      test_results: [
        {
          input: String,
          expected_output: String,
          actual_output: String,
          passed: Boolean,
          error: String,
        },
      ],
      executed: {
        type: Boolean,
        default: false,
      },
      bookmarked: {
        type: Boolean,
        default: false,
      },
      last_saved: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("PracticalQA", PracticalQASchema);
