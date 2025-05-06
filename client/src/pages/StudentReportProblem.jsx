import React, { useState, useContext } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useForm } from "react-hook-form";

function StudentReportProblem() {
  const { user } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("/api/support/report", data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessage(res.data.message || "Problem reported successfully.");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to report problem");
      setMessage("");
    }
  };

  if (!user || user.user_type !== "student") {
    return (
      <Container className="mt-5">
        <h2>Unauthorized Access</h2>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2>Report a Problem</h2>
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group className="mb-3">
          <Form.Label>Subject</Form.Label>
          <Form.Control
            type="text"
            {...register("subject", { required: true })}
          />
          {errors.subject && (
            <small className="text-danger">Subject is required</small>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            {...register("description", { required: true })}
          />
          {errors.description && (
            <small className="text-danger">Description is required</small>
          )}
        </Form.Group>

        <Button type="submit" variant="primary">
          Submit Report
        </Button>
      </Form>
    </Container>
  );
}

export default StudentReportProblem;
