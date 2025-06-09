import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AceEditor from 'react-ace';
import { AuthContext } from '../context/AuthContext';
import Proctoring from '../components/Proctoring';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Code } from 'lucide-react';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';

function PracticalTestPage() {
  const { test_id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQid, setCurrentQid] = useState(1);
  const [code, setCode] = useState({});
  const [input, setInput] = useState({});
  const [output, setOutput] = useState({});
  const [testResults, setTestResults] = useState({});
  const [bookmarks, setBookmarks] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(null);
  const [message, setMessage] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcValue, setCalcValue] = useState('');
  const [executing, setExecuting] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [violations, setViolations] = useState([]);

  const primaryColor = '#060270';
  const accentColor = '#93c5fd';

  // Fetch test data
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching test_id:', test_id);
        console.log('Token:', token);
        if (!token) {
          setError('Please log in to access the test');
          setLoading(false);
          return;
        }
        const res = await axios.get(
          `http://localhost:5000/api/student/test-practical/${test_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log('Test data:', res.data);
        if (!res.data.questions || res.data.questions.length === 0) {
          setError('No questions found for this test');
          setLoading(false);
          return;
        }
        setTestData(res.data);
        setBookmarks(new Set(res.data.bookmarked || []));
        setTimeLeft(res.data.duration);

        // Load saved answers if available
        if (res.data.saved_answers) {
          const savedCode = {};
          const savedInput = {};
          res.data.saved_answers.forEach(answer => {
            savedCode[answer.qid] = answer.code || '';
            savedInput[answer.qid] = answer.input || '';
          });
          setCode(savedCode);
          setInput(savedInput);
        }

        // Set default language based on test.compiler (optional)
        setLanguage(res.data.compiler === '116' ? 'python' : 'javascript');

        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        const errorMsg = err.response?.data?.message || 'Failed to load test';
        setError(`${errorMsg} (Status: ${err.response?.status || 'Unknown'})`);
        setLoading(false);
      }
    };
    fetchTestData();
  }, [test_id]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setMessage('Time is up! Submitting all answers...');
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Execute code against test cases
  const executeCode = async () => {
    try {
      setExecuting(true);
      setMessage('');
      const token = localStorage.getItem('token');
      const question = testData.questions.find(q => q.qid === currentQid);
      if (!question) {
        setMessage('Question not found');
        return;
      }

      // Custom input execution
      const customInputPayload = {
        test_id,
        qid: question.qid,
        codeByStudent: code[currentQid] || '',
        inputByStudent: input[currentQid] || '',
        executedByStudent: true,
        execute_only: true,
        language,
      };

      const customRes = await axios.post(
        `http://localhost:5000/api/student/test-practical/${test_id}/execute`,
        customInputPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Custom execution response:', customRes.data);

      // Update output state with custom execution result
      setOutput(prev => ({
        ...prev,
        [currentQid]: customRes.data.error
          ? `Error: ${customRes.data.error}`
          : customRes.data.status !== 'Accepted'
            ? `Execution failed: ${customRes.data.status}`
            : customRes.data.output
              ? String(customRes.data.output).trim()
              : 'No output produced (check code or input)',
      }));

      // Test cases execution
      const testCasesPayload = {
        test_id,
        qid: question.qid,
        codeByStudent: code[currentQid] || '',
        language,
      };

      const testCasesRes = await axios.post(
        `http://localhost:5000/api/student/test-practical/${test_id}/test-cases`,
        testCasesPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Test cases response:', testCasesRes.data);

      setTestResults(prev => ({
        ...prev,
        [currentQid]: testCasesRes.data.results || [],
      }));

      setMessage('Code executed successfully');
    } catch (err) {
      console.error('Execute error:', err);
      const errorMsg = err.response?.data?.message || 'Execution failed';
      setMessage(errorMsg);
      setOutput(prev => ({
        ...prev,
        [currentQid]: `Error: ${errorMsg}`,
      }));
    } finally {
      setExecuting(false);
    }
  };

  // Handle code submission for a single question
  const handleSubmit = async () => {
    try {
      setExecuting(true);
      const token = localStorage.getItem('token');
      const question = testData.questions.find(q => q.qid === currentQid);
      if (!question) {
        setMessage('Question not found');
        return;
      }
      const payload = {
        test_id,
        qid: question.qid,
        codeByStudent: code[currentQid] || '',
        inputByStudent: input[currentQid] || '',
        executedByStudent: true,
        language,
      };
      console.log('Submitting:', payload);
      const res = await axios.post(
        `http://localhost:5000/api/student/test-practical/${test_id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Submission response:', res.data);

      // Update test results if returned
      if (res.data.test_results) {
        setTestResults(prev => ({
          ...prev,
          [currentQid]: res.data.test_results,
        }));
      }

      setOutput(prev => ({
        ...prev,
        [currentQid]: res.data.error
          ? `Error: ${res.data.error}`
          : res.data.status !== 'Accepted'
            ? `Execution failed: ${res.data.status}`
            : res.data.output
              ? String(res.data.output).trim()
              : 'No output produced (check code or input)',
      }));

      setMessage(
        `Submitted successfully: ${res.data.message}, Marks: ${res.data.marks || 'N/A'}`
      );
    } catch (err) {
      console.error('Submit error:', err);
      const errorMsg = err.response?.data?.message || 'Submission failed';
      setMessage(errorMsg);
      setOutput(prev => ({
        ...prev,
        [currentQid]: `Error: ${errorMsg}`,
      }));
    } finally {
      setExecuting(false);
    }
  };

  // Handle bookmark toggle
  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem('token');
      const question = testData.questions.find(q => q.qid === currentQid);
      const newBookmarks = new Set(bookmarks);
      const isBookmarked = newBookmarks.has(question.qid);
      if (isBookmarked) {
        newBookmarks.delete(question.qid);
      } else {
        newBookmarks.add(question.qid);
      }
      const payload = {
        test_id,
        qid: question.qid,
        bookmark: !isBookmarked,
      };
      console.log('Bookmark payload:', payload);
      await axios.post(
        `http://localhost:5000/api/student/test-practical/${test_id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBookmarks(newBookmarks);
      setMessage(isBookmarked ? 'Bookmark removed' : 'Bookmark added');
    } catch (err) {
      console.error('Bookmark error:', err);
      setMessage(err.response?.data?.message || 'Bookmark update failed');
    }
  };

  // Submit all answers
  const submitTest = async () => {
    setShowStats(true);
  };

  // Confirm final submission
  const confirmSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      for (const question of testData.questions) {
        if (code[question.qid]) {
          const payload = {
            test_id,
            qid: question.qid,
            codeByStudent: code[question.qid] || '',
            inputByStudent: input[question.qid] || '',
            executedByStudent: true,
            language,
          };
          await axios.post(
            `http://localhost:5000/api/student/test-practical/${test_id}`,
            payload,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }
      }
      setMessage('Test submitted successfully');
      navigate('/test');
    } catch (err) {
      console.error('Final submit error:', err);
      setMessage(err.response?.data?.message || 'Final submission failed');
    }
  };

  // Save current code without submitting
  const saveCode = async () => {
    try {
      const token = localStorage.getItem('token');
      const question = testData.questions.find(q => q.qid === currentQid);
      if (!question) {
        setMessage('Question not found');
        return;
      }
      const payload = {
        test_id,
        qid: question.qid,
        codeByStudent: code[currentQid] || '',
        inputByStudent: input[currentQid] || '',
        save_only: true,
        language,
      };
      await axios.post(
        `http://localhost:5000/api/student/practical/${test_id}/save`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage('Code saved successfully');
    } catch (err) {
      console.error('Save error:', err);
      setMessage(err.response?.data?.message || 'Save failed');
    }
  };

  // Calculator logic
  const handleCalculator = value => {
    if (value === '=') {
      try {
        setCalcValue(eval(calcValue).toString());
      } catch {
        setCalcValue('Error');
      }
    } else if (value === 'C') {
      setCalcValue('');
    } else {
      setCalcValue(calcValue + value);
    }
  };

  // Format time (MM:SS)
  const formatTime = seconds => {
    if (!seconds || seconds <= 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user || user.user_type !== 'student') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Alert
            variant="destructive"
            className="bg-red-100 border-red-500 text-red-700 p-4 rounded-lg"
          >
            <AlertDescription>Unauthorized Access</AlertDescription>
          </Alert>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <svg
            className="animate-spin h-8 w-8 text-[#060270]"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Alert
            variant="destructive"
            className="bg-red-100 border-red-500 text-red-700 p-4 rounded-lg"
          >
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            className="mt-4 bg-[#060270] hover:bg-[#93c5fd] hover:text-[#060270] text-white"
            onClick={() => navigate('/access-test')}
          >
            Back to Test Access
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!testData || !testData.questions || testData.questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Alert
            variant="warning"
            className="bg-yellow-100 border-yellow-500 text-yellow-700 p-4 rounded-lg"
          >
            <AlertDescription>
              No questions found for this test.
            </AlertDescription>
          </Alert>
          <Button
            className="mt-4 bg-[#060270] hover:bg-[#93c5fd] hover:text-[#060270] text-white"
            onClick={() => navigate('/access-test')}
          >
            Back to Test Access
          </Button>
        </motion.div>
      </div>
    );
  }

  const question = testData.questions.find(q => q.qid === currentQid);
  if (!question) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Alert
            variant="warning"
            className="bg-yellow-100 border-yellow-500 text-yellow-700 p-4 rounded-lg"
          >
            <AlertDescription>Question not found.</AlertDescription>
          </Alert>
          <Button
            className="mt-4 bg-[#060270] hover:bg-[#93c5fd] hover:text-[#060270] text-white"
            onClick={() => navigate('/access-test')}
          >
            Back to Test Access
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_200px] gap-4 h-[calc(100vh-8rem)]">
            {/* Left: Vertical Question List */}
            <div className="bg-gray-100 p-4 rounded-lg overflow-y-auto">
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: primaryColor }}
              >
                Questions
              </h3>
              <div className="flex flex-col space-y-2">
                {testData.questions.map(q => (
                  <Button
                    key={q.qid}
                    onClick={() => {
                      setCurrentQid(q.qid);
                      setMessage('');
                    }}
                    className={`p-2 rounded-lg text-left ${
                      currentQid === q.qid
                        ? 'bg-[#060270] text-white hover:bg-[#1e3a8a]'
                        : bookmarks.has(q.qid)
                          ? 'bg-yellow-200 hover:bg-yellow-300'
                          : code[q.qid]
                            ? 'bg-green-200 hover:bg-green-300'
                            : 'bg-white hover:bg-gray-100'
                    } transition-colors`}
                  >
                    Question {q.qid}
                  </Button>
                ))}
              </div>
            </div>

            {/* Center: Question and Editor */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: primaryColor }}
                >
                  Practical Test: {testData.subject} - {testData.topic}
                </h2>
                <div className="text-lg font-semibold text-red-600">
                  Time Left: {formatTime(timeLeft)}
                </div>
              </div>
              {message && (
                <Alert
                  variant={
                    message.includes('successfully') ? 'success' : 'destructive'
                  }
                  className={`p-4 rounded-lg ${
                    message.includes('successfully')
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : 'bg-red-100 border-red-500 text-red-700'
                  }`}
                >
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
              <Card className="border-none mb-4">
                <CardHeader>
                  <CardTitle>Question {question.qid}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{question.question}</p>
                  <p className="text-gray-600 mt-2">
                    Max Marks: {question.max_marks}
                  </p>
                </CardContent>
              </Card>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Code className="w-5 h-5 mr-2" />
                    Language
                  </label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="border-[#1e3a8a] focus:ring-[#93c5fd]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">
                        JavaScript (Node.js)
                      </SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code
                  </label>
                  <AceEditor
                    mode={language}
                    theme="monokai"
                    value={code[currentQid] || ''}
                    onChange={value =>
                      setCode(prev => ({ ...prev, [currentQid]: value }))
                    }
                    width="100%"
                    height="300px"
                    setOptions={{ useWorker: false }}
                    className="rounded-lg border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Input
                  </label>
                  <Textarea
                    rows={3}
                    value={input[currentQid] || ''}
                    onChange={e =>
                      setInput(prev => ({
                        ...prev,
                        [currentQid]: e.target.value,
                      }))
                    }
                    placeholder="Enter input for your code"
                    className="border-[#1e3a8a] focus:ring-[#93c5fd]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Output
                  </label>
                  <Textarea
                    rows={3}
                    value={output[currentQid] || ''}
                    readOnly
                    placeholder="Your code output or error will appear here"
                    className="border-[#1e3a8a] focus:ring-[#93c5fd]"
                  />
                </div>
                {testResults[currentQid]?.length > 0 && (
                  <Card className="border-none">
                    <CardHeader>
                      <CardTitle>Test Case Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible>
                        {testResults[currentQid].map((result, idx) => (
                          <AccordionItem value={`item-${idx}`} key={idx}>
                            <AccordionTrigger>
                              Test Case {idx + 1}
                              <Badge
                                variant={
                                  result.passed ? 'success' : 'destructive'
                                }
                                className={`ml-2 ${
                                  result.passed ? 'bg-green-500' : 'bg-red-500'
                                }`}
                              >
                                {result.passed ? 'Passed' : 'Failed'}
                              </Badge>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2">
                                <div>
                                  <strong>Input:</strong>
                                  <pre className="border p-2 bg-gray-100 rounded">
                                    {result.input}
                                  </pre>
                                </div>
                                <div>
                                  <strong>Expected Output:</strong>
                                  <pre className="border p-2 bg-gray-100 rounded">
                                    {result.expected_output}
                                  </pre>
                                </div>
                                <div>
                                  <strong>Your Output:</strong>
                                  <pre className="border p-2 bg-gray-100 rounded">
                                    {result.actual_output}
                                  </pre>
                                </div>
                                {result.error && (
                                  <div>
                                    <strong>Error:</strong>
                                    <pre className="border p-2 bg-red-100 text-red-700 rounded">
                                      {result.error}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                )}
                <div className="flex space-x-2 flex-wrap gap-2">
                  <Button
                    onClick={handleBookmark}
                    className={`${
                      bookmarks.has(question.qid)
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        : 'bg-gray-200 hover:bg-gray-300 text-black'
                    }`}
                  >
                    {bookmarks.has(question.qid) ? 'Unbookmark' : 'Bookmark'}
                  </Button>
                  <Button
                    onClick={executeCode}
                    disabled={executing}
                    className="bg-[#93c5fd] hover:bg-[#1e3a8a] text-[#060270]"
                  >
                    {executing ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Executing...
                      </span>
                    ) : (
                      'Execute Code'
                    )}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={executing}
                    className="bg-[#060270] hover:bg-[#93c5fd] hover:text-[#060270] text-white"
                  >
                    {executing ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Question'
                    )}
                  </Button>
                  <Button
                    onClick={saveCode}
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Save Code
                  </Button>
                  <Button
                    onClick={submitTest}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Submit Test
                  </Button>
                  <Button
                    onClick={() => setShowCalculator(!showCalculator)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {showCalculator ? 'Hide Calculator' : 'Show Calculator'}
                  </Button>
                </div>
                {showCalculator && (
                  <Card className="mt-4 border-none">
                    <CardContent className="p-4">
                      <Input
                        value={calcValue}
                        readOnly
                        className="mb-2 border-[#1e3a8a] focus:ring-[#93c5fd]"
                      />
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          '1',
                          '2',
                          '3',
                          '+',
                          '4',
                          '5',
                          '6',
                          '-',
                          '7',
                          '8',
                          '9',
                          '*',
                          '0',
                          '.',
                          '=',
                          '/',
                        ].map(val => (
                          <Button
                            key={val}
                            onClick={() => handleCalculator(val)}
                            className="bg-gray-200 hover:bg-gray-300 text-black"
                          >
                            {val}
                          </Button>
                        ))}
                        <Button
                          onClick={() => handleCalculator('C')}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          C
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Right: Proctoring and Violations */}
            <div className="bg-gray-100 p-4 rounded-lg flex flex-col space-y-4">
              <Proctoring
                testId={test_id}
                token={localStorage.getItem('token')}
                setViolations={setViolations}
                style={{ width: '150px', height: '112.5px' }}
              />
              <div className="flex-1 overflow-y-auto">
                <h3
                  className="text-lg font-semibold mb-2 flex items-center"
                  style={{ color: primaryColor }}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Violations
                </h3>
                {violations.length > 0 ? (
                  <ul className="space-y-2">
                    {violations.map((violation, index) => (
                      <li key={index} className="text-sm text-red-600">
                        {violation}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">
                    No violations detected.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submission Dialog */}
          <Dialog open={showStats} onOpenChange={setShowStats}>
            <DialogContent className="sm:max-w-md">
              <DialogTitle className="text-xl font-bold">
                Submission Statistics
              </DialogTitle>
              <div className="space-y-2">
                <p>Total Questions: {testData.questions.length}</p>
                <p>Answered: {Object.keys(code).length}</p>
                <p>Bookmarked: {bookmarks.size}</p>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => setShowStats(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmSubmit}
                  className="bg-[#060270] hover:bg-[#93c5fd] hover:text-[#060270] text-white"
                >
                  Confirm Submit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </main>
    </div>
  );
}

export default PracticalTestPage;
