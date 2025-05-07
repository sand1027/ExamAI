// routes/ai.js
const express = require("express");
const router = express.Router();
const { generateQuestions } = require("../controllers/ai");

router.post("/generate-questions", generateQuestions);

module.exports = router;
