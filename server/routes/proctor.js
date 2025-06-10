const express = require("express");
const router = express.Router();
const Test = require("../models/Test");
const ProctoringLog = require("../models/ProctorLog");
const WindowEstimationLog = require("../models/WindowEstimationLog");
const auth = require("../middleware/auth");
const SignalingLog = require("../models/SignalingLog");
const mongoose = require("mongoose");
const cloudinary = require("../cloudinary");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post(
  "/video-feed",
  auth(["student"]),
  upload.single("snapshot"),
  async (req, res) => {
    try {
      const {
        body: { testid, event, details },
        file,
      } = req;

      console.log("[Server] /video-feed received:", {
        testid,
        event,
        details: details ? JSON.parse(details) : null,
        hasFile: !!file,
        user: req.user,
      });

      if (!testid || !event) {
        return res
          .status(400)
          .json({ message: "Test ID and event are required" });
      }

      const test = await Test.findOne({ test_id: testid });
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }

      let snapshotUrl = null;
      if (file && details) {
        const parsedDetails = JSON.parse(details);
        console.log("[Server] Parsed details:", parsedDetails);
        if (parsedDetails.violation) {
          try {
            const result = await new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                {
                  folder: `proctoring_snapshots/test_${testid}`,
                  resource_type: "image",
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              );
              uploadStream.end(file.buffer);
            });
            snapshotUrl = result.secure_url;
            console.log("[Server] Cloudinary upload successful:", {
              snapshotUrl,
            });
          } catch (uploadError) {
            console.error("[Server] Cloudinary upload failed:", {
              message: uploadError.message,
            });
            return res.status(500).json({
              message: "Cloudinary upload failed: " + uploadError.message,
            });
          }
        }
      }

      const log = new ProctoringLog({
        test_id: testid,
        student_id: req.user.id,
        event: event || "video_feed",
        details: details ? JSON.parse(details) : {},
        snapshot_url: snapshotUrl,
        timestamp: new Date(),
      });
      await log.save();

      console.log("[Server] Video Feed Logged:", {
        testid,
        student_id: req.user.id,
        snapshotUrl,
      });
      res.json({
        message: "Stream logged",
        log_id: log._id,
        snapshot_url: snapshotUrl,
      });
    } catch (err) {
      console.error("[Server] Error in /video-feed:", err.message);
      res.status(500).json({ message: err.message });
    }
  }
);

