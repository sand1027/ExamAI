import React, { useState, useContext } from "react";
import { Container, Tabs, Tab } from "react-bootstrap";
import QAUploadForm from "../components/QAUploadForm";
import PracUploadForm from "../components/PracUploadForm";
import AIQuestionGenerator from "../components/AIQuestionGenerator";
import { AuthContext } from "../context/AuthContext";

function CreateTest() {
  const { user } = useContext(AuthContext);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  if (!user || user.user_type !== "professor") {
    return (
      <Container>
        <h2>Unauthorized Access</h2>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2>Create Test</h2>
      <Tabs defaultActiveKey="objective" id="create-test-tabs">
        <Tab eventKey="objective" title="Objective Test">
          <QAUploadForm />
          <AIQuestionGenerator onGenerate={setGeneratedQuestions} />
          {generatedQuestions.length > 0 && (
            <div className="mt-3">
              <h4>Generated Questions</h4>
              <ul>
                {generatedQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </Tab>
        <Tab eventKey="subjective" title="Subjective Test">
          <QAUploadForm />
          <AIQuestionGenerator onGenerate={setGeneratedQuestions} />
          {generatedQuestions.length > 0 && (
            <div className="mt-3">
              <h4>Generated Questions</h4>
              <ul>
                {generatedQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </Tab>
        <Tab eventKey="practical" title="Practical Test">
          <PracUploadForm />
        </Tab>
      </Tabs>
    </Container>
  );
}

export default CreateTest;
