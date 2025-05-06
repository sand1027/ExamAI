import React, { useState, useEffect, useContext } from "react";
import { Container, Table, Alert } from "react-bootstrap";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function StudentExamHistory() {
  const { user } = useContext(AuthContext);
  const [exams, setExams] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get("/api/student/history", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        console.log("History response:", res.data); // Debug log
        setExams(res.data.exams || []); // Safe fallback
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load exam history");
      }
    };

    if (user && user.user_type === "student") {
      fetchExams();
    }
  }, [user]);

  if (!user || user.user_type !== "student") {
    return (
      <Container>
        <h2>Unauthorized Access</h2>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2>Exam History</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Test ID</th>
            <th>Subject</th>
            <th>Topic</th>
            <th>Type</th>
            <th>Date Taken</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(exams) &&
            exams.map((exam) => (
              <tr key={exam.test_id}>
                <td>{exam.test_id}</td>
                <td>{exam.subject}</td>
                <td>{exam.topic}</td>
                <td>{exam.test_type}</td>
                <td>{new Date(exam.date_taken).toLocaleString()}</td>
              </tr>
            ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default StudentExamHistory;
