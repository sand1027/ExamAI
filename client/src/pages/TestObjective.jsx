import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Button,
  Form,
  Alert,
  Spinner,
  Row,
  Col,
  Card,
} from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import Proctoring from '../components/Proctoring';

function TestObjective() {
  const { test_id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQid, setCurrentQid] = useState(1);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState([]);
  const [calculator, setCalculator] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getApiBaseUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  };

  useEffect(() => {
    const fetchTest = async () => {
      setLoading(true);
      try {
        console.log(`Fetching test with ID: ${test_id}`);
        const res = await axios.get(
          `${getApiBaseUrl()}/student/test/${test_id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        console.log('Test data received:', res.data);
        setQuestions(res.data.questions);
        setTimeLeft(res.data.duration);
        setBookmarked(res.data.bookmarked || []);

        await fetchQuestion(1);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching test:', err);
        setError(
          err.response?.data?.message || 'Error loading test. Please try again.'
        );
        setLoading(false);
      }
    };

    fetchTest();
  }, [test_id]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchQuestion = async qid => {
    try {
      setLoading(true);
      console.log(`Fetching question #${qid}`);

      const res = await axios.post(
        `${getApiBaseUrl()}/student/test`,
        { flag: 'get', no: qid, testid: test_id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      console.log('Question data received:', res.data);
      setCurrentQuestion(res.data);
      setCurrentQid(qid);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching question:', err);
      setError(
        err.response?.data?.message ||
          'Error fetching question. Please try again.'
      );
      setLoading(false);
    }
  };

  const handleAnswer = async option => {
    try {
      console.log(`Saving answer for question #${currentQid}: ${option}`);

      await axios.post(
        `${getApiBaseUrl()}/student/test`,
        { flag: 'mark', qid: currentQid, ans: option, testid: test_id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      setAnswers({ ...answers, [currentQid]: option });

      if (currentQid < questions.length) {
        fetchQuestion(currentQid + 1);
      }
    } catch (err) {
      console.error('Error saving answer:', err);
      setError(
        err.response?.data?.message || 'Error saving answer. Please try again.'
      );
    }
  };

  const handleBookmark = async () => {
    try {
      const isCurrentlyBookmarked = bookmarked.includes(currentQid);
      console.log(
        `${isCurrentlyBookmarked ? 'Un-bookmarking' : 'Bookmarking'} question #${currentQid}`
      );

      await axios.post(
        `${getApiBaseUrl()}/student/test`,
        {
          flag: 'bookmark',
          qid: currentQid,
          bookmark: !isCurrentlyBookmarked,
          testid: test_id,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      setBookmarked(
        isCurrentlyBookmarked
          ? bookmarked.filter(id => id !== currentQid)
          : [...bookmarked, currentQid]
      );
    } catch (err) {
      console.error('Error updating bookmark:', err);
      setError(
        err.response?.data?.message ||
          'Error updating bookmark. Please try again.'
      );
    }
  };

  const submitTest = async () => {
    try {
      setSubmitting(true);
      console.log('Submitting test...');

      await axios.post(
        `${getApiBaseUrl()}/student/test`,
        { flag: 'submit', testid: test_id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      console.log('Test submitted successfully');
      navigate('/student');
    } catch (err) {
      console.error('Error submitting test:', err);
      setError(
        err.response?.data?.message ||
          'Error submitting test. Please try again.'
      );
      setSubmitting(false);
    }
  };

  const handleCalculator = value => {
    if (value === '=') {
      try {
        const result = new Function(`return ${calculator}`)();
        setCalculator(result.toString());
      } catch {
        setCalculator('Error');
      }
    } else if (value === 'C') {
      setCalculator('');
    } else {
      setCalculator(calculator + value);
    }
  };

  if (loading && !currentQuestion) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" />
        <p>Loading test...</p>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Proctoring testid={test_id} />

      <Card className="mb-4">
        <Card.Header as="h2">Objective Test: {test_id}</Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}

          <Alert variant="info">
            Time Left: {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, '0')}
          </Alert>

          {currentQuestion ? (
            <div className="mt-4">
              <h4>
                Question {currentQid}: {currentQuestion.question}
              </h4>
              <Form className="mt-3">
                {currentQuestion.options &&
                  Object.entries(currentQuestion.options).map(
                    ([key, value]) => (
                      <Form.Check
                        key={key}
                        type="radio"
                        label={value}
                        name="answer"
                        value={key}
                        id={`option-${key}`}
                        checked={answers[currentQid] === key}
                        onChange={() => handleAnswer(key)}
                        className="mb-2"
                      />
                    )
                  )}
              </Form>

              <Button
                onClick={handleBookmark}
                variant={
                  bookmarked.includes(currentQid)
                    ? 'warning'
                    : 'outline-warning'
                }
                className="mt-3"
              >
                {bookmarked.includes(currentQid) ? 'Unbookmark' : 'Bookmark'}
              </Button>
            </div>
          ) : (
            !loading && <Alert variant="warning">No questions available</Alert>
          )}
        </Card.Body>
      </Card>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Calculator</Card.Header>
            <Card.Body>
              <Form.Control value={calculator} readOnly className="mb-2" />
              <div className="d-flex flex-wrap">
                {[
                  '1',
                  '2',
                  '3',
                  '+',
                  '4',
                  '5',
                  '6',
                  '-',
                  '7',
                  '8',
                  '9',
                  '*',
                  '0',
                  '.',
                  '=',
                  '/',
                  'C',
                ].map(val => (
                  <Button
                    key={val}
                    onClick={() => handleCalculator(val)}
                    variant="outline-secondary"
                    className="calc-button m-1"
                    style={{ width: '45px', height: '45px' }}
                  >
                    {val}
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>Navigation</Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <Button
                  onClick={() => fetchQuestion(currentQid - 1)}
                  disabled={currentQid === 1 || loading}
                  variant="primary"
                >
                  Previous
                </Button>

                <Button
                  onClick={() => fetchQuestion(currentQid + 1)}
                  disabled={currentQid === questions.length || loading}
                  variant="primary"
                >
                  Next
                </Button>

                <Button
                  onClick={submitTest}
                  variant="success"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" />{' '}
                      Submitting...
                    </>
                  ) : (
                    'Submit Test'
                  )}
                </Button>
              </div>

              {questions.length > 0 && (
                <div className="mt-3">
                  <p>Question Navigator:</p>
                  <div className="d-flex flex-wrap">
                    {Array.from(
                      { length: questions.length },
                      (_, i) => i + 1
                    ).map(num => (
                      <Button
                        key={num}
                        onClick={() => fetchQuestion(num)}
                        variant={
                          num === currentQid
                            ? 'primary'
                            : answers[num]
                              ? 'success'
                              : bookmarked.includes(num)
                                ? 'warning'
                                : 'outline-secondary'
                        }
                        size="sm"
                        className="m-1"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default TestObjective;
