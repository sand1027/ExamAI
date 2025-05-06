import React, { useState, useRef, useContext, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; // Use useNavigate instead of useHistory

function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm(); // Use formState.errors in newer versions
  const { captureFace } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  const navigate = useNavigate(); // useNavigate for React Router v6
  const videoRef = useRef();

  useEffect(() => {
    // Attempt to access the camera
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          setError("Camera access denied. Please allow camera permissions.");
        } else {
          setError("An error occurred while accessing the camera.");
        }
      });
  }, []);

  const onSubmitRegister = async (data) => {
    try {
      // Commented out the face capture logic for now
      // data.user_image = await captureFace(videoRef); // Uncomment this line once face detection is needed
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        data
      );
      setTempUser(res.data.tempUser);
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  const onSubmitOTP = async (data) => {
    try {
      await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email: tempUser.email,
        otp: data.otp,
        tempUser,
      });
      navigate("/login"); // Navigate to the login page after OTP verification
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div>
      {/* Video element for face detection (currently inactive) */}
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{ width: "200px", marginBottom: "10px" }}
      />
      {error && <Alert variant="danger">{error}</Alert>}
      {!otpSent ? (
        <Form onSubmit={handleSubmit(onSubmitRegister)}>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              {...register("name", { required: true })}
            />
            {errors.name && (
              <span className="text-danger">Name is required</span>
            )}
          </Form.Group>
          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              {...register("email", { required: true })}
            />
            {errors.email && (
              <span className="text-danger">Email is required</span>
            )}
          </Form.Group>
          <Form.Group>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              {...register("password", { required: true })}
            />
            {errors.password && (
              <span className="text-danger">Password is required</span>
            )}
          </Form.Group>
          <Form.Group>
            <Form.Label>User Type</Form.Label>
            <Form.Control
              as="select"
              {...register("user_type", { required: true })}
            >
              <option value="student">Student</option>
              <option value="professor">Professor</option>
            </Form.Control>
            {errors.user_type && (
              <span className="text-danger">User type is required</span>
            )}
          </Form.Group>
          <Button type="submit" variant="primary">
            Register
          </Button>
        </Form>
      ) : (
        <Form onSubmit={handleSubmit(onSubmitOTP)}>
          <Form.Group>
            <Form.Label>Enter OTP</Form.Label>
            <Form.Control
              type="text"
              {...register("otp", { required: true })}
            />
            {errors.otp && <span className="text-danger">OTP is required</span>}
          </Form.Group>
          <Button type="submit" variant="primary">
            Verify OTP
          </Button>
        </Form>
      )}
    </div>
  );
}

export default RegisterForm;
