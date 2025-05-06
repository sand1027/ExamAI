import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import axios from "axios";

function QAUploadForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [message, setMessage] = useState("");

  const onSubmit = async (data) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (key === "doc")
        formData.append(key, data[key][0]); // Ensure it's a single file
      else formData.append(key, data[key]);
    });

    try {
      const res = await axios.post(
        "http://localhost:5000/api/tests/create-test-lqa",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data", // Correct content type for file upload
          },
        }
      );
      setMessage(`Test created with ID: ${res.data.test_id}`);
    } catch (error) {
      console.error("Error in form submission:", error);
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
        <Form.Label>CSV File</Form.Label>
        <Form.Control
          type="file"
          {...register("doc", { required: true })}
          accept=".csv"
        />
        {errors.doc && (
          <span className="text-danger">CSV file is required</span>
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
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          {...register("password", {
            required: true,
            minLength: 3,
            maxLength: 6,
          })}
        />
        {errors.password && (
          <span className="text-danger">Password must be 3-6 characters</span>
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

export default QAUploadForm;
