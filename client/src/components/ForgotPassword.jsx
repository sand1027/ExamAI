import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import axios from "axios";

function ForgotPassword() {
  const { register, handleSubmit, errors } = useForm();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("/api/auth/forgot-password", data);
      setMessage(res.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email");
      setMessage("");
    }
  };

  return (
    <Container className="mt-5">
      <h2>Forgot Password</h2>
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit(onSubmit)}>
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
        <Button type="submit" variant="primary">
          Send Reset Email
        </Button>
      </Form>
    </Container>
  );
}

export default ForgotPassword;
