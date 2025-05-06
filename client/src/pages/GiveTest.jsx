import React, { useContext } from "react";
import { Container } from "react-bootstrap";
import TestForm from "../components/TestForm";
import { AuthContext } from "../context/AuthContext";

function GiveTest() {
  const { user } = useContext(AuthContext);

  if (!user || user.user_type !== "student") {
    return (
      <Container>
        <h2>Unauthorized Access</h2>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2>Take a Test</h2>
      <TestForm />
    </Container>
  );
}

export default GiveTest;
