import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [userData, setUserData] = useState(null); // Store user data locally
  const navigate = useNavigate();
  const videoRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(err => {
        if (
          err.name === 'NotAllowedError' ||
          err.name === 'PermissionDeniedError'
        ) {
          setError('Camera access denied. Please allow camera permissions.');
        } else {
          setError('An error occurred while accessing the camera.');
        }
      });

    // Cleanup: Stop video stream when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const onSubmitRegister = async data => {
    try {
      // Capture face image from the video feed
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
      const capturedImage = canvas.toDataURL('image/jpeg');

      // Add captured image to form data
      const formData = { ...data, user_image: capturedImage };

      const res = await axios.post(
        'http://localhost:5000/api/auth/register',
        formData
      );
      setUserData({ email: res.data.email, ...formData }); // Store email and form data
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const onSubmitOTP = async data => {
    try {
      await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email: userData.email,
        otp: data.otp,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{ width: '200px', marginBottom: '10px' }}
      />
      {error && <Alert variant="danger">{error}</Alert>}
      {!otpSent ? (
        <Form onSubmit={handleSubmit(onSubmitRegister)}>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && (
              <span className="text-danger">{errors.name.message}</span>
            )}
          </Form.Group>
          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && (
              <span className="text-danger">{errors.email.message}</span>
            )}
          </Form.Group>
          <Form.Group>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && (
              <span className="text-danger">{errors.password.message}</span>
            )}
          </Form.Group>
          <Form.Group>
            <Form.Label>User Type</Form.Label>
            <Form.Control
              as="select"
              {...register('user_type', { required: 'User type is required' })}
            >
              <option value="student">Student</option>
              <option value="professor">Professor</option>
            </Form.Control>
            {errors.user_type && (
              <span className="text-danger">{errors.user_type.message}</span>
            )}
          </Form.Group>
          <Button type="submit" variant="primary">
            Register
          </Button>
        </Form>
      ) : (
        <Form onSubmit={handleSubmit(onSubmitOTP)}>
          <Form.Group>
            <Form.Label>Enter OTP</Form.Label>
            <Form.Control
              type="text"
              {...register('otp', { required: 'OTP is required' })}
            />
            {errors.otp && (
              <span className="text-danger">{errors.otp.message}</span>
            )}
          </Form.Group>
          <Button type="submit" variant="primary">
            Verify OTP
          </Button>
        </Form>
      )}
    </div>
  );
}

export default RegisterForm;
