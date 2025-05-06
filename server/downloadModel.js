const https = require("https");
const fs = require("fs");
const path = require("path");

const models = [
  // Tiny Face Detector
  "tiny_face_detector_model-weights_manifest.json",
  "tiny_face_detector_model-shard1",
  // Face Landmark 68
  "face_landmark_68_model-weights_manifest.json",
  "face_landmark_68_model-shard1",
  // Face Recognition
  "face_recognition_model-weights_manifest.json",
  "face_recognition_model-shard1",
  "face_recognition_model-shard2",
  // Face Expression
  "face_expression_model-weights_manifest.json",
  "face_expression_model-shard1",
];

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(
              `Failed to download ${url}: Status ${response.statusCode}`
            )
          );
          return;
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => reject(err));
      });
  });
};

const downloadModels = async (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  for (const model of models) {
    const url = `https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/${model}`;
    const dest = path.join(dir, model);
    console.log(`Downloading ${model}...`);
    try {
      await downloadFile(url, dest);
      console.log(`Downloaded ${model}`);
    } catch (err) {
      console.error(`Error downloading ${model}:`, err.message);
    }
  }
};

// Download to server/face-api-models/
downloadModels(path.join(__dirname, "face-api-models"))
  .then(() =>
    console.log("All face-api.js models downloaded to server/face-api-models/")
  )
  .catch((err) => console.error("Error downloading models:", err));
