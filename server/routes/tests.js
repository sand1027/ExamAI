const express = require("express");
const router = express.Router();
const Test = require("../models/Test");
const LongTest = require("../models/LongTest");
const PracticalTest = require("../models/PracticalTest");
const Question = require("../models/Question");
const LongQA = require("../models/LongQA");
const PracticalQA = require("../models/PracticalQA");
const Result = require("../models/Result");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { Readable } = require("stream");
const stripe = require("../config/stripe");
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage }).single("doc");

// Create Objective Test
router.post(
  "/create-test-lqa",
  auth(["professor"]),
  upload,
  async (req, res) => {
    try {
      const {
        subject,
        topic,
        start_date,
        start_time,
        end_date,
        end_time,
        duration,
        password,
        proctor_type,
      } = req.body;
      const doc = req.file; // Get the uploaded file from req.file

      // Check for missing required fields
      if (
        !subject ||
        !topic ||
        !start_date ||
        !start_time ||
        !end_date ||
        !end_time ||
        !duration ||
        !password ||
        !proctor_type ||
        !doc
      ) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.exam_credits < 1)
        return res.status(400).json({ message: "Insufficient credits" });

      const test_id = uuidv4();
      const test = new Test({
        test_id,
        professor_id: req.user.id,
        subject,
        topic,
        test_type: "objective",
        start_date: new Date(`${start_date}T${start_time}`),
        end_date: new Date(`${end_date}T${end_time}`),
        duration,
        password,
        proctor_type,
      });

      await test.save();

      // Convert buffer to string and parse CSV manually for better control
      const csvString = doc.buffer.toString("utf8");

      // Parse CSV content manually
      const lines = csvString.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.trim());

      // Create questions array from parsed CSV data
      const questions = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // Skip empty lines

        // Split the line and map to an object
        const row = {};
        const values = lines[i].split(",").map((v) => v.trim());

        // Map values to headers
        headers.forEach((header, index) => {
          if (index < values.length) {
            row[header] = values[index];
          }
        });

        // Debug log the parsed row
        console.log("Parsed row:", row);

        // Map CSV data to question schema
        const questionObj = {
          test_id,
          qid: i,
          question: row["Question"],
          options: {
            a: row["Option A"],
            b: row["Option B"],
            c: row["Option C"],
            d: row["Option D"],
          },
          answer: row["Correct Answer"],
        };

        // Validate that required fields are present
        if (
          questionObj.question &&
          questionObj.options.a &&
          questionObj.options.b &&
          questionObj.options.c &&
          questionObj.options.d &&
          questionObj.answer
        ) {
          questions.push(questionObj);
        } else {
          console.error("Invalid question data:", questionObj);
        }
      }

      // Check if we have valid questions
      if (questions.length === 0) {
        return res.status(400).json({
          message: "No valid questions found in CSV. Please check the format.",
        });
      }

      try {
        // Insert valid questions to database
        await Question.insertMany(questions);
        user.exam_credits -= 1;
        await user.save();
        res.json({ test_id, questionCount: questions.length });
      } catch (err) {
        console.error("Error inserting questions:", err);
        res.status(500).json({
          message: "Error inserting questions into the database",
          error: err.message,
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      res
        .status(500)
        .json({ message: "Unexpected error occurred", error: err.message });
    }
  }
);

