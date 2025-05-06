import React from "react";
import { Container, Accordion } from "react-bootstrap";

function FAQ() {
  return (
    <Container className="mt-5">
      <h2>Frequently Asked Questions</h2>
      <Accordion>
        <Accordion.Item eventKey="0">
          <Accordion.Header>How do I create an exam?</Accordion.Header>
          <Accordion.Body>
            Professors can create exams by navigating to the "Create Test" page
            and selecting the type of exam (objective, subjective, or
            practical).
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>How does proctoring work?</Accordion.Header>
          <Accordion.Body>
            Proctoring uses webcam and audio to monitor students, logging
            images, audio frequency, and window events every 5 seconds.
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header>How do I reset my password?</Accordion.Header>
          <Accordion.Body>
            Use the "Forgot Password" link on the login page to receive a reset
            email.
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
}

export default FAQ;
