import React, { useState, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
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
import { Toaster, toast } from 'react-hot-toast';

function AIQuestionGenerator() {
  const { user } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      subject: '',
      topic: '',
      testType: 'objective',
      numQuestions: 5,
    },
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const testType = watch('testType');

  const primaryColor = '#060270';
  const accentColor = '#93c5fd';

  const generateQuestions = async data => {
    // Validate empty or whitespace-only inputs
    if (!data.subject.trim() || !data.topic.trim()) {
      toast.error('Subject and Topic cannot be empty or just whitespace.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/ai/generate-questions',
        {
          subject: data.subject.trim(),
          topic: data.topic.trim(),
          testType: data.testType,
          numQuestions: parseInt(data.numQuestions),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const { success, data: responseData } = response.data;

      if (success) {
        setQuestions(responseData.questions);
        reset({
          subject: '',
          topic: '',
          testType: 'objective',
          numQuestions: 5,
        });
        toast.success('Questions generated successfully!');
      } else {
        setError('Failed to generate questions. Please try again.');
        toast.error('Failed to generate questions.');
      }
    } catch (err) {
      console.error('Question generation error:', err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to generate questions. Please check your input or API configuration.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (questions.length === 0) {
      setError('No questions to download.');
      toast.error('No questions to download.');
      return;
    }

    let headers, rows;
    if (testType === 'objective') {
      headers = [
        'Question #',
        'Question',
        'Option A',
        'Option B',
        'Option C',
        'Option D',
        'Correct Answer',
      ];
      rows = questions.map(q => [
        q.qid,
        `"${q.question.replace(/"/g, '""')}"`,
        `"${q.options.a.replace(/"/g, '""')}"`,
        `"${q.options.b.replace(/"/g, '""')}"`,
        `"${q.options.c.replace(/"/g, '""')}"`,
        `"${q.options.d.replace(/"/g, '""')}"`,
        q.answer,
      ]);
    } else {
      headers = ['Question #', 'Question', 'Answer'];
      rows = questions.map(q => [
        q.qid,
        `"${q.question.replace(/"/g, '""')}"`,
        `"${q.answer.replace(/"/g, '""')}"`,
      ]);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${testType}_questions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Questions downloaded as CSV!');
  };

  const clearResults = () => {
    setQuestions([]);
    reset({
      subject: '',
      topic: '',
      testType: 'objective',
      numQuestions: 5,
    });
    toast.success('Results cleared successfully!');
  };

  if (!user || user.user_type !== 'professor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold" style={{ color: primaryColor }}>
            Unauthorized Access
          </h2>
          <p className="animate-pulse text-gray-600 mt-2">
            You must be logged in as a professor to access this page.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 pt-0 pb-12 relative overflow-hidden">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      {/* Animated Background Pattern */}
      <motion.svg
        className="absolute inset-0 z-0"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0.05 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
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
        className="relative pt-16 pb-20 bg-gradient-to-b from-[#060270] to-[#1e3a8a] text-white"
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
                className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4"
                style={{ color: accentColor }}
              >
                AI Question Generator
              </h1>
              <p className="text-lg md:text-xl mb-6 text-gray-200">
                Effortlessly generate high-quality questions for your exams
                using AI, powered by Grok, created by xAI.
              </p>
              <p className="text-base italic text-gray-300 mb-8">
                “Create smarter assessments.”
              </p>
              <Button
                className="bg-transparent border-2 border-white hover:bg-[#060270] hover:text-[#93c5fd] text-white font-semibold py-3 px-6"
                onClick={() =>
                  document
                    .getElementById('generator-form')
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
                    id="grad-ai"
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
                  fill="url(#grad-ai)"
                  opacity="0.2"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                <motion.path
                  d="M70 100 L90 120 L130 120 L140 100 H150"
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

      {/* Generator Form Section */}
      <section
        id="generator-form"
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="bg-white/95 backdrop-blur-md shadow-2xl rounded-xl border-0">
            <CardHeader>
              <div className="flex items-center gap-4">
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={primaryColor}
                  strokeWidth={2}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </motion.svg>
                <CardTitle
                  className="text-3xl font-bold"
                  style={{ color: primaryColor }}
                >
                  Generate AI Questions
                </CardTitle>
              </div>
              <p className="text-lg text-gray-600 mt-2">
                Input your subject, topic, and preferences to generate questions
                instantly.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form
                onSubmit={handleSubmit(generateQuestions)}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Data Engineering"
                    className="border-[#1e3a8a] focus:ring-[#93c5fd]"
                    {...register('subject', {
                      required: 'Subject is required',
                      validate: value =>
                        value.trim() !== '' || 'Subject cannot be empty',
                    })}
                  />
                  {errors.subject && (
                    <span className="text-red-500 text-sm mt-1 block">
                      {errors.subject.message}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Hadoop"
                    className="border-[#1e3a8a] focus:ring-[#93c5fd]"
                    {...register('topic', {
                      required: 'Topic is required',
                      validate: value =>
                        value.trim() !== '' || 'Topic cannot be empty',
                    })}
                  />
                  {errors.topic && (
                    <span className="text-red-500 text-sm mt-1 block">
                      {errors.topic.message}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Type
                  </label>
                  <Controller
                    name="testType"
                    control={control}
                    rules={{ required: 'Question type is required' }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="border-[#1e3a8a] focus:ring-[#93c5fd]">
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="objective">Objective</SelectItem>
                          <SelectItem value="subjective">Subjective</SelectItem>
                          <SelectItem value="practical">Practical</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.testType && (
                    <span className="text-red-500 text-sm mt-1 block">
                      {errors.testType.message}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Questions
                  </label>
                  <Input
                    type="number"
                    className="border-[#1e3a8a] focus:ring-[#93c5fd]"
                    {...register('numQuestions', {
                      required: 'Number is required',
                      min: { value: 1, message: 'Minimum 1' },
                      max: { value: 20, message: 'Maximum 20' },
                    })}
                  />
                  {errors.numQuestions && (
                    <span className="text-red-500 text-sm mt-1 block">
                      {errors.numQuestions.message}
                    </span>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#060270] hover:bg-[#93c5fd] hover:text-[#060270] transition-all duration-300"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
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
                      Generating...
                    </span>
                  ) : (
                    'Generate AI Questions'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Generated Questions Section */}
      {questions.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="bg-white/95 backdrop-blur-md shadow-2xl rounded-xl border-0">
              <CardHeader>
                <CardTitle
                  className="text-3xl font-bold"
                  style={{ color: primaryColor }}
                >
                  Generated Questions
                </CardTitle>
                <p className="text-lg text-gray-600 mt-2">
                  Review and download your AI-generated questions below.
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Question</TableHead>
                        {testType === 'objective' ? (
                          <>
                            <TableHead>Options</TableHead>
                            <TableHead>Correct Answer</TableHead>
                          </>
                        ) : (
                          <TableHead>Answer</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.map((q, index) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell>{q.qid}</TableCell>
                          <TableCell>{q.question}</TableCell>
                          {testType === 'objective' ? (
                            <>
                              <TableCell>
                                <ul className="list-none">
                                  <li>
                                    <strong>A:</strong> {q.options.a}
                                  </li>
                                  <li>
                                    <strong>B:</strong> {q.options.b}
                                  </li>
                                  <li>
                                    <strong>C:</strong> {q.options.c}
                                  </li>
                                  <li>
                                    <strong>D:</strong> {q.options.d}
                                  </li>
                                </ul>
                              </TableCell>
                              <TableCell>
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                  {q.answer}
                                </span>
                              </TableCell>
                            </>
                          ) : (
                            <TableCell>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                {q.answer}
                              </span>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end mt-6 space-x-3">
                  <Button
                    variant="outline"
                    className="border-[#060270] text-[#060270] hover:bg-[#93c5fd] hover:text-[#060270]"
                    onClick={downloadCSV}
                  >
                    Download CSV
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-600 hover:bg-gray-100"
                    onClick={clearResults}
                  >
                    Clear Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      )}

      {/* Tips Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="bg-white/95 backdrop-blur-md shadow-2xl rounded-xl border-0">
            <CardHeader>
              <div className="flex items-center gap-4">
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={primaryColor}
                  strokeWidth={2}
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </motion.svg>
                <CardTitle
                  className="text-3xl font-bold"
                  style={{ color: primaryColor }}
                >
                  Tips for Using AI Question Generator
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>
                  Be specific with your subject and topic to get more relevant
                  questions (e.g., "Data Engineering" and "Hadoop").
                </li>
                <li>
                  Choose the appropriate question type based on your exam
                  format: Objective for MCQs, Subjective for essays, or
                  Practical for coding questions.
                </li>
                <li>
                  Limit the number of questions to 20 to ensure optimal
                  performance.
                </li>
                <li>
                  Review the generated questions for accuracy before using them
                  in your exams.
                </li>
                <li>
                  Use the "Download CSV" feature to easily import questions into
                  your test creation tool.
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}

export default AIQuestionGenerator;
