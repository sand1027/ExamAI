const express = require("express");
const router = express.Router();
const axios = require("axios");
const auth = require("../middleware/auth");
const Test = require("../models/Test");
const Question = require("../models/Question");
const LongQA = require("../models/LongQA");
const LongTest = require("../models/LongTest");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");

/**
 * @route   POST /api/ai/generate-questions
 * @desc    Generate test questions using OpenRouter.ai API
 * @access  Private (Professor only)
 */
router.post("/generate-questions", auth(["professor"]), async (req, res) => {
  try {
    const {
      subject,
      topic,
      type,
      count = 5,
      duration,
      start_date,
      start_time,
      end_date,
      end_time,
      password,
      proctor_type,
    } = req.body;

    // Validate input
    if (!subject || !topic || !type) {
      return res
        .status(400)
        .json({ message: "Subject, topic, and type are required" });
    }
    if (!["objective", "subjective"].includes(type)) {
      return res
        .status(400)
        .json({ message: 'Type must be "objective" or "subjective"' });
    }

    // Get OpenRouter.ai API key from environment variable
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ message: "AI service configuration error" });
    }

    // Create appropriate prompt based on question type
    let prompt = "";
    if (type === "objective") {
      prompt = `Generate ${count} multiple choice questions about ${topic} in ${subject}. 
      For each question, provide the question text followed by 4 options labeled A, B, C, and D, 
      with exactly one correct answer. Indicate the correct answer at the end of each question.
      Format each question as:
      Q: [question]
      A: [option]
      B: [option]
      C: [option]
      D: [option]
      Correct: [letter]`;
    } else {
      prompt = `Generate ${count} subjective (essay-type) questions about ${topic} in ${subject}. 
      Each question should require analytical thinking and detailed explanations. 
      Also provide brief guidance on what a good answer should include.
      Format each as:
      Q: [question]
      Guidance: [brief points on what a good answer should cover]`;
    }

    // Make request to OpenRouter.ai API
    const openRouterResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3.1-8b-instruct", // Replace with desired model (e.g., 'anthropic/claude-3.5-sonnet')
        messages: [
          {
            role: "system",
            content: "You are an educational test question generator.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:3000", // Your frontend URL
          "X-Title": "QuizApp", // Optional: App name
        },
      }
    );

    // Process the response from OpenRouter.ai
    if (
      openRouterResponse.data &&
      openRouterResponse.data.choices &&
      openRouterResponse.data.choices[0]
    ) {
      const rawText = openRouterResponse.data.choices[0].message.content;
      const questions = parseQuestionsFromText(rawText, type);

      // Create a new test
      const test_id = uuidv4();
      const test = new Test({
        test_id,
        professor_id: req.user.id,
        subject,
        topic,
        test_type: type,
        start_date: new Date(`${start_date}T${start_time}`),
        end_date: new Date(`${end_date}T${end_time}`),
        duration,
        password,
        proctor_type,
      });

      if (type === "subjective") {
        const longTest = new LongTest({
          test_id,
          professor_id: req.user.id,
          subject,
          topic,
          question_count: questions.length,
        });
        test.long_test_id = longTest._id;
        await longTest.save();
      }

      await test.save();

      // Store questions in appropriate model
      if (type === "objective") {
        const objectiveQuestions = questions.map((q, index) => ({
          test_id,
          qid: index + 1,
          question: q.question,
          options: q.options,
          answer: q.correct,
        }));
        await Question.insertMany(objectiveQuestions);
      } else {
        const subjectiveQuestions = questions.map((q, index) => ({
          long_test_id: test.long_test_id,
          qid: index + 1,
          question: q.question,
          max_marks: 10, // Default max_marks, adjust as needed
        }));
        await LongQA.insertMany(subjectiveQuestions);
      }

      // Decrement professor's exam credits
      const user = await User.findById(req.user.id);
      if (user.exam_credits < 1) {
        return res.status(400).json({ message: "Insufficient credits" });
      }
      user.exam_credits -= 1;
      await user.save();

      return res.json({ test_id, questions });
    } else {
      console.error("Invalid OpenRouter.ai response:", openRouterResponse.data);
      return res.status(500).json({ message: "Failed to generate questions" });
    }
  } catch (error) {
    console.error("AI question generation error:", error);
    return res.status(500).json({
      message:
        error.response?.data?.error?.message || "Failed to generate questions",
    });
  }
});

/**
 * Helper function to parse question text into a structured format
 */
function parseQuestionsFromText(text, type) {
  const questions = [];
  const segments = text
    .split(/\n(?=Q:)/)
    .map((segment) => segment.trim())
    .filter((segment) => segment);

  if (type === "objective") {
    segments.forEach((segment) => {
      const lines = segment.split("\n").map((line) => line.trim());
      const questionLine = lines.find((line) => line.startsWith("Q:"));
      const correctLine = lines.find((line) => line.startsWith("Correct:"));

      if (!questionLine || !correctLine) {
        console.error("Skipping invalid question segment:", segment);
        return; // Skip this segment if question or correct answer is missing
      }

      const question = questionLine.replace("Q:", "").trim();
      const options = {};
      const optionLines = lines.filter((line) => /^[A-D]:/.test(line));
      optionLines.forEach((line) => {
        const [key, value] = line.split(":").map((part) => part.trim());
        options[key.toLowerCase()] = value;
      });

      const correct = correctLine.replace("Correct:", "").trim().toLowerCase();
      if (question && Object.keys(options).length === 4 && correct) {
        questions.push({ question, options, correct });
      } else {
        console.error("Skipping invalid objective question:", segment);
      }
    });
  } else {
    segments.forEach((segment) => {
      const lines = segment.split("\n").map((line) => line.trim());
      const questionLine = lines.find((line) => line.startsWith("Q:"));
      const guidanceLine = lines.find((line) => line.startsWith("Guidance:"));

      if (!questionLine || !guidanceLine) {
        console.error("Skipping invalid subjective question segment:", segment);
        return; // Skip this segment if question or guidance is missing
      }

      const question = questionLine.replace("Q:", "").trim();
      const guidance = guidanceLine.replace("Guidance:", "").trim();
      if (question && guidance) {
        questions.push({ question, guidance });
      } else {
        console.error("Skipping invalid subjective question:", segment);
      }
    });
  }

  return questions;
}

module.exports = router;
