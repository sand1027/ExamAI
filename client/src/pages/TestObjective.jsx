import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useNavigate instead of useHistory
import axios from "axios";
import { Container, Button, Form, Alert } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import Proctoring from "../components/Proctoring";

function TestObjective() {
  const { test_id } = useParams();
  const navigate = useNavigate(); // using useNavigate instead of useHistory
  const { user } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQid, setCurrentQid] = useState(1);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState("");
  const [bookmarked, setBookmarked] = useState([]);
  const [calculator, setCalculator] = useState("");

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await axios.get(`/api/student/test/${test_id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setQuestions(res.data.questions);
        setTimeLeft(res.data.duration);
        setBookmarked(res.data.bookmarked);
        fetchQuestion(1);
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

  const fetchQuestion = async (qid) => {
    try {
      const res = await axios.post(
        "/api/student/test",
        { flag: "get", no: qid, testid: test_id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setCurrentQuestion(res.data);
      setCurrentQid(qid);
    } catch (err) {
      setError("Error fetching question");
    }
  };

  const handleAnswer = async (option) => {
    try {
      await axios.post(
        "/api/student/test",
        { flag: "mark", qid: currentQid, ans: option, testid: test_id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setAnswers({ ...answers, [currentQid]: option });
      fetchQuestion(currentQid + 1);
    } catch (err) {
      setError("Error saving answer");
    }
  };

  const handleBookmark = async () => {
    try {
      await axios.post(
        "/api/student/test",
        {
          flag: "bookmark",
          qid: currentQid,
          bookmark: !bookmarked.includes(currentQid),
          testid: test_id,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setBookmarked(
        bookmarked.includes(currentQid)
          ? bookmarked.filter((id) => id !== currentQid)
          : [...bookmarked, currentQid]
      );
    } catch (err) {
      setError("Error updating bookmark");
    }
  };

  const submitTest = async () => {
    try {
      await axios.post(
        "/api/student/test",
        { flag: "submit", testid: test_id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      navigate("/student"); // replaced history.push with navigate
    } catch (err) {
      setError("Error submitting test");
    }
  };

  const handleCalculator = (value) => {
    if (value === "=") {
      try {
        setCalculator(eval(calculator).toString());
      } catch {
        setCalculator("Error");
      }
    } else if (value === "C") {
      setCalculator("");
    } else {
      setCalculator(calculator + value);
    }
  };

  return (
    <Container>
      <Proctoring test_id={test_id} />
      <h2>Objective Test: {test_id}</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <p>
        Time Left: {Math.floor(timeLeft / 60)}:
        {(timeLeft % 60).toString().padStart(2, "0")}
      </p>
      {currentQuestion && (
        <div>
          <h4>
            Question {currentQid}: {currentQuestion.question}
          </h4>
          <Form>
            {Object.entries(currentQuestion.options).map(([key, value]) => (
              <Form.Check
                key={key}
                type="radio"
                label={value}
                name="answer"
                value={key}
                checked={answers[currentQid] === key}
                onChange={() => handleAnswer(key)}
              />
            ))}
          </Form>
          <Button
            onClick={handleBookmark}
            variant={
              bookmarked.includes(currentQid) ? "warning" : "outline-warning"
            }
          >
            {bookmarked.includes(currentQid) ? "Unbookmark" : "Bookmark"}
          </Button>
        </div>
      )}
      <div className="calculator">
        <Form.Control value={calculator} readOnly />
        <div>
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
            "C",
          ].map((val) => (
            <Button key={val} onClick={() => handleCalculator(val)}>
              {val}
            </Button>
          ))}
        </div>
      </div>
      <Button
        onClick={() => fetchQuestion(currentQid - 1)}
        disabled={currentQid === 1}
      >
        Previous
      </Button>
      <Button
        onClick={() => fetchQuestion(currentQid + 1)}
        disabled={currentQid === questions.length}
      >
        Next
      </Button>
      <Button onClick={submitTest} variant="success">
        Submit Test
      </Button>
    </Container>
  );
}

export default TestObjective;
