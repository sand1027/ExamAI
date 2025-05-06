import React, { useState, useEffect, useContext } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useForm } from "react-hook-form"; // ✅ FIXED: Imported useForm

function ShareExam() {
  const { user } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm(); // ✅ useForm destructured properly

  const [testIds, setTestIds] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTestIds = async () => {
      try {
        const res = await axios.get("/api/tests/history", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTestIds(res.data.exams.map((e) => e.test_id));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load test IDs");
      }
    };

    if (user && user.user_type === "professor") {
      fetchTestIds();
    }
  }, [user]);

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("/api/tests/share", data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessage(res.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to share exam");
      setMessage("");
    }
  };

  if (!user || user.user_type !== "professor") {
    return (
      <Container className="mt-5">
        <h2>Unauthorized Access</h2>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2>Share Exam</h2>
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group controlId="testId">
          <Form.Label>Test ID</Form.Label>
          <Form.Control
            as="select"
            {...register("test_id", { required: true })}
          >
            <option value="">Select a test</option>
            {testIds.map((tid) => (
              <option key={tid} value={tid}>
                {tid}
              </option>
            ))}
          </Form.Control>
          {errors.test_id && (
            <small className="text-danger">Test ID is required</small>
          )}
        </Form.Group>

        <Form.Group controlId="emails">
          <Form.Label>Recipient Emails (comma-separated)</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g. user1@example.com, user2@example.com"
            {...register("emails", { required: true })}
          />
          {errors.emails && (
            <small className="text-danger">Emails are required</small>
          )}
        </Form.Group>

        <Button type="submit" variant="primary" className="mt-3">
          Share Exam
        </Button>
      </Form>
    </Container>
  );
}

export default ShareExam;
