const mongoose = require("mongoose");

const LongTestSchema = new mongoose.Schema({
  test_id: { type: String, required: true, unique: true }, // Matches Test.test_id
  professor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  question_count: { type: Number, required: true },
});

module.exports = mongoose.model("LongTest", LongTestSchema);
