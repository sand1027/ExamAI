import React, { useState, useRef, useContext } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login } = useContext(AuthContext);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  // const videoRef = useRef();

  // Commented out camera functionality for now
  /*
  React.useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: {} })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => setError("Camera access denied"));
  }, []);
  */

  const onSubmit = async (data) => {
    try {
      // pass null instead of videoRef if camera is disabled
      await login(data.email, data.password, data.user_type, null);
      if (data.user_type === "student") {
        navigate("/student-index");
      } else {
        navigate("/professor-index");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div>
      {/* <video
        ref={videoRef}
        autoPlay
        muted
        style={{ width: "200px", marginBottom: "10px" }}
      /> */}
      <Form onSubmit={handleSubmit(onSubmit)}>
        {error && <Alert variant="danger">{error}</Alert>}
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
          Login
        </Button>
      </Form>
    </div>
  );
}

export default LoginForm;
