import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useNavigate instead of useHistory
import axios from "axios";
import { Container, Button, Form, Alert } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import Proctoring from "../components/Proctoring";

function TestSubjective() {
  const { test_id } = useParams();
  const navigate = useNavigate(); // using useNavigate instead of useHistory
  const { user } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState("");
  const [bookmarked, setBookmarked] = useState([]);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await axios.get(`/api/student/test-subjective/${test_id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setQuestions(res.data.questions);
        setTimeLeft(res.data.duration);
        setBookmarked(res.data.bookmarked);
      } catch (err) {
        setError(err.response?.data?.message || "Error loading test");
      }
    };
    fetchTest();
  }, [test_id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (qid, value) => {
    setAnswers({ ...answers, [qid]: value });
  };

  const handleBookmark = async (qid) => {
    try {
      await axios.post(
        `/api/student/test-subjective/${test_id}`,
        { qid, bookmark: !bookmarked.includes(qid) },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setBookmarked(
        bookmarked.includes(qid)
          ? bookmarked.filter((id) => id !== qid)
          : [...bookmarked, qid]
      );
    } catch (err) {
      setError("Error updating bookmark");
    }
  };

  const submitTest = async () => {
    try {
      await axios.post(
        `/api/student/test-subjective/${test_id}`,
        { test_id, answers },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      navigate("/student"); // replace history.push with navigate
    } catch (err) {
      setError("Error submitting test");
    }
  };

  return (
    <Container>
      <Proctoring test_id={test_id} />
      <h2>Subjective Test: {test_id}</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <p>
        Time Left: {Math.floor(timeLeft / 60)}:
        {(timeLeft % 60).toString().padStart(2, "0")}
      </p>
      {questions.map((q) => (
        <div key={q.qid}>
          <h4>
            Question {q.qid}: {q.question} ({q.max_marks} marks)
          </h4>
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={5}
              value={answers[q.qid] || ""}
              onChange={(e) => handleAnswer(q.qid, e.target.value)}
            />
          </Form.Group>
          <Button
            onClick={() => handleBookmark(q.qid)}
            variant={bookmarked.includes(q.qid) ? "warning" : "outline-warning"}
          >
            {bookmarked.includes(q.qid) ? "Unbookmark" : "Bookmark"}
          </Button>
        </div>
      ))}
      <Button onClick={submitTest} variant="success">
        Submit Test
      </Button>
    </Container>
  );
}

export default TestSubjective;
