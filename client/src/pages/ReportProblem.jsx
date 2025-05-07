import React, { useState, useContext } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useForm } from 'react-hook-form';

function ReportProblem() {
  const { user } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async data => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await axios.post(
        'http://localhost:5000/api/support/report',
        data,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setMessage(res.data.message);
      reset();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report problem');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
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
            placeholder="Enter subject"
            {...register('subject', { required: 'Subject is required' })}
            isInvalid={!!errors.subject}
          />
          <Form.Control.Feedback type="invalid">
            {errors.subject?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            placeholder="Describe the problem"
            {...register('description', {
              required: 'Description is required',
            })}
            isInvalid={!!errors.description}
          />
          <Form.Control.Feedback type="invalid">
            {errors.description?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Report'}
        </Button>
      </Form>
    </Container>
  );
}

export default ReportProblem;
