import React, { useState, useContext } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function ChangePassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm(); // Update here
  const { user } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async data => {
    try {
      const res = await axios.post('/api/auth/change-password', data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage(res.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
      setMessage('');
    }
  };

  if (!user) {
    return (
      <Container>
        <h2>Unauthorized Access</h2>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2>Change Password</h2>
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group>
          <Form.Label>Current Password</Form.Label>
          <Form.Control
            type="password"
            {...register('current_password', {
              required: 'Current password is required',
            })}
          />
          {errors.current_password && (
            <span className="text-danger">
              {errors.current_password.message}
            </span>
          )}
        </Form.Group>
        <Form.Group>
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            {...register('new_password', {
              required: 'New password is required',
              minLength: {
                value: 6,
                message: 'New password must be at least 6 characters',
              },
            })}
          />
          {errors.new_password && (
            <span className="text-danger">{errors.new_password.message}</span>
          )}
        </Form.Group>
        <Button type="submit" variant="primary" className="mt-3">
          Change Password
        </Button>
      </Form>
    </Container>
  );
}

export default ChangePassword;