// Create Subjective Test
router.post(
  "/create-test-subjective",
  auth(["professor"]),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (user.exam_credits < 1)
        return res.status(400).json({ message: "Insufficient credits" });

      const {
        subject,
        topic,
        start_date,
        start_time,
        end_date,
        end_time,
        duration,
        password,
        proctor_type,
        questions,
      } = req.body;
      const test_id = uuidv4();
      const test = new Test({
        test_id,
        professor_id: req.user.id,
        subject,
        topic,
        test_type: "subjective",
        start_date: new Date(`${start_date}T${start_time}`),
        end_date: new Date(`${end_date}T${end_time}`),
        duration,
        password,
        proctor_type,
      });
      const longTest = new LongTest({
        test_id,
        professor_id: req.user.id,
        subject,
        topic,
        question_count: questions.length,
      });
      test.long_test_id = longTest._id;
      await test.save();
      await longTest.save();

      const longQuestions = questions.map((q, index) => ({
        long_test_id: longTest._id,
        qid: index + 1,
        question: q.question,
        max_marks: q.max_marks,
      }));
      await LongQA.insertMany(longQuestions);

      user.exam_credits -= 1;
      await user.save();
      res.json({ test_id });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Create Practical Test
router.post("/create-test-practical", auth(["professor"]), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.exam_credits < 1)
      return res.status(400).json({ message: "Insufficient credits" });

    const {
      subject,
      topic,
      start_date,
      start_time,
      end_date,
      end_time,
      duration,
      compiler,
      password,
      proctor_type,
      questions,
    } = req.body;
    const test_id = uuidv4();
    const test = new Test({
      test_id,
      professor_id: req.user.id,
      subject,
      topic,
      test_type: "practical",
      start_date: new Date(`${start_date}T${start_time}`),
      end_date: new Date(`${end_date}T${end_time}`),
      duration,
      compiler,
      password,
      proctor_type,
    });
    const practicalTest = new PracticalTest({
      test_id,
      professor_id: req.user.id,
      subject,
      topic,
      compiler,
      question_count: questions.length,
    });
    test.practical_test_id = practicalTest._id;
    await test.save();
    await practicalTest.save();

    const practicalQuestions = questions.map((q, index) => ({
      practical_test_id: practicalTest._id,
      qid: index + 1,
      question: q.question,
      test_cases: q.test_cases,
      max_marks: q.max_marks,
    }));
    await PracticalQA.insertMany(practicalQuestions);

    user.exam_credits -= 1;
    await user.save();
    res.json({ test_id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Test History
router.get("/history", auth(["professor"]), async (req, res) => {
  try {
    const tests = await Test.find({ professor_id: req.user.id }).populate(
      "long_test_id practical_test_id"
    );
    res.json({ exams: tests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Share Exam
router.post("/share", auth(["professor"]), async (req, res) => {
  try {
    const { test_id, emails } = req.body;
    const test = await Test.findOne({ test_id, professor_id: req.user.id });
    if (!test) return res.status(400).json({ message: "Test not found" });

    await sendEmail(
      emails,
      "Exam Details",
      `Test ID: ${test_id}\nPassword: ${test.password}\nSubject: ${test.subject}\nStart: ${test.start_date}`
    );
    res.json({ message: "Exam shared successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Questions
router.get("/questions/:test_id", auth(["professor"]), async (req, res) => {
  try {
    const test = await Test.findOne({
      test_id: req.params.test_id,
      professor_id: req.user.id,
    });
    if (!test) return res.status(400).json({ message: "Test not found" });
    if (test.start_date <= new Date() && test.end_date >= new Date()) {
      return res
        .status(400)
        .json({ message: "Cannot modify questions during exam" });
    }

    let questions;
    if (test.test_type === "objective") {
      questions = await Question.find({ test_id: req.params.test_id });
    } else if (test.test_type === "subjective") {
      questions = await LongQA.find({ long_test_id: test.long_test_id });
    } else if (test.test_type === "practical") {
      questions = await PracticalQA.find({
        practical_test_id: test.practical_test_id,
      });
    }
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Question
router.put(
  "/questions/:test_id/:qid",
  auth(["professor"]),
  async (req, res) => {
    try {
      const test = await Test.findOne({
        test_id: req.params.test_id,
        professor_id: req.user.id,
      });
      if (!test) return res.status(400).json({ message: "Test not found" });
      if (test.start_date <= new Date() && test.end_date >= new Date()) {
        return res
          .status(400)
          .json({ message: "Cannot modify questions during exam" });
      }

      if (test.test_type === "objective") {
        await Question.updateOne(
          { test_id: req.params.test_id, qid: req.params.qid },
          { $set: req.body }
        );
      } else if (test.test_type === "subjective") {
        await LongQA.updateOne(
          { long_test_id: test.long_test_id, qid: req.params.qid },
          { $set: req.body }
        );
      } else if (test.test_type === "practical") {
        await PracticalQA.updateOne(
          { practical_test_id: test.practical_test_id, qid: req.params.qid },
          { $set: req.body }
        );
      }
      res.json({ message: "Question updated" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Delete Question
router.delete(
  "/questions/:test_id/:qid",
  auth(["professor"]),
  async (req, res) => {
    try {
      const test = await Test.findOne({
        test_id: req.params.test_id,
        professor_id: req.user.id,
      });
      if (!test) return res.status(400).json({ message: "Test not found" });
      if (test.start_date <= new Date() && test.end_date >= new Date()) {
        return res
          .status(400)
          .json({ message: "Cannot modify questions during exam" });
      }

      if (test.test_type === "objective") {
        await Question.deleteOne({
          test_id: req.params.test_id,
          qid: req.params.qid,
        });
      } else if (test.test_type === "subjective") {
        await LongQA.deleteOne({
          long_test_id: test.long_test_id,
          qid: req.params.qid,
        });
      } else if (test.test_type === "practical") {
        await PracticalQA.deleteOne({
          practical_test_id: test.practical_test_id,
          qid: req.params.qid,
        });
      }
      res.json({ message: "Question deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Get Students for Marks
router.get("/students/:test_id", auth(["professor"]), async (req, res) => {
  try {
    const test = await Test.findOne({
      test_id: req.params.test_id,
      professor_id: req.user.id,
    });
    if (!test) return res.status(400).json({ message: "Test not found" });

    const results = await Result.find({ test_id: req.params.test_id }).populate(
      "student_id",
      "email"
    );
    const students = results.map((r) => ({
      email: r.student_id.email,
      marks: r.total_marks,
    }));
    res.json({ students });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Insert Marks
router.post("/marks/:test_id", auth(["professor"]), async (req, res) => {
  try {
    const test = await Test.findOne({
      test_id: req.params.test_id,
      professor_id: req.user.id,
    });
    if (!test) return res.status(400).json({ message: "Test not found" });

    for (const [email, marks] of Object.entries(req.body.marks)) {
      const student = await User.findOne({ email, user_type: "student" });
      if (student) {
        await Result.updateOne(
          { test_id: req.params.test_id, student_id: student._id },
          { $set: { total_marks: parseInt(marks) } },
          { upsert: true }
        );
      }
    }
    res.json({ message: "Marks inserted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// View Results
router.post("/view-results", auth(["professor"]), async (req, res) => {
  try {
    const { choosetid } = req.body;
    const test = await Test.findOne({
      test_id: choosetid,
      professor_id: req.user.id,
    });
    if (!test) return res.status(400).json({ message: "Test not found" });

    const results = await Result.find({ test_id: choosetid }).populate(
      "student_id",
      "email"
    );
    res.json({
      results: results.map((r) => ({
        email: r.student_id.email,
        marks: r.total_marks,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Test IDs for Results
router.get("/publish-results-testid", auth(["professor"]), async (req, res) => {
  try {
    const tests = await Test.find({ professor_id: req.user.id });
    res.json({ testIds: tests.map((t) => t.test_id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Checkout Session
router.post(
  "/create-checkout-session",
  auth(["professor"]),
  async (req, res) => {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: { name: "Exam Credits" },
              unit_amount: 49900, // ₹499
            },
            quantity: 10,
          },
        ],
        mode: "payment",
        success_url: "http://localhost:3000/payment?success=true",
        cancel_url: "http://localhost:3000/payment?cancel=true",
      });
      res.json({ id: session.id });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Get Exam Credits
router.get("/payment", auth(["professor"]), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ examcredits: user.exam_credits });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Webhook for Stripe
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        "your_webhook_secret"
      );
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = session.client_reference_id; // Pass user ID in session
        const user = await User.findById(userId);
        user.exam_credits += 10;
        await user.save();
      }
      res.json({ received: true });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

module.exports = router;
