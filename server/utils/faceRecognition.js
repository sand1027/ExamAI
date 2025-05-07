const faceapi = require("face-api.js");
const canvas = require("canvas");
const fs = require("fs").promises;
const path = require("path");

// Patch canvas into face-api for Node.js
faceapi.env.monkeyPatch({
  Canvas: canvas.Canvas,
  Image: canvas.Image,
  ImageData: canvas.ImageData,
});

let modelsLoaded = false;

const loadModels = async () => {
  if (modelsLoaded) return;

  const modelsPath = path.resolve(__dirname, "../face-api-models");

  try {
    await fs.access(modelsPath);
    console.log("Models found:", await fs.readdir(modelsPath));

    await faceapi.nets.tinyFaceDetector.loadFromDisk(modelsPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);

    modelsLoaded = true;
    console.log("All models loaded successfully");
  } catch (err) {
    console.error("Failed to load models:", err);
    throw new Error(`Model loading error: ${err.message}`);
  }
};

loadModels().catch((err) => {
  console.error("Failed to preload models:", err);
  process.exit(1);
});

const verifyFace = async (newImage, storedImage) => {
  if (!newImage || !storedImage) throw new Error("Missing image data");

  const extractBase64 = (data) =>
    data.includes(",") ? data.split(",")[1] : data;
  const newImageBase64 = extractBase64(newImage);
  const storedImageBase64 = extractBase64(storedImage);

  const img1 = await canvas.loadImage(Buffer.from(newImageBase64, "base64"));
  const img2 = await canvas.loadImage(Buffer.from(storedImageBase64, "base64"));

  const detect = async (img) =>
    await faceapi
      .detectSingleFace(
        img,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 512,
          scoreThreshold: 0.5,
        })
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

  const detections1 = await detect(img1);
  const detections2 = await detect(img2);

  if (!detections1 || !detections2)
    throw new Error("Face not detected in one of the images");

  const distance = faceapi.euclideanDistance(
    detections1.descriptor,
    detections2.descriptor
  );
  const isMatch = distance < 0.6;

  console.log(`Distance: ${distance} => ${isMatch ? "Match" : "No Match"}`);
  return isMatch;
};

module.exports = { verifyFace };
