const express = require("express");
const router = express.Router();
const Support = require("../models/Support");
const auth = require("../middleware/auth");
const sendEmail = require("../utils/email");

// Report Problem
router.post("/report", auth(), async (req, res) => {
  try {
    const { subject, description } = req.body;
    const support = new Support({
      user_id: req.user.id,
      subject,
      description,
      type: "report",
    });
    await support.save();
    res.json({ message: "Problem reported successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Contact Us
router.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    await sendEmail(
      "admin@example.com",
      "Contact Us",
      `From: ${name} (${email})\nMessage: ${message}`
    );
    res.json({ message: "Message sent successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
