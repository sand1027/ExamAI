import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, Alert } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function ExamHistory() {
  const { user } = useContext(AuthContext);
  const [exams, setExams] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tests/history', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        // Ensure exams is an array before setting state
        if (Array.isArray(res.data.exams)) {
          setExams(res.data.exams);
        } else {
          setError('Invalid exam data format');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load exam history');
      }
    };

    if (user && user.user_type === 'professor') {
      fetchExams();
    }
  }, [user]);

  if (!user || user.user_type !== 'professor') {
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
            <th>Start</th>
            <th>End</th>
          </tr>
        </thead>
        <tbody>
          {/* Ensure exams is an array before rendering */}
          {Array.isArray(exams) && exams.length > 0 ? (
            exams.map(exam => (
              <tr key={exam.test_id}>
                <td>{exam.test_id}</td>
                <td>{exam.subject}</td>
                <td>{exam.topic}</td>
                <td>{exam.test_type}</td>
                <td>{new Date(exam.start).toLocaleString()}</td>
                <td>{new Date(exam.end).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No exam history available
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default ExamHistory;
