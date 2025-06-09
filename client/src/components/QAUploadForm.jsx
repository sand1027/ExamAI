import React, { useState } from 'react';
import { Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { motion } from 'framer-motion';

function QAUploadForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const primaryColor = '#060270';
  const accentColor = '#93c5fd';

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
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setMessage(
        `Test created successfully with ID: ${res.data.test_id}. Added ${res.data.questionCount || 'multiple'} questions.`
      );
      reset();
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-5"
    >
      <Card className="bg-white/95 backdrop-blur-md shadow-lg border-0">
        <Card.Body className="p-5">
          <h3
            className="text-2xl font-bold mb-4"
            style={{ color: primaryColor }}
          >
            Upload Objective/Subjective Test
          </h3>
          <Form onSubmit={handleSubmit(onSubmit)}>
            {message && (
              <Alert
                variant={message.includes('success') ? 'success' : 'danger'}
                className="rounded-lg"
              >
                {message}
              </Alert>
            )}

            {/* Form Fields */}
            {[
              { name: 'subject', label: 'Subject', type: 'text' },
              { name: 'topic', label: 'Topic', type: 'text' },
              { name: 'doc', label: 'CSV File', type: 'file', accept: '.csv' },
              { name: 'start_date', label: 'Start Date', type: 'date' },
              { name: 'start_time', label: 'Start Time', type: 'time' },
              { name: 'end_date', label: 'End Date', type: 'date' },
              { name: 'end_time', label: 'End Time', type: 'time' },
              {
                name: 'duration',
                label: 'Duration (minutes)',
                type: 'number',
                min: 1,
              },
              {
                name: 'password',
                label: 'Password',
                type: 'password',
                minLength: 3,
                maxLength: 6,
              },
            ].map(({ name, label, type, ...rest }) => (
              <Form.Group className="mb-4" key={name}>
                <Form.Label
                  className="font-semibold"
                  style={{ color: primaryColor }}
                >
                  {label}
                </Form.Label>
                <Form.Control
                  type={type}
                  {...register(name, { required: true, ...rest })}
                  className="custom-input"
                />
                {errors[name] && (
                  <span className="text-danger d-block mt-1">
                    {label} is required
                  </span>
                )}
                {name === 'doc' && (
                  <Form.Text className="text-muted">
                    CSV must include columns: Question #, Question, Option A,
                    Option B, Option C, Option D, Correct Answer
                  </Form.Text>
                )}
              </Form.Group>
            ))}

            {/* Proctoring Type */}
            <Form.Group className="mb-4">
              <Form.Label
                className="font-semibold"
                style={{ color: primaryColor }}
              >
                Proctoring Type
              </Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  type="radio"
                  label="Automatic Monitoring"
                  value="0"
                  {...register('proctor_type', { required: true })}
                  className="custom-radio"
                />
                <Form.Check
                  type="radio"
                  label="Live Monitoring"
                  value="1"
                  {...register('proctor_type')}
                  className="custom-radio"
                />
              </div>
              {errors.proctor_type && (
                <span className="text-danger d-block mt-1">
                  Proctoring type is required
                </span>
              )}
            </Form.Group>

            {/* Submit Button */}
            <Button
              type="submit"
              className="custom-button w-100"
              disabled={isLoading}
              style={{
                backgroundColor: primaryColor,
                borderColor: primaryColor,
              }}
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Creating Test...
                </>
              ) : (
                'Create Test'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* CSV Instructions */}
      <Card className="mt-4 bg-white/95 backdrop-blur-md shadow-lg border-0">
        <Card.Header
          className="font-semibold"
          style={{ background: 'none', color: primaryColor }}
        >
          CSV Format Instructions
        </Card.Header>
        <Card.Body>
          <p className="text-gray-700">
            Your CSV file must follow this format:
          </p>
          <ul className="list-disc pl-5 text-gray-700">
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
          <p className="text-gray-700 mt-2">Example:</p>
          <pre className="bg-light p-3 rounded-lg">
            {`Question #,Question,Option A,Option B,Option C,Option D,Correct Answer
1,"What is React?","A library","A framework","A language","A database",A
2,"What hook manages state?","useRef","useEffect","useState","useContext",C`}
          </pre>
        </Card.Body>
      </Card>

      {/* Custom Styles */}
      <style jsx>{`
        .custom-input {
          border: 1px solid #1e3a8a !important;
          border-radius: 0.5rem !important;
          padding: 0.75rem !important;
          transition: all 0.3s ease !important;
        }
        .custom-input:focus {
          border-color: #93c5fd !important;
          box-shadow: 0 0 0 0.2rem rgba(147, 197, 253, 0.25) !important;
        }
        .custom-radio label {
          color: #060270;
        }
        .custom-button {
          padding: 0.75rem 1.5rem !important;
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
        }
        .custom-button:hover {
          background-color: #93c5fd !important;
          border-color: #93c5fd !important;
          color: #060270 !important;
        }
        .custom-button:disabled {
          background-color: #1e3a8a !important;
          border-color: #1e3a8a !important;
          opacity: 0.7 !important;
        }
      `}</style>
    </motion.div>
  );
}

export default QAUploadForm;
