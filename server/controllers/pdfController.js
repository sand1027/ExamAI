const { exec } = require("child_process");
const fs = require("fs-extra");
const path = require("path");

exports.generatePDF = async (req, res) => {
  try {
    const { latexContent } = req.body;

    // Create a temporary directory for LaTeX processing
    const tempDir = path.join(__dirname, "../temp");
    await fs.ensureDir(tempDir);

    // Write LaTeX content to a temporary .tex file
    const texFilePath = path.join(tempDir, `practical-${Date.now()}.tex`);
    await fs.writeFile(texFilePath, latexContent);

    // Compile LaTeX to PDF using pdflatex
    const pdfFilePath = texFilePath.replace(".tex", ".pdf");
    await new Promise((resolve, reject) => {
      exec(
        `pdflatex -output-directory=${tempDir} ${texFilePath}`,
        (error, stdout, stderr) => {
          if (error) {
            console.error("pdflatex error:", stderr);
            return reject(new Error("Failed to compile LaTeX to PDF"));
          }
          resolve();
        }
      );
    });

    // Read the generated PDF
    const pdfBuffer = await fs.readFile(pdfFilePath);

    // Clean up temporary files
    await fs.remove(tempDir);

    // Send the PDF as a response
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="practical_answer.pdf"',
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ success: false, message: "Failed to generate PDF" });
  }
};
