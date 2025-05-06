const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/email");
const { verifyFace } = require("../utils/faceRecognition");
const auth = require("../middleware/auth");

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, user_type, user_image } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const tempUser = {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      user_type,
      user_image,
      otp,
    };

    await sendEmail(email, "Verify your email", `Your OTP is ${otp}`);
    res.json({ tempUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, tempUser } = req.body;
    if (tempUser.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    const user = new User(tempUser);
    await user.save();
    res.json({ message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password, user_type, user_image, forceLogin } = req.body;
    const user = await User.findOne({ email, user_type });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    if (user.user_login && !forceLogin)
      return res.status(400).json({ message: "User already logged in" });

    // Optional: Uncomment to enable face verification
    // const isFaceMatch = await verifyFace(user_image, user.user_image);
    // if (!isFaceMatch)
    //   return res.status(400).json({ message: "Face verification failed" });

    user.user_login = true;
    await user.save();

    const token = jwt.sign(
      { id: user._id, user_type },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, user_type },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Logout
router.post("/logout", auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.user_login = false;
    await user.save();
    res.json({ message: "Logged out" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendEmail(
      email,
      "Password Reset",
      `Reset your password: http://localhost:3000/reset-password/${token}`
    );
    res.json({ message: "Reset email sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset Password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Change Password
router.post("/change-password", auth(), async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password incorrect" });

    user.password = await bcrypt.hash(new_password, 10);
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Current User
router.get("/me", auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
