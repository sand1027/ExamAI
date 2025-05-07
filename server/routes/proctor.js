const express = require("express");
const router = express.Router();
const Test = require("../models/Test");
const ProctoringLog = require("../models/ProctorLog");
const WindowEstimationLog = require("../models/WindowEstimationLog");
const auth = require("../middleware/auth");

// Video Feed (Handle violation logs)
router.post("/video-feed", auth(["student"]), async (req, res) => {
  try {
    const {
      data: { testid, event, details },
    } = req.body;

    if (!testid || !event) {
      return res
        .status(400)
        .json({ message: "Test ID and event are required" });
    }

    const test = await Test.findOne({ test_id: testid });
    if (!test) {
      return res.status(400).json({ message: "Test not found" });
    }

    const log = new ProctoringLog({
      test_id: testid,
      student_id: req.user.id,
      event: event || "video_feed",
      details: details || {},
      timestamp: new Date(),
    });
    await log.save();

    res.json({ message: "Log saved" });
  } catch (err) {
    console.error("Error in /video-feed:", err);
    res.status(500).json({ message: err.message });
  }
});

// Window Event
router.post("/window-event", auth(["student"]), async (req, res) => {
  try {
    const { testid, event, details } = req.body;

    if (!testid || !event) {
      return res
        .status(400)
        .json({ message: "Test ID and event are required" });
    }

    const test = await Test.findOne({ test_id: testid });
    if (!test) {
      return res.status(400).json({ message: "Test not found" });
    }

    const log = new WindowEstimationLog({
      test_id: testid,
      student_id: req.user.id,
      event,
      details,
      timestamp: new Date(),
    });
    await log.save();

    res.json({ message: "Log saved" });
  } catch (err) {
    console.error("Error in /window-event:", err);
    res.status(500).json({ message: err.message });
  }
});

// Live Monitoring Test IDs
router.get("/livemonitoringtid", auth(["professor"]), async (req, res) => {
  try {
    const tests = await Test.find({
      professor_id: req.user.id,
      proctor_type: "1",
      start_date: { $lte: new Date() },
      end_date: { $gte: new Date() },
    });
    res.json({ testIds: tests.map((t) => t.test_id) });
  } catch (err) {
    console.error("Error in /livemonitoringtid:", err);
    res.status(500).json({ message: err.message });
  }
});

// Live Monitoring
router.post("/live-monitoring", auth(["professor"]), async (req, res) => {
  try {
    const { choosetid } = req.body;

    if (!choosetid) {
      return res.status(400).json({ message: "Test ID is required" });
    }

    const test = await Test.findOne({
      test_id: choosetid,
      professor_id: req.user.id,
    });
    if (!test) {
      return res.status(400).json({ message: "Test not found" });
    }

    const proctorLogs = await ProctoringLog.find({
      test_id: choosetid,
    }).populate("student_id", "email");
    const windowLogs = await WindowEstimationLog.find({
      test_id: choosetid,
    }).populate("student_id", "email");

    const data = [
      ...proctorLogs.map((log) => ({
        email: log.student_id.email,
        status: log.details.violation
          ? log.details.violation.replace(/_/g, " ")
          : log.event === "video_feed"
            ? "Active"
            : "Other",
        details: log.details,
        timestamp: log.timestamp,
      })),
      ...windowLogs.map((log) => ({
        email: log.student_id.email,
        status: log.event === "tab_switch" ? "Tab switch detected" : log.event,
        details: log.details,
        timestamp: log.timestamp,
      })),
    ];

    res.json({ data });
  } catch (err) {
    console.error("Error in /live-monitoring:", err);
    res.status(500).json({ message: err.message });
  }
});

// Proctoring Logs
router.get("/logs/:test_id", auth(["professor"]), async (req, res) => {
  try {
    const test = await Test.findOne({
      test_id: req.params.test_id,
      professor_id: req.user.id,
    });
    if (!test) {
      return res.status(400).json({ message: "Test not found" });
    }

    const proctorLogs = await ProctoringLog.find({
      test_id: req.params.test_id,
    })
      .populate("student_id", "email")
      .sort({ timestamp: -1 });
    const windowLogs = await WindowEstimationLog.find({
      test_id: req.params.test_id,
    })
      .populate("student_id", "email")
      .sort({ timestamp: -1 });

    const logs = [
      ...proctorLogs.map((log) => ({
        _id: log._id,
        timestamp: log.timestamp,
        event: log.event,
        details: {
          violation: log.details.violation
            ? log.details.violation.replace(/_/g, " ")
            : "None",
          ...log.details,
          email: log.student_id.email,
        },
      })),
      ...windowLogs.map((log) => ({
        _id: log._id,
        timestamp: log.timestamp,
        event: log.event,
        details: {
          violation: log.event === "tab_switch" ? "Tab switch" : log.event,
          ...log.details,
          email: log.student_id.email,
        },
      })),
    ];

    res.json({ logs });
  } catch (err) {
    console.error("Error in /logs/:test_id:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
