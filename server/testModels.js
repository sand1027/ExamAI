// C:\Users\princ\Desktop\CareerConnectExam\server\testModels.js
const faceapi = require("face-api.js");
const path = require("path");
const canvas = require("canvas");

// Configure face-api.js with canvas for Node.js environment
faceapi.env.monkeyPatch({
  Canvas: canvas.Canvas,
  Image: canvas.Image,
  ImageData: canvas.ImageData,
});

async function testModels() {
  try {
    const modelsPath = path.resolve(__dirname, "face-api-models");
    console.log(`Loading models from: ${modelsPath}`);
    const files = require("fs").readdirSync(modelsPath);
    console.log(`Model files found: ${files.join(", ")}`);

    await faceapi.nets.tinyFaceDetector.loadFromDisk(modelsPath);
    console.log("TinyFaceDetector loaded successfully");
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
    console.log("FaceLandmark68Net loaded successfully");
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
    console.log("FaceRecognitionNet loaded successfully");
  } catch (err) {
    console.error("Model loading error:", err.stack);
  }
}

testModels();
