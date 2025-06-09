import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Plus, X } from 'lucide-react';

function QuestionManagement() {
  const { user } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [testIds, setTestIds] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const primaryColor = '#060270';
  const secondaryColor = '#1e3a8a';
  const accentColor = '#93c5fd';

  useEffect(() => {
    const fetchTestIds = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/tests/history', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTestIds(
          Array.isArray(res.data.exams)
            ? res.data.exams.map(e => e.test_id)
            : []
        );
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load test IDs');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.user_type === 'professor') {
      fetchTestIds();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchQuestions = async () => {
    if (!selectedTestId) {
      setError('Please select a test ID');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/tests/questions/${selectedTestId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setQuestions(Array.isArray(res.data.questions) ? res.data.questions : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async data => {
    try {
      setLoading(true);
      await axios.post(
        `http://localhost:5000/api/tests/questions/${selectedTestId}`,
        data,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      await fetchQuestions();
      reset();
      setShowAddForm(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = async (qid, questionText) => {
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:5000/api/tests/questions/${selectedTestId}/${qid}`,
        { question: questionText },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      await fetchQuestions();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update question');
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async qid => {
    try {
      setLoading(true);
      await axios.delete(
        `http://localhost:5000/api/tests/questions/${selectedTestId}/${qid}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      await fetchQuestions();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete question');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const svgVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.1, 0.15, 0.1],
      transition: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  if (loading && !testIds.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2
            className="h-12 w-12 animate-spin"
            style={{ color: primaryColor }}
          />
          <p className="mt-4 text-lg font-medium text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.user_type !== 'professor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur-md">
          <CardHeader>
            <CardTitle
              className="text-3xl font-bold"
              style={{ color: primaryColor }}
            >
              Unauthorized Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-lg">
              You must be logged in as a professor to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 pt-0 pb-12 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <motion.svg
        className="absolute inset-0 z-0"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        variants={svgVariants}
        animate="animate"
      >
        <defs>
          <pattern
            id="pattern-circles"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <motion.circle
              cx="10"
              cy="10"
              r="2"
              fill={accentColor}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </pattern>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#pattern-circles)"
        />
      </motion.svg>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative pt-[64px] pb-20 bg-gradient-to-b from-[#060270] to-[#1e3a8a] text-white"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center md:text-left"
            >
              <h1
                className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight"
                style={{ color: accentColor }}
              >
                Manage Questions
              </h1>
              <p className="text-lg md:text-xl mb-6 text-gray-200">
                Easily add, update, or delete questions for your exams.
              </p>
              <p className="text-base italic text-gray-300 mb-8">
                “Craft the perfect exam with seamless question management.”
              </p>
              <Button
                className="bg-transparent border-2 border-white hover:bg-white hover:text-[#060270] text-white font-semibold py-3 px-6 rounded-lg"
                onClick={() =>
                  document
                    .getElementById('question-management')
                    .scrollIntoView({ behavior: 'smooth' })
                }
              >
                Get Started
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="flex justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 200 200"
                className="w-48 h-48"
              >
                <defs>
                  <linearGradient
                    id="grad-question"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: accentColor, stopOpacity: 1 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: primaryColor, stopOpacity: 1 }}
                    />
                  </linearGradient>
                </defs>
                <motion.circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="url(#grad-question)"
                  opacity="0.2"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                <motion.path
                  d="M70 100 L90 120 L130 80 M100 50 L100 150"
                  stroke={accentColor}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                />
                <motion.circle
                  cx="100"
                  cy="100"
                  r="10"
                  fill={accentColor}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </svg>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Question Management Section */}
      <section
        id="question-management"
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={primaryColor}
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <CardTitle
                  className="text-3xl font-bold"
                  style={{ color: primaryColor }}
                >
                  Manage Questions
                </CardTitle>
              </div>
              <p className="text-lg text-gray-700 mt-2">
                Select a test to view, add, update, or delete questions.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              {error && (
                <motion.div variants={itemVariants} className="mb-6">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Test ID Selection */}
              <motion.div variants={itemVariants} className="mb-6">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    fetchQuestions();
                  }}
                  className="flex gap-4 items-end"
                >
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Test ID
                    </label>
                    <Select
                      value={selectedTestId}
                      onValueChange={setSelectedTestId}
                    >
                      <SelectTrigger className="border-[#1e3a8a] focus:ring-[#93c5fd]">
                        <SelectValue placeholder="Select a test" />
                      </SelectTrigger>
                      <SelectContent>
                        {testIds.map(tid => (
                          <SelectItem key={tid} value={tid}>
                            {tid}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    className="bg-[#060270] hover:bg-[#93c5fd] hover:text-[#060270] transition-all duration-300"
                    disabled={loading || !selectedTestId}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      'Load Questions'
                    )}
                  </Button>
                </form>
              </motion.div>

              {/* Add Question Toggle */}
              {selectedTestId && (
                <motion.div variants={itemVariants} className="mb-6">
                  <Button
                    onClick={() => setShowAddForm(prev => !prev)}
                    className="bg-[#1e3a8a] hover:bg-[#93c5fd] hover:text-[#060270] transition-all duration-300"
                  >
                    {showAddForm ? (
                      <>
                        <X className="h-5 w-5 mr-2" /> Hide Form
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5 mr-2" /> Add Question
                      </>
                    )}
                  </Button>
                </motion.div>
              )}

              {/* Add Question Form */}
              {selectedTestId && showAddForm && (
                <motion.div variants={itemVariants} className="mb-6">
                  <form
                    onSubmit={handleSubmit(addQuestion)}
                    className="space-y-4"
                  >
                    <h3
                      className="text-xl font-semibold"
                      style={{ color: primaryColor }}
                    >
                      Add New Question
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter question"
                        className="border-[#1e3a8a] focus:ring-[#93c5fd]"
                        {...register('question', {
                          required: 'Question is required',
                        })}
                      />
                      {errors.question && (
                        <span className="text-red-500 text-sm mt-1 block">
                          {errors.question.message}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Option A
                      </label>
                      <Input
                        type="text"
                        placeholder="Option A"
                        className="border-[#1e3a8a] focus:ring-[#93c5fd]"
                        {...register('options.a', {
                          required: 'Option A is required',
                        })}
                      />
                      {errors.options?.a && (
                        <span className="text-red-500 text-sm mt-1 block">
                          {errors.options.a.message}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Option B
                      </label>
                      <Input
                        type="text"
                        placeholder="Option B"
                        className="border-[#1e3a8a] focus:ring-[#93c5fd]"
                        {...register('options.b', {
                          required: 'Option B is required',
                        })}
                      />
                      {errors.options?.b && (
                        <span className="text-red-500 text-sm mt-1 block">
                          {errors.options.b.message}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Option C
                      </label>
                      <Input
                        type="text"
                        placeholder="Option C"
                        className="border-[#1e3a8a] focus:ring-[#93c5fd]"
                        {...register('options.c', {
                          required: 'Option C is required',
                        })}
                      />
                      {errors.options?.c && (
                        <span className="text-red-500 text-sm mt-1 block">
                          {errors.options.c.message}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Option D
                      </label>
                      <Input
                        type="text"
                        placeholder="Option D"
                        className="border-[#1e3a8a] focus:ring-[#93c5fd]"
                        {...register('options.d', {
                          required: 'Option D is required',
                        })}
                      />
                      {errors.options?.d && (
                        <span className="text-red-500 text-sm mt-1 block">
                          {errors.options.d.message}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correct Answer
                      </label>
                      <Input
                        type="text"
                        placeholder="Correct answer (e.g., A, B, C, D)"
                        className="border-[#1e3a8a] focus:ring-[#93c5fd]"
                        {...register('answer', {
                          required: 'Answer is required',
                        })}
                      />
                      {errors.answer && (
                        <span className="text-red-500 text-sm mt-1 block">
                          {errors.answer.message}
                        </span>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        'Add Question'
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* Questions Table */}
              {questions.length > 0 && (
                <motion.div variants={itemVariants}>
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold text-gray-700">
                          Question
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Options
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Answer
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.map(q => (
                        <TableRow key={q.qid} className="hover:bg-gray-50">
                          <TableCell>{q.question}</TableCell>
                          <TableCell>
                            <ul className="list-none">
                              <li>
                                <strong>A:</strong> {q.options?.a}
                              </li>
                              <li>
                                <strong>B:</strong> {q.options?.b}
                              </li>
                              <li>
                                <strong>C:</strong> {q.options?.c}
                              </li>
                              <li>
                                <strong>D:</strong> {q.options?.d}
                              </li>
                            </ul>
                          </TableCell>
                          <TableCell>{q.answer}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              className="border-yellow-500 text-yellow-500 hover:bg-yellow-100 mr-2"
                              onClick={() => {
                                const newText = prompt(
                                  'New question text:',
                                  q.question
                                );
                                if (newText && newText !== q.question) {
                                  updateQuestion(q.qid, newText);
                                }
                              }}
                              disabled={loading}
                            >
                              Update
                            </Button>
                            <Button
                              variant="outline"
                              className="border-red-500 text-red-500 hover:bg-red-100"
                              onClick={() => deleteQuestion(q.qid)}
                              disabled={loading}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </motion.div>
              )}
              {selectedTestId && !loading && questions.length === 0 && (
                <motion.div
                  variants={itemVariants}
                  className="text-center py-12"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-400 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke={secondaryColor}
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-lg font-medium text-gray-600 mt-4">
                    No questions found for this test
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}

export default QuestionManagement;
