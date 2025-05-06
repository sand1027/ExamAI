import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Card,
  Button,
  Form,
  Alert,
  Table,
  Modal,
} from "react-bootstrap";
import axios from "axios";
import Proctoring from "../components/Proctoring";
import { AuthContext } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

function TestQuiz() {
  const { testid } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); // Replaced useHistory with useNavigate
  const [questions, setQuestions] = useState([]);
  const [currentQid, setCurrentQid] = useState(1);
  const [markedAnswers, setMarkedAnswers] = useState({});
  const [bookmarks, setBookmarks] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcValue, setCalcValue] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`/api/student/test/${testid}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        // Randomize questions
        const shuffled = res.data.questions.sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
        setTimeLeft(res.data.duration);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load test");
      }
    };
    fetchQuestions();

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
  }, [testid]);

  const handleAnswer = async (ans) => {
    try {
      await axios.post(
        "/api/student/test",
        { flag: "mark", qid: questions[currentQid - 1].qid, ans, testid },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMarkedAnswers({
        ...markedAnswers,
        [questions[currentQid - 1].qid]: ans,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save answer");
    }
  };

  const toggleBookmark = () => {
    const qid = questions[currentQid - 1].qid;
    const newBookmarks = new Set(bookmarks);
    if (newBookmarks.has(qid)) {
      newBookmarks.delete(qid);
    } else {
      newBookmarks.add(qid);
    }
    setBookmarks(newBookmarks);
  };

  const submitTest = async () => {
    setShowStats(true);
  };

  const confirmSubmit = async () => {
    try {
      await axios.post(
        "/api/student/test",
        { flag: "submit", testid },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      navigate("/student-index"); // Replaced history.push with navigate
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit test");
    }
  };

  const handleCalculator = (value) => {
    if (value === "=") {
      try {
        setCalcValue(eval(calcValue).toString());
      } catch {
        setCalcValue("Error");
      }
    } else if (value === "C") {
      setCalcValue("");
    } else {
      setCalcValue(calcValue + value);
    }
  };

  if (!user || user.user_type !== "student") {
    return (
      <Container>
        <h2>Unauthorized Access</h2>
      </Container>
    );
  }

  return (
    <Container>
      <Proctoring testid={testid} />
      <h2>Objective Test</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {questions.length > 0 && (
        <Card>
          <Card.Body>
            <Card.Title>{questions[currentQid - 1].question}</Card.Title>
            <Form>
              {["a", "b", "c", "d"].map((option) => (
                <Form.Check
                  key={option}
                  type="radio"
                  label={questions[currentQid - 1].options[option]}
                  name="answer"
                  value={option}
                  checked={
                    markedAnswers[questions[currentQid - 1].qid] === option
                  }
                  onChange={() => handleAnswer(option)}
                />
              ))}
            </Form>
            <Button
              onClick={toggleBookmark}
              variant={
                bookmarks.has(questions[currentQid - 1].qid)
                  ? "warning"
                  : "outline-warning"
              }
              className="mt-3"
            >
              {bookmarks.has(questions[currentQid - 1].qid)
                ? "Unbookmark"
                : "Bookmark"}
            </Button>
            <Button
              onClick={() => setCurrentQid((prev) => Math.max(1, prev - 1))}
              className="mt-3 ml-2"
            >
              Previous
            </Button>
            <Button
              onClick={() =>
                setCurrentQid((prev) => Math.min(questions.length, prev + 1))
              }
              className="mt-3 ml-2"
            >
              Next
            </Button>
            <Button
              onClick={() => setShowCalculator(!showCalculator)}
              className="mt-3 ml-2"
            >
              Calculator
            </Button>
            <Button
              onClick={submitTest}
              variant="success"
              className="mt-3 ml-2"
            >
              Submit Test
            </Button>
          </Card.Body>
        </Card>
      )}
      {showCalculator && (
        <Card className="mt-3">
          <Card.Body>
            <Form.Control value={calcValue} readOnly />
            <div className="mt-2">
              {[
                "1",
                "2",
                "3",
                "+",
                "4",
                "5",
                "6",
                "-",
                "7",
                "8",
                "9",
                "*",
                "0",
                ".",
                "=",
                "/",
              ].map((val) => (
                <Button
                  key={val}
                  onClick={() => handleCalculator(val)}
                  className="m-1"
                >
                  {val}
                </Button>
              ))}
              <Button
                onClick={() => handleCalculator("C")}
                variant="danger"
                className="m-1"
              >
                C
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            {questions.map((q, i) => (
              <th
                key={q.qid}
                onClick={() => setCurrentQid(i + 1)}
                style={{
                  cursor: "pointer",
                  background: bookmarks.has(q.qid) ? "yellow" : "",
                }}
              >
                Q{i + 1}
              </th>
            ))}
          </tr>
        </thead>
      </Table>
      <Modal show={showStats} onHide={() => setShowStats(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Submission Statistics</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Total Questions: {questions.length}</p>
          <p>Answered: {Object.keys(markedAnswers).length}</p>
          <p>Bookmarked: {bookmarks.size}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStats(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmSubmit}>
            Confirm Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default TestQuiz;
