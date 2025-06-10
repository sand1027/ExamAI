const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserByEmail,
  getAllTests,
  deleteTest,
} = require("../controllers/adminController");
const authMiddleware = require("../middleware/auth");

router.get("/users", getAllUsers);
router.get("/users/:email", getUserByEmail);
router.get("/tests", getAllTests);
router.post("/tests/delete", deleteTest);

module.exports = router;
