import React, { useState } from 'react';
import { Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { motion } from 'framer-motion';

function PracUploadForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [message, setMessage] = useState('');
  const [testCases, setTestCases] = useState([
    { input: '', expected_output: '' },
  ]);
  const primaryColor = '#060270';
  const accentColor = '#93c5fd';

  // Add a new test case field
  const addTestCase = () => {
    setTestCases([...testCases, { input: '', expected_output: '' }]);
  };

  // Remove a test case field
  const removeTestCase = index => {
    const newTestCases = [...testCases];
    newTestCases.splice(index, 1);
    setTestCases(newTestCases);
  };

  // Update test case value
  const updateTestCase = (index, field, value) => {
    const newTestCases = [...testCases];
    newTestCases[index][field] = value;
    setTestCases(newTestCases);
  };

  const onSubmit = async data => {
    const payload = {
      subject: data.subject,
      topic: data.topic,
      start_date: data.start_date,
      start_time: data.start_time,
      end_date: data.end_date,
      end_time: data.end_time,
      duration: data.duration,
      compiler: data.compiler,
      password: data.password,
      proctor_type: data.proctor_type,
      questions: [
        {
          question: data.questionprac,
          max_marks: parseInt(data.marksprac),
          test_cases: testCases,
        },
      ],
    };

    try {
      const res = await axios.post(
        'http://localhost:5000/api/tests/create-test-practical',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setMessage(`Test created with ID: ${res.data.test_id}`);
      reset();
      setTestCases([{ input: '', expected_output: '' }]);
    } catch (error) {
      console.error('Form submission error:', error.response || error);
      setMessage(error.response?.data?.message || 'Test creation failed');
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
            Create Practical Test
          </h3>
          <Form onSubmit={handleSubmit(onSubmit)}>
            {message && (
              <Alert
                variant={message.includes('created') ? 'success' : 'danger'}
                className="rounded-lg"
              >
                {message}
              </Alert>
            )}

            {/* Form Fields */}
            {[
              { name: 'subject', label: 'Subject', type: 'text' },
              { name: 'topic', label: 'Topic', type: 'text' },
              { name: 'questionprac', label: 'Question', type: 'text' },
              { name: 'marksprac', label: 'Marks', type: 'number', min: 1 },
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
                maxLength: 10,
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
              </Form.Group>
            ))}

            {/* Compiler Selection */}
            <Form.Group className="mb-4">
              <Form.Label
                className="font-semibold"
                style={{ color: primaryColor }}
              >
                Compiler
              </Form.Label>
              <Form.Control
                as="select"
                {...register('compiler', { required: true })}
                className="custom-input"
              >
                <option value="">-- Select Compiler --</option>
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
                <span className="text-danger d-block mt-1">
                  Compiler is required
                </span>
              )}
            </Form.Group>

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

            {/* Test Cases Section */}
            <Card className="mb-4 bg-white/95 backdrop-blur-md shadow-lg border-0">
              <Card.Header
                className="font-semibold d-flex justify-content-between align-items-center"
                style={{ background: 'none', color: primaryColor }}
              >
                <div>
                  Test Cases
                  <small className="text-muted d-block">
                    Add input/output pairs to test student code submissions
                  </small>
                </div>
              </Card.Header>
              <Card.Body>
                {testCases.map((testCase, index) => (
                  <Row key={index} className="mb-4">
                    <Col md={5}>
                      <Form.Group>
                        <Form.Label
                          className="font-semibold"
                          style={{ color: primaryColor }}
                        >
                          Input {index + 1}
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={testCase.input}
                          onChange={e =>
                            updateTestCase(index, 'input', e.target.value)
                          }
                          placeholder="Enter input for test case"
                          className="custom-input"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={5}>
                      <Form.Group>
                        <Form.Label
                          className="font-semibold"
                          style={{ color: primaryColor }}
                        >
                          Expected Output {index + 1}
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={testCase.expected_output}
                          onChange={e =>
                            updateTestCase(
                              index,
                              'expected_output',
                              e.target.value
                            )
                          }
                          placeholder="Enter expected output"
                          className="custom-input"
                        />
                      </Form.Group>
                    </Col>
                    <Col
                      md={2}
                      className="d-flex align-items-end mb-2 justify-content-center"
                    >
                      {index > 0 && (
                        <Button
                          variant="danger"
                          onClick={() => removeTestCase(index)}
                          className="custom-button-danger"
                        >
                          Remove
                        </Button>
                      )}
                    </Col>
                  </Row>
                ))}
                <Button
                  onClick={addTestCase}
                  className="custom-button-secondary"
                  style={{
                    backgroundColor: '#1e3a8a',
                    borderColor: '#1e3a8a',
                  }}
                >
                  Add Test Case
                </Button>
              </Card.Body>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              className="custom-button w-100"
              style={{
                backgroundColor: primaryColor,
                borderColor: primaryColor,
              }}
            >
              Create Test
            </Button>
          </Form>
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
        .custom-button-secondary {
          padding: 0.5rem 1rem !important;
          font-weight: 500 !important;
          transition: all 0.3s ease !important;
        }
        .custom-button-secondary:hover {
          background-color: #93c5fd !important;
          border-color: #93c5fd !important;
          color: #060270 !important;
        }
        .custom-button-danger {
          padding: 0.5rem 1rem !important;
          font-weight: 500 !important;
          transition: all 0.3s ease !important;
        }
        .custom-button-danger:hover {
          background-color: #c82333 !important;
          border-color: #bd2130 !important;
        }
      `}</style>
    </motion.div>
  );
}

export default PracUploadForm;
