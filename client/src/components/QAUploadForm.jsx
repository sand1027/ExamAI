import React, { useState } from 'react';
import { Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import axios from 'axios';

function QAUploadForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async data => {
    setIsLoading(true);
    setMessage('');

    const formData = new FormData();

    Object.keys(data).forEach(key => {
      if (key === 'doc')
        formData.append(key, data[key][0]); // Ensure it's a single file
      else formData.append(key, data[key]);
    });

    try {
      const res = await axios.post(
        'http://localhost:5000/api/tests/create-test-lqa',
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data', // Correct content type for file upload
          },
        }
      );
      setMessage(
        `Test created successfully with ID: ${res.data.test_id}. Added ${res.data.questionCount || 'multiple'} questions.`
      );
      reset(); // Reset form after successful submission
    } catch (error) {
      console.error('Error in form submission:', error);
      setMessage(
        error.response?.data?.message ||
          error.response?.statusText ||
          'Test creation failed. Please check your CSV format and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        {message && (
          <Alert variant={message.includes('success') ? 'success' : 'danger'}>
            {message}
          </Alert>
        )}
        <Form.Group className="mb-3">
          <Form.Label>Subject</Form.Label>
          <Form.Control
            type="text"
            {...register('subject', { required: true })}
          />
          {errors.subject && (
            <span className="text-danger">Subject is required</span>
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Topic</Form.Label>
          <Form.Control
            type="text"
            {...register('topic', { required: true })}
          />
          {errors.topic && (
            <span className="text-danger">Topic is required</span>
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>CSV File</Form.Label>
          <Form.Control
            type="file"
            {...register('doc', { required: true })}
            accept=".csv"
          />
          {errors.doc && (
            <span className="text-danger">CSV file is required</span>
          )}
          <Form.Text className="text-muted">
            CSV must include columns: Question #, Question, Option A, Option B,
            Option C, Option D, Correct Answer
          </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
            {...register('start_date', { required: true })}
          />
          {errors.start_date && (
            <span className="text-danger">Start date is required</span>
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Start Time</Form.Label>
          <Form.Control
            type="time"
            {...register('start_time', { required: true })}
          />
          {errors.start_time && (
            <span className="text-danger">Start time is required</span>
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>End Date</Form.Label>
          <Form.Control
            type="date"
            {...register('end_date', { required: true })}
          />
          {errors.end_date && (
            <span className="text-danger">End date is required</span>
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>End Time</Form.Label>
          <Form.Control
            type="time"
            {...register('end_time', { required: true })}
          />
          {errors.end_time && (
            <span className="text-danger">End time is required</span>
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Duration (minutes)</Form.Label>
          <Form.Control
            type="number"
            {...register('duration', { required: true, min: 1 })}
          />
          {errors.duration && (
            <span className="text-danger">Duration is required</span>
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            {...register('password', {
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
            {...register('proctor_type', { required: true })}
          />
          <Form.Check
            type="radio"
            label="Live Monitoring"
            value="1"
            {...register('proctor_type')}
          />
          {errors.proctor_type && (
            <span className="text-danger">Proctoring type is required</span>
          )}
        </Form.Group>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />{' '}
              Creating Test...
            </>
          ) : (
            'Create Test'
          )}
        </Button>
      </Form>

      <Card className="mt-4">
        <Card.Header>CSV Format Instructions</Card.Header>
        <Card.Body>
          <p>Your CSV file must follow this format:</p>
          <ul>
            <li>
              Include the following columns with exact names:{' '}
              <code>Question #</code>, <code>Question</code>,{' '}
              <code>Option A</code>, <code>Option B</code>,{' '}
              <code>Option C</code>, <code>Option D</code>,{' '}
              <code>Correct Answer</code>
            </li>
            <li>
              Enclose text with commas or special characters in double quotes
            </li>
            <li>
              For the "Correct Answer" column, use the letter only (A, B, C, or
              D)
            </li>
          </ul>
          <p>Example:</p>
          <pre className="bg-light p-2">
            {`Question #,Question,Option A,Option B,Option C,Option D,Correct Answer
1,"What is React?","A library","A framework","A language","A database",A
2,"What hook manages state?","useRef","useEffect","useState","useContext",C`}
          </pre>
        </Card.Body>
      </Card>
    </>
  );
}

export default QAUploadForm;
