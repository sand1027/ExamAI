const faceapi = require("face-api.js");
const canvas = require("canvas");
const fs = require("fs").promises;

faceapi.env.monkeyPatch({
  Canvas: canvas.Canvas,
  Image: canvas.Image,
  ImageData: canvas.ImageData,
});

const verifyFace = async (newImage, storedImage) => {
  await faceapi.nets.tinyFaceDetector.loadFromDisk("./models");
  await faceapi.nets.faceLandmark68Net.loadFromDisk("./models");
  await faceapi.nets.faceRecognitionNet.loadFromDisk("./models");

  const img1 = await canvas.loadImage(
    Buffer.from(newImage.split(",")[1], "base64")
  );
  const img2 = await canvas.loadImage(
    Buffer.from(storedImage.split(",")[1], "base64")
  );

  const detections1 = await faceapi
    .detectSingleFace(img1)
    .withFaceLandmarks()
    .withFaceDescriptor();
  const detections2 = await faceapi
    .detectSingleFace(img2)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detections1 || !detections2) {
    throw new Error("Face not detected");
  }

  const distance = faceapi.euclideanDistance(
    detections1.descriptor,
    detections2.descriptor
  );
  return distance < 0.6; // Threshold for match
};

module.exports = { verifyFace };
