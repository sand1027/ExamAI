const multer = require("multer");
const { Readable } = require("stream");
const csv = require("csv-parser");
const User = require("../models/User");
const Test = require("../models/Test");
const Question = require("../models/Question");
const LongQA = require("../models/LongQA");
const PracticalQA = require("../models/PracticalQA");

const upload = multer({ storage: multer.memoryStorage() });

exports.createTest = [
  upload.single("doc"),
  async (req, res) => {
    const {
      subject,
      topic,
      start_date,
      start_time,
      end_date,
      end_time,
      duration,
      password,
      neg_mark,
      calc,
      proctor_type,
    } = req.body;
    try {
      const user = await User.findById(req.user.id);
      if (user.examcredits < 1)
        return res.status(400).json({ message: "No exam credits available" });

      const test_id = Math.random().toString(36).substring(2, 15);
      const questions = [];
      const stream = Readable.from(req.file.buffer.toString());
      stream
        .pipe(csv())
        .on("data", (row) => {
          questions.push({
            test_id,
            qid: row.qid,
            question: row.q,
            options: { a: row.a, b: row.b, c: row.c, d: row.d },
            answer: row.ans,
            marks: parseInt(row.marks),
            user: req.user.id,
          });
        })
        .on("end", async () => {
          await Question.insertMany(questions);
          const start_date_time = new Date(`${start_date}T${start_time}`);
          const end_date_time = new Date(`${end_date}T${end_time}`);
          const test = new Test({
            user: req.user.id,
            test_id,
            test_type: "objective",
            start: start_date_time,
            end: end_date_time,
            duration: parseInt(duration) * 60,
            show_ans: true,
            password,
            subject,
            topic,
            neg_marks: parseInt(neg_mark),
            calc: calc === "true",
            proctoring_type: proctor_type,
          });
          await test.save();
          await User.updateOne(
            { _id: req.user.id },
            { $inc: { examcredits: -1 } }
          );
          res.json({ message: "Test created", test_id });
        });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
];

exports.createTestLQA = [
  upload.single("doc"),
  async (req, res) => {
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
    try {
      const user = await User.findById(req.user.id);
      if (user.examcredits < 1)
        return res.status(400).json({ message: "No exam credits available" });

      const test_id = Math.random().toString(36).substring(2, 15);
      const questions = [];
      const stream = Readable.from(req.file.buffer.toString());
      stream
        .pipe(csv())
        .on("data", (row) => {
          questions.push({
            test_id,
            qid: row.qid,
            question: row.q,
            marks: parseInt(row.marks),
            user: req.user.id,
          });
        })
        .on("end", async () => {
          await LongQA.insertMany(questions);
          const start_date_time = new Date(`${start_date}T${start_time}`);
          const end_date_time = new Date(`${end_date}T${end_time}`);
          const test = new Test({
            user: req.user.id,
            test_id,
            test_type: "subjective",
            start: start_date_time,
            end: end_date_time,
            duration: parseInt(duration) * 60,
            show_ans: false,
            password,
            subject,
            topic,
            neg_marks: 0,
            calc: false,
            proctoring_type: proctor_type,
          });
          await test.save();
          await User.updateOne(
            { _id: req.user.id },
            { $inc: { examcredits: -1 } }
          );
          res.json({ message: "Test created", test_id });
        });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
];

exports.createTestPQA = async (req, res) => {
  const {
    subject,
    topic,
    questionprac,
    marksprac,
    start_date,
    start_time,
    end_date,
    end_time,
    duration,
    compiler,
    password,
    proctor_type,
  } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (user.examcredits < 1)
      return res.status(400).json({ message: "No exam credits available" });

    const test_id = Math.random().toString(36).substring(2, 15);
    const question = new PracticalQA({
      test_id,
      qid: "1",
      question: questionprac,
      compiler,
      marks: parseInt(marksprac),
      user: req.user.id,
    });
    await question.save();

    const start_date_time = new Date(`${start_date}T${start_time}`);
    const end_date_time = new Date(`${end_date}T${end_time}`);
    const test = new Test({
      user: req.user.id,
      test_id,
      test_type: "practical",
      start: start_date_time,
      end: end_date_time,
      duration: parseInt(duration) * 60,
      show_ans: false,
      password,
      subject,
      topic,
      neg_marks: 0,
      calc: false,
      proctoring_type: proctor_type,
    });
    await test.save();
    await User.updateOne({ _id: req.user.id }, { $inc: { examcredits: -1 } });
    res.json({ message: "Test created", test_id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
