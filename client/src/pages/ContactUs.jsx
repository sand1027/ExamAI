import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { useForm } from "react-hook-form";

function ContactUs() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm(); // Update to formState
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("/api/support/contact", data);
      setMessage(res.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
      setMessage("");
    }
  };

  return (
    <Container className="mt-5">
      <h2>Contact Us</h2>
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group>
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" {...register("name", { required: true })} />
          {errors.name && <span className="text-danger">Name is required</span>}
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
          <Form.Label>Message</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            {...register("message", { required: true })}
          />
          {errors.message && (
            <span className="text-danger">Message is required</span>
          )}
        </Form.Group>
        <Button type="submit" variant="primary">
          Send Message
        </Button>
      </Form>
    </Container>
  );
}

export default ContactUs;
