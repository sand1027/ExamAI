import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ProfessorIndex from "./pages/ProfessorIndex";
import StudentIndex from "./pages/StudentIndex";
import CreateTest from "./pages/CreateTest";
import GiveTest from "./pages/GiveTest";
import TestQuiz from "./pages/TestQuiz";
import TestSubjective from "./pages/TestSubjective";
import TestPractical from "./pages/TestPractical";
import ViewResults from "./pages/ViewResults";
import Payment from "./pages/Payment";
import LiveMonitoring from "./pages/LiveMonitoring";
import ForgotPassword from "./components/ForgotPassword";
import ChangePassword from "./components/ChangePassword";
import ExamHistory from "./pages/ExamHistory";
import ShareExam from "./pages/ShareExam";
import QuestionManagement from "./pages/QuestionManagement";
import InsertMarks from "./pages/InsertMarks";
import ProctoringLogs from "./pages/ProctoringLogs";
import ReportProblem from "./pages/ReportProblem";
import FAQ from "./pages/FAQ";
import ContactUs from "./pages/ContactUs";
import StudentExamHistory from "./pages/StudentExamHistory";
import StudentResults from "./pages/StudentResults";
import StudentReportProblem from "./pages/StudentReportProblem";
import { AuthProvider } from "./context/AuthProvider";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/professor-index" element={<ProfessorIndex />} />
          <Route path="/student-index" element={<StudentIndex />} />
          <Route path="/create-test" element={<CreateTest />} />
          <Route path="/give-test" element={<GiveTest />} />
          <Route path="/test/:testid" element={<TestQuiz />} />
          <Route path="/test-subjective/:testid" element={<TestSubjective />} />
          <Route path="/test-practical/:testid" element={<TestPractical />} />
          <Route path="/view-results" element={<ViewResults />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/live-monitoring" element={<LiveMonitoring />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/exam-history" element={<ExamHistory />} />
          <Route path="/share-exam" element={<ShareExam />} />
          <Route path="/question-management" element={<QuestionManagement />} />
          <Route path="/insert-marks" element={<InsertMarks />} />
          <Route path="/proctoring-logs" element={<ProctoringLogs />} />
          <Route path="/report-problem" element={<ReportProblem />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route
            path="/student-exam-history"
            element={<StudentExamHistory />}
          />
          <Route path="/student-results" element={<StudentResults />} />
          <Route
            path="/student-report-problem"
            element={<StudentReportProblem />}
          />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
