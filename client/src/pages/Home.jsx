import React from "react";
import { Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

function Home() {
  return (
    <Container
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ height: "100vh" }}
    >
      <div
        className="text-center p-5"
        style={{ background: "#f8f9fa", borderRadius: "10px" }}
      >
        <h1>Welcome to MyProctor.ai</h1>
        <p>Create and take proctored exams with ease.</p>
        <Button as={Link} to="/register" variant="primary">
          Get Started
        </Button>
      </div>
    </Container>
  );
}

export default Home;
