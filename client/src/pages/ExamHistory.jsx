import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ExamHistory = () => {
  const { user } = useContext(AuthContext);
  const [exams, setExams] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const primaryColor = '#060270';
  const secondaryColor = '#1e3a8a';
  const accentColor = '#93c5fd';

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/tests/history', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (Array.isArray(res.data.exams)) {
          setExams(res.data.exams);
        } else {
          setError('Invalid exam data format');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load exam history');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.user_type === 'professor') {
      fetchExams();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getExamStatus = (start, end) => {
    const currentTime = new Date();
    const startTime = new Date(start);
    const endTime = new Date(end);

    const timeDiffInMinutes = (startTime - currentTime) / (1000 * 60);

    if (startTime <= currentTime && endTime >= currentTime) {
      return { status: 'Ongoing', color: 'green' };
    } else if (timeDiffInMinutes > 0 && timeDiffInMinutes <= 30) {
      return { status: 'Starting Soon', color: 'orange' };
    } else {
      return { status: 'Completed', color: 'red' };
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

  if (loading) {
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
                Exam History
              </h1>
              <p className="text-lg md:text-xl mb-6 text-gray-200">
                Review all the exams you have created, including their status
                and details.
              </p>
              <p className="text-base italic text-gray-300 mb-8">
                “Manage your assessments efficiently.”
              </p>
              <Button
                className="bg-transparent border-2 border-white hover:bg-white hover:text-[#060270] text-white font-semibold py-3 px-6 rounded-lg"
                onClick={() =>
                  document
                    .getElementById('exam-history')
                    .scrollIntoView({ behavior: 'smooth' })
                }
              >
                View History
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
                    id="grad-exam"
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
                  fill="url(#grad-exam)"
                  opacity="0.2"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                <motion.path
                  d="M60 100 H140 M140 100 L120 80 M140 100 L120 120"
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

      {/* Exam History Section */}
      <section
        id="exam-history"
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <CardTitle
                  className="text-3xl font-bold"
                  style={{ color: primaryColor }}
                >
                  Exam History
                </CardTitle>
              </div>
              <p className="text-lg text-gray-700 mt-2">
                Review the history of all exams you have created.
              </p>
            </CardHeader>
            <CardContent>
              {error && (
                <motion.div variants={itemVariants} className="mb-6">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
              <motion.div variants={itemVariants}>
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold text-gray-700">
                        Test ID
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Title
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Topic
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Type
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Start Date
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Start Time
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        End Date
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        End Time
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.length > 0 ? (
                      exams.map(exam => {
                        const { status, color } = getExamStatus(
                          exam.start_date,
                          exam.end_date
                        );
                        return (
                          <TableRow
                            key={exam.test_id}
                            className="hover:bg-gray-50"
                          >
                            <TableCell>{exam.test_id}</TableCell>
                            <TableCell>{exam.subject}</TableCell>
                            <TableCell>{exam.topic}</TableCell>
                            <TableCell>{exam.test_type}</TableCell>
                            <TableCell>
                              {new Date(exam.start_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(exam.start_date).toLocaleTimeString()}
                            </TableCell>
                            <TableCell>
                              {new Date(exam.end_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(exam.end_date).toLocaleTimeString()}
                            </TableCell>
                            <TableCell>
                              <span style={{ color, fontWeight: 'bold' }}>
                                {status}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12">
                          <motion.div
                            variants={itemVariants}
                            className="flex flex-col items-center gap-4"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-16 w-16 text-gray-400"
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
                            <p className="text-lg font-medium text-gray-600">
                              No exams created
                            </p>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
};

export default ExamHistory;
