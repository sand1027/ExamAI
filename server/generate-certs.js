// generate-certs.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const certDir = path.join(__dirname, "cert");
if (!fs.existsSync(certDir)) fs.mkdirSync(certDir);

try {
  execSync(
    `openssl req -x509 -newkey rsa:4096 -nodes -out ${certDir}/cert.pem -keyout ${certDir}/key.pem -days 365 -subj "/CN=localhost"`
  );
  console.log("Self-signed certs created.");
} catch (err) {
  console.error("Failed to generate certs:", err);
}
