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
    const { test_id, password, img_hidden_form } = req.body;
    const test = await Test.findOne({ test_id });
    if (!test) return res.status(400).json({ message: "Invalid test ID" });
    if (test.password !== password)
      return res.status(400).json({ message: "Invalid password" });

    const user = await User.findById(req.user.id);
    const isFaceMatch = await verifyFace(img_hidden_form, user.user_image);
    if (!isFaceMatch)
      return res.status(400).json({ message: "Face verification failed" });

    if (test.start_date > new Date() || test.end_date < new Date()) {
      return res.status(400).json({ message: "Test is not active" });
    }

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
    }

    res.json({ test_id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Objective Test
router.get("/test/:test_id", auth(["student"]), async (req, res) => {
  try {
    const test = await Test.findOne({ test_id: req.params.test_id });
    if (!test) return res.status(400).json({ message: "Test not found" });

    const questions = await Question.find({ test_id: req.params.test_id });
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

router.post("/test", auth(["student"]), async (req, res) => {
  try {
    const { flag, no, qid, ans, testid, bookmark } = req.body;
    if (flag === "get") {
      const question = await Question.findOne({ test_id: testid, qid: no });
      if (!question)
        return res.status(400).json({ message: "Question not found" });
      res.json(question);
    } else if (flag === "mark") {
      const question = await Question.findOne({ test_id: testid, qid });
      let marks = 0;
      if (ans === question.answer) {
        marks = 1;
      } else if (question.test.negative_marking) {
        marks = -0.25;
      }
      await StudentAnswer.updateOne(
        { test_id: testid, student_id: req.user.id, qid },
        { $set: { answer: ans, marks } },
        { upsert: true }
      );
      res.json({ message: "Answer saved" });
    } else if (flag === "bookmark") {
      const testInfo = await StudentTestInfo.findOne({
        test_id: testid,
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
      res.json({ message: "Bookmark updated" });
    } else if (flag === "submit") {
      const answers = await StudentAnswer.find({
        test_id: testid,
        student_id: req.user.id,
      });
      const total_marks = answers.reduce((sum, a) => sum + a.marks, 0);
      await Result.updateOne(
        { test_id: testid, student_id: req.user.id },
        { $set: { total_marks, date: new Date() } },
        { upsert: true }
      );
      await StudentTestInfo.updateOne(
        { test_id: testid, student_id: req.user.id },
        { $set: { status: "submitted", end_time: new Date() } }
      );
      res.json({ message: "Test submitted" });
    }
  } catch (err) {
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
