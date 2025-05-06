// src/context/AuthProvider.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
// import * as faceapi from "face-api.js"; // 👈 Commented out face-api
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data.user);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setLoading(false);
          setError("Failed to authenticate. Please log in again.");
        });
    } else {
      setLoading(false);
    }
  }, []);

  // const captureFace = async (videoRef) => {
  //   try {
  //     await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  //     await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
  //     const detections = await faceapi.detectSingleFace(
  //       videoRef.current,
  //       new faceapi.TinyFaceDetectorOptions()
  //     );
  //     if (!detections) throw new Error("No face detected");
  //     const canvas = faceapi.createCanvasFromMedia(videoRef.current);
  //     faceapi.matchDimensions(canvas, videoRef.current);
  //     return canvas.toDataURL();
  //   } catch (err) {
  //     console.error(err);
  //     throw new Error("Face capture failed. Please try again.");
  //   }
  // };

  const login = async (email, password, user_type, videoRef = null) => {
    try {
      // Clear previous token if any
      localStorage.removeItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
          user_type,
          forceLogin: true, // ✅ Add this line to allow forced login
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      setError(null);
      return res.data;
    } catch (err) {
      console.error(
        "Login error:",
        err.response ? err.response.data : err.message
      );
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials and try again."
      );
      throw err;
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      localStorage.removeItem("token");
      setUser(null);
      setError(null);
    } catch (err) {
      setError("Logout failed. Please try again.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        error,
        // captureFace, // 👈 Commented out export of face capture
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
