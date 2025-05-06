import React, { useState, useEffect, useContext } from "react";
import { Container, Table, Alert } from "react-bootstrap";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function StudentResults() {
  const { user } = useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get("/api/student/results", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        console.log("Results fetched:", res.data); // Debug log
        setResults(res.data?.results || []); // Safe fallback
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load results");
      }
    };

    if (user && user.user_type === "student") {
      fetchResults();
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
      <h2>My Results</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Test ID</th>
            <th>Subject</th>
            <th>Marks</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(results) &&
            results.map((result) => (
              <tr key={result.test_id}>
                <td>{result.test_id}</td>
                <td>{result.subject}</td>
                <td>{result.marks}</td>
                <td>{new Date(result.date).toLocaleString()}</td>
              </tr>
            ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default StudentResults;
