const User = require("../models/User");
const PracticalQA = require("../models/PracticalQA");
const StudentAnswer = require("../models/StudentAnswer");
const Question = require("../models/Question");
const Test = require("../models/Test");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();
    const usersWithAnswers = await Promise.all(
      users.map(async (user) => {
        // Fetch practical answers
        const practicalAnswers = await PracticalQA.find({
          "studentAnswers.student_id": user._id,
        })
          .populate("studentAnswers.student_id", "name")
          .lean();

        // Fetch objective answers
        const objectiveAnswers = await StudentAnswer.find({
          student_id: user._id,
        })
          .populate("student_id", "name")
          .lean();

        // Fetch questions for each objective answer
        const objectiveAnswersWithQuestions = await Promise.all(
          objectiveAnswers.map(async (answer) => {
            const question = await Question.findOne({
              test_id: answer.test_id,
              qid: answer.qid,
            }).lean();
            return { ...answer, question };
          })
        );

        return {
          ...user,
          practicalAnswers: practicalAnswers || [],
          objectiveAnswers: objectiveAnswersWithQuestions || [],
        };
      })
    );

    res.status(200).json({ success: true, data: usersWithAnswers });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email }).select("-password").lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Fetch practical answers
    const practicalAnswers = await PracticalQA.find({
      "studentAnswers.student_id": user._id,
    })
      .populate("studentAnswers.student_id", "name")
      .lean();

    // Fetch objective answers
    const objectiveAnswers = await StudentAnswer.find({
      student_id: user._id,
    })
      .populate("student_id", "name")
      .lean();

    // Fetch questions for each objective answer
    const objectiveAnswersWithQuestions = await Promise.all(
      objectiveAnswers.map(async (answer) => {
        const question = await Question.findOne({
          test_id: answer.test_id,
          qid: answer.qid,
        }).lean();
        return { ...answer, question };
      })
    );

    const userWithAnswers = {
      ...user,
      practicalAnswers: practicalAnswers || [],
      objectiveAnswers: objectiveAnswersWithQuestions || [],
    };

    res.status(200).json({ success: true, data: userWithAnswers });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getAllTests = async (req, res) => {
  try {
    const tests = await Test.find().populate("professor_id", "name").lean();
    res.status(200).json({ success: true, data: tests });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    const { testId } = req.body;
    const test = await Test.findOneAndDelete({ test_id: testId });
    if (!test) {
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Test deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
