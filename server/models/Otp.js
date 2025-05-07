const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  user_type: { type: String, required: true, enum: ["student", "professor"] },
  user_image: { type: String },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // Auto-delete after 10 minutes
});

module.exports = mongoose.model("Otp", otpSchema);
