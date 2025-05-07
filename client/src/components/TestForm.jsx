import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function TestForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debug, setDebug] = useState({});
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    // Cleanup function to stop camera stream
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setMessage('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      videoRef.current.srcObject = stream;
      setStreamActive(true);
    } catch (err) {
      setMessage(
        `Camera error: ${err.message}. Please ensure camera permissions are granted.`
      );
      console.error('Camera error:', err);
    }
  };

  const captureImage = () => {
    if (!streamActive) {
      setMessage('Please start the camera first');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to base64 image
    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);

    // Stop the camera stream
    const tracks = video.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    setStreamActive(false);

    setMessage('Image captured successfully. You can now submit the form.');
  };

  const onSubmit = async data => {
    if (!capturedImage) {
      setMessage('Please capture your image before submitting');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setDebug({});

    try {
      const res = await axios.post(
        'http://localhost:5000/api/student/give-test',
        {
          ...data,
          img_hidden_form: capturedImage,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setMessage(
        `Test access granted. Redirecting to test ID: ${res.data.test_id}`
      );
      setDebug(res.data);

      // Redirect to the test page after a 2-second delay
      setTimeout(() => {
        navigate(`/test/${res.data.test_id}`);
      }, 2000);
    } catch (error) {
      console.error('Error accessing test:', error);
      setMessage(
        error.response?.data?.message ||
          error.response?.statusText ||
          'Failed to access test. Please try again.'
      );
      setDebug(error.response?.data || {});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Access Test</h2>

      {message && (
        <Alert variant={message.includes('granted') ? 'success' : 'danger'}>
          {message}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Header>Face Verification</Card.Header>
        <Card.Body className="text-center">
          <div className="mb-3">
            <video
              ref={videoRef}
              width="640"
              height="480"
              autoPlay
              style={{
                display: streamActive ? 'block' : 'none',
                margin: '0 auto',
              }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {capturedImage && (
              <div className="mt-3">
                <img
                  src={capturedImage}
                  alt="Captured"
                  style={{ maxWidth: '100%', maxHeight: '300px' }}
                />
              </div>
            )}
          </div>

          <div className="d-flex justify-content-center gap-2">
            {!streamActive && !capturedImage && (
              <Button onClick={startCamera}>Start Camera</Button>
            )}

            {streamActive && <Button onClick={captureImage}>Capture</Button>}

            {capturedImage && (
              <Button
                variant="secondary"
                onClick={() => {
                  setCapturedImage(null);
                  startCamera();
                }}
              >
                Retake
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group className="mb-3">
          <Form.Label>Test ID</Form.Label>
          <Form.Control
            type="text"
            {...register('test_id', { required: true })}
          />
          {errors.test_id && (
            <span className="text-danger">Test ID is required</span>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            {...register('password', { required: true })}
          />
          {errors.password && (
            <span className="text-danger">Password is required</span>
          )}
        </Form.Group>

        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || !capturedImage}
        >
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />{' '}
              Verifying...
            </>
          ) : (
            'Access Test'
          )}
        </Button>
      </Form>

      {Object.keys(debug).length > 0 && (
        <Card className="mt-4">
          <Card.Header>Debug Information</Card.Header>
          <Card.Body>
            <pre>{JSON.stringify(debug, null, 2)}</pre>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default TestForm;
