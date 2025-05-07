const express = require("express");
const router = express.Router();
const Test = require("../models/Test");
const Question = require("../models/Question");
const LongQA = require("../models/LongQA");
const PracticalQA = require("../models/PracticalQA");
const StudentAnswer = require("../models/StudentAnswer");
const StudentTestInfo = require("../models/StudentTestInfo");
const Result = require("../models/Result");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { verifyFace } = require("../utils/faceRecognition");
const axios = require("axios");

// Start Test
router.post("/give-test", auth(["student"]), async (req, res) => {
  try {
    console.log("Processing give-test request...");
    const { test_id, password, img_hidden_form } = req.body;

    // Validate request data
    if (!test_id || !password) {
      return res
        .status(400)
        .json({ message: "Test ID and password are required" });
    }

    if (!img_hidden_form) {
      return res
        .status(400)
        .json({ message: "Image data is required for face verification" });
    }

    // Find test
    console.log(`Finding test with ID: ${test_id}`);
    const test = await Test.findOne({ test_id });
    if (!test) {
      return res.status(400).json({ message: "Invalid test ID" });
    }

    // Verify password
    if (test.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Check test timing
    const now = new Date();
    if (test.start_date > now || test.end_date < now) {
      return res.status(400).json({
        message: "Test is not active",
        startDate: test.start_date,
        endDate: test.end_date,
        currentTime: now,
      });
    }

    // Get user
    console.log(`Finding user with ID: ${req.user.id}`);
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.user_image) {
      return res
        .status(400)
        .json({ message: "No reference image found for user" });
    }

    // Verify face
    console.log("Starting face verification...");
    try {
      const isFaceMatch = await verifyFace(img_hidden_form, user.user_image);
      console.log(
        `Face verification result: ${isFaceMatch ? "Match" : "No match"}`
      );

      if (!isFaceMatch) {
        return res.status(400).json({ message: "Face verification failed" });
      }
    } catch (faceError) {
      console.error("Face verification error:", faceError);
      return res.status(400).json({
        message: "Face verification error",
        error: faceError.message,
      });
    }

    // Create or find test info
    console.log("Updating student test info...");
    let testInfo = await StudentTestInfo.findOne({
      test_id,
      student_id: req.user.id,
    });

    if (!testInfo) {
      testInfo = new StudentTestInfo({
        test_id,
        student_id: req.user.id,
        start_time: new Date(),
        status: "started",
      });
      await testInfo.save();
      console.log("Created new test session");
    } else {
      console.log("Found existing test session");
    }

    res.json({ test_id, message: "Test access granted" });
  } catch (err) {
    console.error("Give-test route error:", err);
    res.status(500).json({
      message: "Server error processing test request",
      error: err.message,
    });
  }
});

