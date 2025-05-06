import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import axios from "axios";

function PracUploadForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [message, setMessage] = useState("");

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("/api/tests/create-test-pqa", data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessage(`Test created with ID: ${res.data.test_id}`);
    } catch (error) {
      console.error("Form submission error:", error.response || error);
      setMessage(error.response?.data?.message || "Test creation failed");
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {message && (
        <Alert variant={message.includes("created") ? "success" : "danger"}>
          {message}
        </Alert>
      )}
      <Form.Group className="mb-3">
        <Form.Label>Subject</Form.Label>
        <Form.Control
          type="text"
          {...register("subject", { required: true })}
        />
        {errors.subject && (
          <span className="text-danger">Subject is required</span>
        )}
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Topic</Form.Label>
        <Form.Control type="text" {...register("topic", { required: true })} />
        {errors.topic && <span className="text-danger">Topic is required</span>}
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Question</Form.Label>
        <Form.Control
          type="text"
          {...register("questionprac", { required: true })}
        />
        {errors.questionprac && (
          <span className="text-danger">Question is required</span>
        )}
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Marks</Form.Label>
        <Form.Control
          type="number"
          {...register("marksprac", { required: true, min: 1 })}
        />
        {errors.marksprac && (
          <span className="text-danger">Marks is required</span>
        )}
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Start Date</Form.Label>
        <Form.Control
          type="date"
          {...register("start_date", { required: true })}
        />
        {errors.start_date && (
          <span className="text-danger">Start date is required</span>
        )}
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Start Time</Form.Label>
        <Form.Control
          type="time"
          {...register("start_time", { required: true })}
        />
        {errors.start_time && (
          <span className="text-danger">Start time is required</span>
        )}
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>End Date</Form.Label>
        <Form.Control
          type="date"
          {...register("end_date", { required: true })}
        />
        {errors.end_date && (
          <span className="text-danger">End date is required</span>
        )}
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>End Time</Form.Label>
        <Form.Control
          type="time"
          {...register("end_time", { required: true })}
        />
        {errors.end_time && (
          <span className="text-danger">End time is required</span>
        )}
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Duration (minutes)</Form.Label>
        <Form.Control
          type="number"
          {...register("duration", { required: true, min: 1 })}
        />
        {errors.duration && (
          <span className="text-danger">Duration is required</span>
        )}
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Compiler</Form.Label>
        <Form.Control as="select" {...register("compiler", { required: true })}>
          <option value="11">C</option>
          <option value="27">C#</option>
          <option value="1">C++</option>
          <option value="114">Go</option>
          <option value="10">Java</option>
          <option value="47">Kotlin</option>
          <option value="56">Node.js</option>
          <option value="43">Objective-C</option>
          <option value="29">PHP</option>
          <option value="54">Perl-6</option>
          <option value="116">Python 3x</option>
          <option value="117">R</option>
          <option value="17">Ruby</option>
          <option value="93">Rust</option>
          <option value="52">SQLite-queries</option>
          <option value="40">SQLite-schema</option>
          <option value="39">Scala</option>
          <option value="85">Swift</option>
          <option value="57">TypeScript</option>
        </Form.Control>
        {errors.compiler && (
          <span className="text-danger">Compiler is required</span>
        )}
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          {...register("password", {
            required: true,
            minLength: 3,
            maxLength: 10,
          })}
        />
        {errors.password && (
          <span className="text-danger">Password must be 3-10 characters</span>
        )}
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Proctoring Type</Form.Label>
        <Form.Check
          type="radio"
          label="Automatic Monitoring"
          value="0"
          {...register("proctor_type", { required: true })}
        />
        <Form.Check
          type="radio"
          label="Live Monitoring"
          value="1"
          {...register("proctor_type")}
        />
        {errors.proctor_type && (
          <span className="text-danger">Proctoring type is required</span>
        )}
      </Form.Group>
      <Button type="submit" variant="primary">
        Create Test
      </Button>
    </Form>
  );
}

export default PracUploadForm;
