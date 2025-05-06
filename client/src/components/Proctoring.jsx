import React, { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";

function Proctoring({ testid }) {
  const videoRef = useRef();
  const audioContextRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      startVideo();
      startAudio();
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: {} })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error("Camera access denied:", err));
    };

    const startAudio = () => {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          audioContextRef.current = new (window.AudioContext ||
            window.webkitAudioContext)();
          const source =
            audioContextRef.current.createMediaStreamSource(stream);
          const analyser = audioContextRef.current.createAnalyser();
          source.connect(analyser);
        })
        .catch((err) => console.error("Audio access denied:", err));
    };

    const disableInputs = () => {
      document.addEventListener("copy", (e) => e.preventDefault());
      document.addEventListener("cut", (e) => e.preventDefault());
      document.addEventListener("paste", (e) => e.preventDefault());
      document.addEventListener("contextmenu", (e) => e.preventDefault());
    };

    const logWindowEvents = () => {
      window.addEventListener("blur", () => {
        axios.post(
          "/api/proctor/window-event",
          { testid, event: "tab_switch" },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      });
    };

    loadModels();
    disableInputs();
    logWindowEvents();

    const interval = setInterval(async () => {
      if (videoRef.current && audioContextRef.current) {
        const detections = await faceapi
          .detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceExpressions();
        const canvas = faceapi.createCanvasFromMedia(videoRef.current);
        faceapi.matchDimensions(canvas, videoRef.current);

        // Gaze estimation (simplified)
        const landmarks = detections[0]?.landmarks;
        const eyeMovement = landmarks
          ? landmarks.positions.some((p) => p.x < 100 || p.x > 300)
          : false;

        // Audio frequency
        const analyser = audioContextRef.current.createAnalyser();
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const voiceDb = Math.max(...dataArray);

        const proctorData = {
          imgData: canvas.toDataURL(),
          voice_db: voiceDb,
          mob_status: detections.length > 1,
          person_status: detections.length === 0,
          user_move1: false,
          user_move2: false,
          eye_movements: eyeMovement,
        };
        await axios.post(
          "/api/proctor/video-feed",
          {
            data: {
              imgData: proctorData.imgData,
              testid,
              voice_db: proctorData.voice_db,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      document.removeEventListener("copy", (e) => e.preventDefault());
      document.removeEventListener("cut", (e) => e.preventDefault());
      document.removeEventListener("paste", (e) => e.preventDefault());
      document.removeEventListener("contextmenu", (e) => e.preventDefault());
    };
  }, [testid]);

  return <video ref={videoRef} autoPlay muted style={{ display: "none" }} />;
}

export default Proctoring;
