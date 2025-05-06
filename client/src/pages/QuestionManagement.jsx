import React, { useState, useEffect, useContext } from "react";
import { Container, Form, Button, Table, Alert } from "react-bootstrap";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useForm } from "react-hook-form";

function QuestionManagement() {
  const { user } = useContext(AuthContext);
  const { register, handleSubmit, errors } = useForm();
  const [testIds, setTestIds] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTestIds = async () => {
      try {
        const res = await axios.get("/api/tests/history", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTestIds(res.data.exams.map((e) => e.test_id));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load test IDs");
      }
    };
    if (user && user.user_type === "professor") {
      fetchTestIds();
    }
  }, [user]);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`/api/tests/questions/${selectedTestId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setQuestions(res.data.questions);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load questions");
    }
  };

  const updateQuestion = async (qid, data) => {
    try {
      await axios.put(`/api/tests/questions/${selectedTestId}/${qid}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update question");
    }
  };

  const deleteQuestion = async (qid) => {
    try {
      await axios.delete(`/api/tests/questions/${selectedTestId}/${qid}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete question");
    }
  };

  if (!user || user.user_type !== "professor") {
    return (
      <Container>
        <h2>Unauthorized Access</h2>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2>Manage Questions</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          fetchQuestions();
        }}
      >
        <Form.Group>
          <Form.Label>Select Test ID</Form.Label>
          <Form.Control
            as="select"
            value={selectedTestId}
            onChange={(e) => setSelectedTestId(e.target.value)}
          >
            <option value="">Select a test</option>
            {testIds.map((tid) => (
              <option key={tid} value={tid}>
                {tid}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Button type="submit" variant="primary">
          Load Questions
        </Button>
      </Form>
      {questions.length > 0 && (
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>Question</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.qid}>
                <td>{q.question}</td>
                <td>
                  <Button
                    variant="warning"
                    onClick={() =>
                      updateQuestion(q.qid, {
                        question: prompt("New question", q.question),
                      })
                    }
                  >
                    Update
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => deleteQuestion(q.qid)}
                    className="ml-2"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default QuestionManagement;
