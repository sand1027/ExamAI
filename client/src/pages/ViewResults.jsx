import React, { useState, useEffect, useContext } from "react";
import { Container, Form, Button, Table, Alert } from "react-bootstrap";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function ViewResults() {
  const { user } = useContext(AuthContext);
  const [testIds, setTestIds] = useState([]); // Initialize as empty array
  const [selectedTestId, setSelectedTestId] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTestIds = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          return;
        }

        const res = await axios.get("/api/tests/publish-results-testid", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("API Response:", res.data); // Debug the response

        // Ensure testIds is always an array
        const fetchedTestIds = Array.isArray(res.data.testIds)
          ? res.data.testIds
          : [];
        setTestIds(fetchedTestIds);

        if (fetchedTestIds.length === 0) {
          setError("No test IDs found.");
        }
      } catch (err) {
        console.error("Fetch Test IDs Error:", err);
        setError(err.response?.data?.message || "Failed to load test IDs");
      }
    };

    if (user && user.user_type === "professor") {
      fetchTestIds();
    } else {
      setError("You must be a professor to access this page.");
    }
  }, [user]);

  const handleSubmit = async () => {
    try {
      setError(""); // Clear previous errors
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        return;
      }

      const res = await axios.post(
        "/api/tests/view-results",
        { choosetid: selectedTestId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setResults(Array.isArray(res.data.results) ? res.data.results : []);
    } catch (err) {
      console.error("View Results Error:", err);
      setError(err.response?.data?.message || "Failed to load results");
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
    <Container>
      <h2>View Results</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
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
          View Results
        </Button>
      </Form>
      {results.length > 0 && (
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>Email</th>
              <th>Marks</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.email}>
                <td>{result.email}</td>
                <td>{result.marks}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default ViewResults;
