import React, { useContext } from "react";
import { Container, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProfessorIndex() {
  const { user } = useContext(AuthContext);

  if (!user || user.user_type !== "professor") {
    return (
      <Container>
        <h2>Unauthorized Access</h2>
      </Container>
    );
  }

  return (
    <Container>
      <h2>Professor Dashboard</h2>
      <Card>
        <Card.Body>
          <Card.Title>Welcome, {user.name}</Card.Title>
          <Button
            as={Link}
            to="/create-test"
            variant="primary"
            className="mr-2"
          >
            Create Test
          </Button>
          <Button
            as={Link}
            to="/exam-history"
            variant="primary"
            className="mr-2"
          >
            Exam History
          </Button>
          <Button as={Link} to="/share-exam" variant="primary" className="mr-2">
            Share Exam
          </Button>
          <Button
            as={Link}
            to="/question-management"
            variant="primary"
            className="mr-2"
          >
            Manage Questions
          </Button>
          <Button
            as={Link}
            to="/insert-marks"
            variant="primary"
            className="mr-2"
          >
            Insert Marks
          </Button>
          <Button
            as={Link}
            to="/view-results"
            variant="primary"
            className="mr-2"
          >
            View Results
          </Button>
          <Button
            as={Link}
            to="/live-monitoring"
            variant="primary"
            className="mr-2"
          >
            Live Monitoring
          </Button>
          <Button
            as={Link}
            to="/proctoring-logs"
            variant="primary"
            className="mr-2"
          >
            Proctoring Logs
          </Button>
          <Button as={Link} to="/payment" variant="primary" className="mr-2">
            Manage Credits
          </Button>
          <Button
            as={Link}
            to="/report-problem"
            variant="primary"
            className="mr-2"
          >
            Report Problem
          </Button>
          <Button as={Link} to="/faq" variant="primary" className="mr-2">
            FAQ
          </Button>
          <Button as={Link} to="/contact-us" variant="primary">
            Contact Us
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ProfessorIndex;
