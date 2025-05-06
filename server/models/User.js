const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Recommend hashing with bcrypt
    register_time: { type: Date, default: Date.now },
    user_type: { type: String, required: true, enum: ["student", "professor"] },
    user_image: { type: String }, // URL or base64 string
    user_login: { type: Boolean },
    examcredits: { type: Number, default: 7 },
  },
  {
    timestamps: false, // register_time is managed manually
  }
);

userSchema.index({ email: 1 }); // Index for fast email lookups

module.exports = mongoose.model("User", userSchema);
