import React, { useState, useEffect, useContext } from "react";
import { Container, Form, Button, Table, Alert } from "react-bootstrap";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function ProctoringLogs() {
  const { user } = useContext(AuthContext);
  const [testIds, setTestIds] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [logs, setLogs] = useState([]);
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

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`/api/proctor/logs/${selectedTestId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setLogs(res.data.logs);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load logs");
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
      <h2>Proctoring Logs</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          fetchLogs();
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
          Load Logs
        </Button>
      </Form>
      {logs.length > 0 && (
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>Time</th>
              <th>Event</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.event}</td>
                <td>{JSON.stringify(log.details)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default ProctoringLogs;
