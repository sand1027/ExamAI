import React, { useContext } from "react";
import { Navbar, Nav, Button, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom"; // Change useHistory to useNavigate
import { AuthContext } from "../context/AuthContext";

function NavigationBar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate(); // Change useHistory to useNavigate

  const handleLogout = async () => {
    await logout();
    navigate("/"); // Use navigate instead of history.push
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand as={Link} to="/">
        MyProctor.ai
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          {user ? (
            <>
              {user.user_type === "professor" && (
                <>
                  <Nav.Link as={Link} to="/professor-index">
                    Dashboard
                  </Nav.Link>
                  <NavDropdown title="Exams" id="exam-nav-dropdown">
                    <NavDropdown.Item as={Link} to="/create-test">
                      Create Test
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/exam-history">
                      Exam History
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/share-exam">
                      Share Exam
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/question-management">
                      Manage Questions
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/insert-marks">
                      Insert Marks
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/view-results">
                      View Results
                    </NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown title="Proctoring" id="proctoring-nav-dropdown">
                    <NavDropdown.Item as={Link} to="/live-monitoring">
                      Live Monitoring
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/proctoring-logs">
                      Proctoring Logs
                    </NavDropdown.Item>
                  </NavDropdown>
                  <Nav.Link as={Link} to="/payment">
                    Manage Credits
                  </Nav.Link>
                  <Nav.Link as={Link} to="/report-problem">
                    Report Problem
                  </Nav.Link>
                </>
              )}
              {user.user_type === "student" && (
                <>
                  <Nav.Link as={Link} to="/student-index">
                    Dashboard
                  </Nav.Link>
                  <Nav.Link as={Link} to="/give-test">
                    Take Test
                  </Nav.Link>
                  <Nav.Link as={Link} to="/student-exam-history">
                    Exam History
                  </Nav.Link>
                  <Nav.Link as={Link} to="/student-results">
                    Results
                  </Nav.Link>
                  <Nav.Link as={Link} to="/student-report-problem">
                    Report Problem
                  </Nav.Link>
                </>
              )}
              <Nav.Link as={Link} to="/change-password">
                Change Password
              </Nav.Link>
              <Button variant="outline-light" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Nav.Link as={Link} to="/login">
                Login
              </Nav.Link>
              <Nav.Link as={Link} to="/register">
                Register
              </Nav.Link>
              <Nav.Link as={Link} to="/forgot-password">
                Forgot Password
              </Nav.Link>
            </>
          )}
          <Nav.Link as={Link} to="/faq">
            FAQ
          </Nav.Link>
          <Nav.Link as={Link} to="/contact-us">
            Contact Us
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavigationBar;
