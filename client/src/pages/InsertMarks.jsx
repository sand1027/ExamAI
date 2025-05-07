import React, { useState, useEffect, useContext } from 'react';
import { Container, Form, Button, Table, Alert } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useForm } from 'react-hook-form';

function InsertMarks() {
  const { user } = useContext(AuthContext);
  const { register, handleSubmit, errors } = useForm();
  const [testIds, setTestIds] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTestIds = async () => {
      try {
        const res = await axios.get('ttp://localhost:5000/api/tests/history', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTestIds(
          res.data.exams
            .filter(e => e.test_type !== 'objective')
            .map(e => e.test_id)
        );
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load test IDs');
      }
    };
    if (user && user.user_type === 'professor') {
      fetchTestIds();
    }
  }, [user]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(
        `ttp://localhost:5000/api/tests/students/${selectedTestId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setStudents(res.data.students);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students');
    }
  };

  const onSubmit = async data => {
    try {
      await axios.post(
        `ttp://localhost:5000/api/tests/marks/${selectedTestId}`,
        data,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to insert marks');
    }
  };

  if (!user || user.user_type !== 'professor') {
    return (
      <Container>
        <h2>Unauthorized Access</h2>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2>Insert Marks</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form
        onSubmit={e => {
          e.preventDefault();
          fetchStudents();
        }}
      >
        <Form.Group>
          <Form.Label>Select Test ID</Form.Label>
          <Form.Control
            as="select"
            value={selectedTestId}
            onChange={e => setSelectedTestId(e.target.value)}
          >
            <option value="">Select a test</option>
            {testIds.map(tid => (
              <option key={tid} value={tid}>
                {tid}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Button type="submit" variant="primary">
          Load Students
        </Button>
      </Form>
      {students.length > 0 && (
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Table striped bordered hover className="mt-3">
            <thead>
              <tr>
                <th>Email</th>
                <th>Marks</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.email}>
                  <td>{s.email}</td>
                  <td>
                    <Form.Control
                      type="number"
                      {...register(`marks.${s.email}`, {
                        required: true,
                        min: 0,
                      })}
                      defaultValue={s.marks || 0}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button type="submit" variant="primary">
            Submit Marks
          </Button>
        </Form>
      )}
    </Container>
  );
}

export default InsertMarks;
