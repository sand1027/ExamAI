const mongoose = require("mongoose");

const SupportSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ["report", "contact"], required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Support", SupportSchema);
