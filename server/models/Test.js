const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema({
  test_id: { type: String, required: true, unique: true },
  professor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  test_type: {
    type: String,
    enum: ["objective", "subjective", "practical"],
    required: true,
  },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes
  password: { type: String, required: true },
  proctor_type: { type: String, enum: ["0", "1"], required: true }, // 0: auto, 1: live
  negative_marking: { type: Boolean, default: false },
  compiler: { type: String }, // for practical tests
  long_test_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LongTest",
    default: null,
  }, // Reference for subjective
  practical_test_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PracticalTest",
    default: null,
  }, // Reference for practical
});

module.exports = mongoose.model("Test", TestSchema);
