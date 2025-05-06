import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function TestForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      // Simulate capturing webcam image
      data.img_hidden_form = "base64-encoded-image"; // Replace with actual webcam capture
      const res = await axios.post(
        "http://localhost:5000/api/student/give-test",
        data,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      navigate(`/test/${data.test_id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid test ID or password");
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group>
        <Form.Label>Exam ID</Form.Label>
        <Form.Control
          type="text"
          {...register("test_id", { required: true })}
        />
        {errors.test_id && (
          <span className="text-danger">Exam ID is required</span>
        )}
      </Form.Group>
      <Form.Group>
        <Form.Label>Exam Password</Form.Label>
        <Form.Control
          type="password"
          {...register("password", { required: true })}
        />
        {errors.password && (
          <span className="text-danger">Password is required</span>
        )}
      </Form.Group>
      <Button type="submit" variant="primary">
        Start Test
      </Button>
    </Form>
  );
}

export default TestForm;