router.get("/test-cloudinary", async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(
      "https://picsum.photos/150",
      { folder: "test_uploads" }
    );
    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    console.error("[Server] Cloudinary test error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

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
      return res.status(404).json({ message: "Test not found" });
    }

    const log = new WindowEstimationLog({
      test_id: testid,
      student_id: req.user.id,
      event,
      details,
      timestamp: new Date(),
    });
    await log.save();

    console.log("[Server] Window Event Logged:", { testid, event });
    res.json({ message: "Log saved" });
  } catch (err) {
    console.error("[Server] Error in /window-event:", err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get("/livemonitoringtid", auth(["professor"]), async (req, res) => {
  try {
    console.log("[Server] /livemonitoringtid - User:", req.user);
    const now = new Date();
    const tests = await Test.find({
      professor_id: req.user.id,
      start_date: { $lte: now },
      end_date: { $gte: now },
    });

    const testIds = tests.map((t) => t.test_id);
    console.log("[Server] /livemonitoringtid - Test IDs:", testIds);
    if (testIds.length === 0) {
      return res
        .status(404)
        .json({ message: "No active tests found for this professor" });
    }
    res.json({ testIds });
  } catch (err) {
    console.error("[Server] Error in /livemonitoringtid:", err.message);
    res.status(500).json({ message: "Failed to fetch test IDs" });
  }
});

router.post("/live-monitoring", auth(["professor"]), async (req, res) => {
  try {
    const { choosetid } = req.body;
    console.log(
      "[Server] /live-monitoring - User:",
      req.user,
      "Test ID:",
      choosetid
    );
    if (!choosetid) {
      return res.status(400).json({ message: "Test ID is required" });
    }

    const test = await Test.findOne({
      test_id: choosetid,
      professor_id: req.user.id,
    });
    if (!test) {
      return res
        .status(404)
        .json({
          message: "Test not found or you are not the assigned professor",
        });
    }

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    let rawLogs = await ProctoringLog.find({
      test_id: choosetid,
      event: "video_feed",
      timestamp: { $gte: thirtyMinutesAgo },
    });

    if (rawLogs.length === 0) {
      rawLogs = await ProctoringLog.find({
        test_id: choosetid,
        event: "video_feed",
      })
        .sort({ timestamp: -1 })
        .limit(10);
    }

    const proctorLogs = await ProctoringLog.aggregate([
      {
        $match: {
          test_id: choosetid,
          event: "video_feed",
          timestamp: { $gte: thirtyMinutesAgo },
        },
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$student_id",
          test_id: { $first: "$test_id" },
          event: { $first: "$event" },
          details: { $first: "$details" },
          timestamp: { $first: "$timestamp" },
        },
      },
      {
        $lookup: {
          from: "users",
          let: { student_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", { $toObjectId: "$$student_id" }] },
              },
            },
          ],
          as: "student",
        },
      },
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: false } },
      {
        $project: {
          student_id: { $toString: "$_id" },
          email: "$student.email",
          name: "$student.name",
          status: {
            $cond: {
              if: "$details.violation",
              then: {
                $replaceAll: {
                  input: "$details.violation",
                  find: "_",
                  replacement: " ",
                },
              },
              else: "Active",
            },
          },
          timestamp: 1,
        },
      },
    ]);

    console.log("[Server] /live-monitoring - Proctor Logs:", proctorLogs);
    res.json({ data: proctorLogs });
  } catch (err) {
    console.error("[Server] Error in /live-monitoring:", err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get("/logs/:test_id", auth(["professor"]), async (req, res) => {
  try {
    console.log(
      "[Server] /logs/:test_id - User:",
      req.user,
      "Test ID:",
      req.params.test_id
    );
    const test = await Test.findOne({
      test_id: req.params.test_id,
      professor_id: req.user.id,
    });
    if (!test) {
      return res
        .status(404)
        .json({
          message: "Test not found or you are not the assigned professor",
        });
    }

    const proctorLogs = await ProctoringLog.find({
      test_id: req.params.test_id,
    })
      .populate("student_id", "email name")
      .sort({ timestamp: -1 });

    const windowLogs = await WindowEstimationLog.find({
      test_id: req.params.test_id,
    })
      .populate("student_id", "email name")
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
          email: log.student_id?.email || "Unknown",
          name: log.student_id?.name || "Unknown",
        },
        snapshot_url: log.snapshot_url,
      })),
      ...windowLogs.map((log) => ({
        _id: log._id,
        timestamp: log.timestamp,
        event: log.event,
        details: {
          violation: log.event === "tab_switch" ? "Tab switch" : log.event,
          ...log.details,
          email: log.student_id?.email || "Unknown",
          name: log.student_id?.name || "Unknown",
        },
        snapshot_url: null,
      })),
    ];

    console.log("[Server] Logs Fetched:", {
      testId: req.params.test_id,
      totalLogs: logs.length,
    });
    res.json({ logs });
  } catch (err) {
    console.error("[Server] Error in /logs/:test_id:", err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post("/signal", auth(["student", "professor"]), async (req, res) => {
  try {
    const { test_id, student_id, type, data } = req.body;
    console.log("[Server] /signal - User:", req.user, "Payload:", {
      test_id,
      student_id,
      type,
    });
    if (!test_id || !student_id || !type || !data) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const log = new SignalingLog({ test_id, student_id, type, data });
    await log.save();
    res.json({ message: "Signal stored", log_id: log._id });
  } catch (err) {
    console.error("[Server] Signal Error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get("/signal/:test_id", auth(["professor"]), async (req, res) => {
  try {
    console.log(
      "[Server] /signal/:test_id - User:",
      req.user,
      "Test ID:",
      req.params.test_id
    );
    const { test_id } = req.params;
    const signals = await Test.findOne({
      test_id: req.params.test_id,
      professor_id: req.user.id,
    });
    if (!signals) {
      return res
        .status(404)
        .json({
          message: "Test not found or you are not the assigned professor",
        });
    }
    const logs = await SignalingLog.find({ test_id })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json({ signals: logs });
  } catch (err) {
    console.error("[Server] Signal Fetch Error:", err.message);
    res.status(500).json({ message: "Failed to fetch signals" });
  }
});

router.get(
  "/signal/:test_id/:student_id",
  auth(["student", "professor"]),
  async (req, res) => {
    try {
      const { res } = await Test.findOne({
        test_id: req.params.test_id,
        professor_id: req.user.id,
      });
      if (!res) {
        return res
          .status(404)
          .json({
            message: "Test not found or you are not the assigned professor",
          });
      }
      const { test_id, student_id } = req.params;
      console.log(
        "[Server] /signal/:test_id/:student_id - User:",
        req.user,
        "Params:",
        { test_id, student_id }
      );
      const logs = await SignalingLog.find({ test_id, student_id })
        .sort({ timestamp: -1 })
        .limit(50);
      res.json({ signals: logs });
    } catch (err) {
      console.error("[Server] Signal Fetch Error:", err.message);
      res.status(500).json({ message: err.message });
    }
  }
);

router.post("/request-offer", auth(["professor"]), async (req, res) => {
  try {
    const { test_id, student_id } = req.body;
    console.log("[Server] /request-offer - User:", req.user, "Payload:", {
      test_id,
      student_id,
    });
    if (!test_id || !student_id) {
      return res
        .status(400)
        .json({ message: "Test ID and student ID are required" });
    }

    const test = await Test.findOne({ test_id, professor_id: req.user.id });
    if (!test) {
      return res
        .status(404)
        .json({
          message: "Test not found or you are not the assigned professor",
        });
    }

    const log = new SignalingLog({
      test_id,
      student_id,
      type: "request_offer",
      data: { message: "Offer request initiated by professor" },
      timestamp: new Date(),
    });

    await log.save();
    console.log("[Server] Offer request sent to student:", student_id);
    res.json({ message: "Offer request sent", log_id: log._id });
  } catch (err) {
    console.error("[Server] Error in /request-offer:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
