import React, { useContext } from "react";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function StudentIndex() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading...</p>
      </Container>
    );
  }

  if (!user || user.user_type !== "student") {
    return (
      <Container>
        <h2>Unauthorized Access</h2>
      </Container>
    );
  }

  return (
    <Container>
      <h2>Student Dashboard</h2>
      <Card>
        <Card.Body>
          <Card.Title>Welcome, {user.name}</Card.Title>
          <Button as={Link} to="/give-test" variant="primary" className="mr-2">
            Take Test
          </Button>
          <Button as={Link} to={`/tests-given/${user.email}`} variant="primary">
            View Results
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default StudentIndex;
