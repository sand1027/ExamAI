const express = require("express");
const router = express.Router();
const { generatePDF } = require("../controllers/pdfController");

router.post("/generate-pdf", generatePDF);

module.exports = router;
