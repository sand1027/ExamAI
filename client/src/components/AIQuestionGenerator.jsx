import React, { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";
import axios from "axios";

function AIQuestionGenerator({ onGenerate }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateQuestions = async (data) => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai/generate-questions",
        {
          subject: data.subject,
          topic: data.topic,
          type: data.type,
          count: data.type === "objective" ? 5 : 3,
          duration: data.duration,
          start_date: data.start_date,
          start_time: data.start_time,
          end_date: data.end_date,
          end_time: data.end_time,
          password: data.password,
          proctor_type: data.proctor_type,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data && res.data.questions && res.data.test_id) {
        onGenerate({
          questions: res.data.questions,
          test_id: res.data.test_id,
        });
      } else {
        setError("Invalid response from AI service");
        console.error("Invalid API response:", res.data);
      }
    } catch (err) {
      console.error(
        "Question generation error:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.message || "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      onSubmit={handleSubmit(generateQuestions)}
      className="mt-4 mb-4 p-3 border rounded bg-light"
    >
      <h4>AI Question Generator</h4>
      <p className="text-muted">Generate AI-powered questions for your test</p>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>Subject</Form.Label>
        <Form.Control
          type="text"
          placeholder="e.g. Computer Science"
          {...register("subject", { required: "Subject is required" })}
        />
        {errors.subject && (
          <span className="text-danger">{errors.subject.message}</span>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Topic</Form.Label>
        <Form.Control
          type="text"
          placeholder="e.g. Data Structures"
          {...register("topic", { required: "Topic is required" })}
        />
        {errors.topic && (
          <span className="text-danger">{errors.topic.message}</span>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Question Type</Form.Label>
        <Form.Control
          as="select"
          {...register("type", { required: "Question type is required" })}
        >
          <option value="objective">Objective (Multiple Choice)</option>
          <option value="subjective">Subjective (Long Answer)</option>
        </Form.Control>
        {errors.type && (
          <span className="text-danger">{errors.type.message}</span>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Test Duration (minutes)</Form.Label>
        <Form.Control
          type="number"
          placeholder="e.g. 60"
          {...register("duration", {
            required: "Duration is required",
            min: { value: 1, message: "Duration must be at least 1 minute" },
          })}
        />
        {errors.duration && (
          <span className="text-danger">{errors.duration.message}</span>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Start Date</Form.Label>
        <Form.Control
          type="date"
          {...register("start_date", { required: "Start date is required" })}
        />
        {errors.start_date && (
          <span className="text-danger">{errors.start_date.message}</span>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Start Time</Form.Label>
        <Form.Control
          type="time"
          {...register("start_time", { required: "Start time is required" })}
        />
        {errors.start_time && (
          <span className="text-danger">{errors.start_time.message}</span>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>End Date</Form.Label>
        <Form.Control
          type="date"
          {...register("end_date", { required: "End date is required" })}
        />
        {errors.end_date && (
          <span className="text-danger">{errors.end_date.message}</span>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>End Time</Form.Label>
        <Form.Control
          type="time"
          {...register("end_time", { required: "End time is required" })}
        />
        {errors.end_time && (
          <span className="text-danger">{errors.end_time.message}</span>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Test Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Enter test password"
          {...register("password", { required: "Password is required" })}
        />
        {errors.password && (
          <span className="text-danger">{errors.password.message}</span>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Proctoring Type</Form.Label>
        <Form.Control
          as="select"
          {...register("proctor_type", {
            required: "Proctoring type is required",
          })}
        >
          <option value="0">Automated</option>
          <option value="1">Live</option>
        </Form.Control>
        {errors.proctor_type && (
          <span className="text-danger">{errors.proctor_type.message}</span>
        )}
      </Form.Group>

      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        className="d-flex align-items-center"
      >
        {loading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Generating Questions...
          </>
        ) : (
          "Generate AI Questions"
        )}
      </Button>
    </Form>
  );
}

export default AIQuestionGenerator;
