const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const { generateOTP } = require("../utils/helpers");

const transporter = nodemailer.createTransport({
  host: "smtp.stackmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

exports.register = async (req, res) => {
  const { name, email, password, user_type, user_image } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const otp = generateOTP();
    const tempUser = {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      user_type,
      user_image,
      otp,
    };

    await transporter.sendMail({
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: "MyProctor.ai - OTP Verification",
      text: `Your OTP Verification code is ${otp}.`,
    });

    res.json({ message: "OTP sent", tempUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp, tempUser } = req.body;
  if (otp !== tempUser.otp)
    return res.status(400).json({ message: "Invalid OTP" });

  try {
    const user = new User(tempUser);
    await user.save();
    res.json({ message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password, user_type, user_image } = req.body;
  try {
    const user = await User.findOne({ email, user_type, user_login: false });
    if (!user)
      return res
        .status(400)
        .json({ message: "User not found or already logged in" });

    // Simulate DeepFace.verify with placeholder (replace with face-api.js if needed)
    const isImageVerified = true; // Placeholder for facial recognition
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch || !isImageVerified) {
      return res
        .status(400)
        .json({ message: "Invalid credentials or image not verified" });
    }

    await User.updateOne({ _id: user._id }, { user_login: true });
    const token = jwt.sign(
      { id: user._id, email, user_type },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({
      token,
      user: { id: user._id, name: user.name, email, user_type },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    await User.updateOne({ _id: req.user.id }, { user_login: false });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
