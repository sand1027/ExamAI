const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    register_time: { type: Date, default: Date.now },
    user_type: { type: String, required: true, enum: ["student", "professor"] },
    user_image: { type: String },
    user_login: { type: Boolean },
    examcredits: { type: Number, default: 7 },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("User", userSchema);