// Objective Test
router.get("/test/:test_id", auth(["student"]), async (req, res) => {
  try {
    console.log(`Fetching test with test_id: ${req.params.test_id}`);

    const test = await Test.findOne({ test_id: req.params.test_id });
    if (!test) {
      console.error(`Test with test_id: ${req.params.test_id} not found`);
      return res.status(400).json({ message: "Test not found" });
    }

    console.log(`Test found: ${JSON.stringify(test)}`);

    const questions = await Question.find({ test_id: req.params.test_id });
    console.log(
      `Fetched ${questions.length} questions for test_id: ${req.params.test_id}`
    );

    const testInfo = await StudentTestInfo.findOne({
      test_id: req.params.test_id,
      student_id: req.user.id,
    });
    console.log(`StudentTestInfo found: ${JSON.stringify(testInfo)}`);

    res.json({
      questions,
      duration: test.duration * 60,
      bookmarked: testInfo?.bookmarked_questions || [],
    });
  } catch (err) {
    console.error("Error processing /test/:test_id request:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/test", auth(["student"]), async (req, res) => {
  try {
    const { flag, no, qid, ans, testid, bookmark } = req.body;
    console.log("POST /test received:", {
      flag,
      qid,
      ans,
      testid,
      userId: req.user.id,
    });

    if (!flag) {
      console.error("Missing flag in request body");
      return res.status(400).json({ message: "Flag is required" });
    }

    if (flag === "mark") {
      console.log(`Querying question with test_id: ${testid}, qid: ${qid}`);
      const question = await Question.findOne({ test_id: testid, qid });

      if (!question) {
        console.error(`Question not found for test_id: ${testid}, qid: ${qid}`);
        return res.status(404).json({ message: "Question not found" });
      }

      console.log("Question found:", question);
      let marks = 0;
      // Compare answers case-insensitively
      if (
        ans &&
        question.answer &&
        ans.toLowerCase() === question.answer.toLowerCase()
      ) {
        marks = 1;
      } else if (question.test?.negative_marking) {
        marks = -0.25;
      }
      console.log(
        `Calculated marks: ${marks}, answer: ${ans}, correct: ${question.answer}`
      );

      await StudentAnswer.updateOne(
        { test_id: testid, student_id: req.user.id, qid },
        { $set: { answer: ans, marks } },
        { upsert: true }
      );
      console.log("Answer saved for student:", req.user.id);

      res.json({ message: "Answer saved" });
    } else if (flag === "submit") {
      if (!testid) {
        console.error("Missing testid in submit request");
        return res.status(400).json({ message: "Test ID is required" });
      }

      console.log(
        `Fetching answers for test_id: ${testid}, student_id: ${req.user.id}`
      );
      const answers = await StudentAnswer.find({
        test_id: testid,
        student_id: req.user.id,
      });
      console.log(`Found ${answers.length} answers`);

      const total_marks = answers.reduce((sum, a) => sum + a.marks, 0);
      console.log(`Calculated total_marks: ${total_marks}`);

      await Result.updateOne(
        { test_id: testid, student_id: req.user.id },
        { $set: { total_marks, date: new Date() } },
        { upsert: true }
      );
      await StudentTestInfo.updateOne(
        { test_id: testid, student_id: req.user.id },
        { $set: { status: "submitted", end_time: new Date() } }
      );
      console.log("Test submitted successfully");

      res.json({ message: "Test submitted" });
    } else {
      console.error(`Unsupported flag: ${flag}`);
      res.status(400).json({ message: `Invalid flag: ${flag}` });
    }
  } catch (err) {
    console.error("Error in /test route:", err);
    res.status(500).json({ message: err.message });
  }
});

// Subjective Test
router.get("/test-subjective/:test_id", auth(["student"]), async (req, res) => {
  try {
    const test = await Test.findOne({ test_id: req.params.test_id });
    if (!test) return res.status(400).json({ message: "Test not found" });

    const questions = await LongQA.find({ long_test_id: test.long_test_id });
    const testInfo = await StudentTestInfo.findOne({
      test_id: req.params.test_id,
      student_id: req.user.id,
    });
    res.json({
      questions,
      duration: test.duration * 60,
      bookmarked: testInfo?.bookmarked_questions || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post(
  "/test-subjective/:test_id",
  auth(["student"]),
  async (req, res) => {
    try {
      const { test_id, answers, bookmark, qid } = req.body;
      const test = await Test.findOne({ test_id });
      if (!test) return res.status(400).json({ message: "Test not found" });

      if (bookmark !== undefined) {
        const testInfo = await StudentTestInfo.findOne({
          test_id,
          student_id: req.user.id,
        });
        if (bookmark) {
          if (!testInfo.bookmarked_questions.includes(qid)) {
            testInfo.bookmarked_questions.push(qid);
          }
        } else {
          testInfo.bookmarked_questions = testInfo.bookmarked_questions.filter(
            (id) => id !== qid
          );
        }
        await testInfo.save();
        return res.json({ message: "Bookmark updated" });
      }

      for (const [qid, answer] of Object.entries(answers)) {
        await StudentAnswer.updateOne(
          { test_id, student_id: req.user.id, qid },
          { $set: { answer, marks: 0 } }, // Marks assigned by professor
          { upsert: true }
        );
      }

      await StudentTestInfo.updateOne(
        { test_id, student_id: req.user.id },
        { $set: { status: "submitted", end_time: new Date() } }
      );

      res.json({ message: "Test submitted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Practical Test
router.get("/test-practical/:test_id", auth(["student"]), async (req, res) => {
  try {
    const test = await Test.findOne({ test_id: req.params.test_id });
    if (!test) return res.status(400).json({ message: "Test not found" });

    const questions = await PracticalQA.find({
      practical_test_id: test.practical_test_id,
    });
    const testInfo = await StudentTestInfo.findOne({
      test_id: req.params.test_id,
      student_id: req.user.id,
    });
    res.json({
      questions,
      duration: test.duration * 60,
      bookmarked: testInfo?.bookmarked_questions || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/test-practical/:test_id", auth(["student"]), async (req, res) => {
  try {
    const {
      test_id,
      qid,
      codeByStudent,
      inputByStudent,
      executedByStudent,
      bookmark,
    } = req.body;
    const test = await Test.findOne({ test_id });
    if (!test) return res.status(400).json({ message: "Test not found" });

    if (bookmark !== undefined) {
      const testInfo = await StudentTestInfo.findOne({
        test_id,
        student_id: req.user.id,
      });
      if (bookmark) {
        if (!testInfo.bookmarked_questions.includes(qid)) {
          testInfo.bookmarked_questions.push(qid);
        }
      } else {
        testInfo.bookmarked_questions = testInfo.bookmarked_questions.filter(
          (id) => id !== qid
        );
      }
      await testInfo.save();
      return res.json({ message: "Bookmark updated" });
    }

    // Submit to Judge0 for evaluation
    const question = await PracticalQA.findOne({
      practical_test_id: test.practical_test_id,
      qid,
    });
    let marks = 0;
    for (const testCase of question.test_cases) {
      const response = await axios.post(
        "https://judge0-ce.p.rapidapi.com/submissions",
        {
          source_code: codeByStudent,
          language_id: test.compiler === "python3" ? 71 : 62, // Python or Java
          stdin: testCase.input,
          expected_output: testCase.expected_output,
        },
        {
          headers: {
            "x-rapidapi-key": process.env.JUDGE0_API_KEY,
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
            "content-type": "application/json",
          },
        }
      );

      const submissionId = response.data.token;
      const result = await axios.get(
        `https://judge0-ce.p.rapidapi.com/submissions/${submissionId}`,
        {
          headers: {
            "x-rapidapi-key": process.env.JUDGE0_API_KEY,
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          },
        }
      );

      if (result.data.status.id === 3) {
        // Accepted
        marks += question.max_marks / question.test_cases.length;
      }
    }

    await StudentAnswer.updateOne(
      { test_id, student_id: req.user.id, qid },
      { $set: { answer: codeByStudent, marks } },
      { upsert: true }
    );

    await StudentTestInfo.updateOne(
      { test_id, student_id: req.user.id },
      { $set: { status: "submitted", end_time: new Date() } }
    );

    res.json({ message: "Test submitted", marks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Student History
router.get("/history", auth(["student"]), async (req, res) => {
  try {
    const testInfos = await StudentTestInfo.find({
      student_id: req.user.id,
    }).populate("test_id");
    const exams = testInfos.map((ti) => ({
      test_id: ti.test_id.test_id,
      subject: ti.test_id.subject,
      topic: ti.test_id.topic,
      test_type: ti.test_id.test_type,
      date_taken: ti.start_time,
      status: ti.status,
    }));
    res.json({ exams });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Student Results
router.get("/results", auth(["student"]), async (req, res) => {
  try {
    const results = await Result.find({ student_id: req.user.id }).populate(
      "test_id"
    );
    res.json({
      results: results.map((r) => ({
        test_id: r.test_id.test_id,
        subject: r.test_id.subject,
        marks: r.total_marks,
        date: r.date,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
