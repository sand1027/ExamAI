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
import { AlertCircle, Loader2 } from 'lucide-react';

function InsertMarks() {
  const { user } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [testIds, setTestIds] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
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
        console.log('Exams:', res.data.exams); // Debug log
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

  const fetchStudents = async () => {
    if (!selectedTestId) {
      setError('Please select a test ID');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/tests/students/${selectedTestId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setStudents(Array.isArray(res.data.students) ? res.data.students : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async data => {
    try {
      setLoading(true);
      await axios.post(
        `http://localhost:5000/api/tests/marks/${selectedTestId}`,
        { marks: data.marks },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      await fetchStudents();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to insert marks');
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
                Insert Marks
              </h1>
              <p className="text-lg md:text-xl mb-6 text-gray-200">
                Assign marks to students for their exams with ease.
              </p>
              <p className="text-base italic text-gray-300 mb-8">
                “Streamline grading for your assessments.”
              </p>
              <Button
                className="bg-transparent border-2 border-white hover:bg-white hover:text-[#060270] text-white font-semibold py-3 px-6 rounded-lg"
                onClick={() =>
                  document
                    .getElementById('insert-marks')
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
                    id="grad-marks"
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
                  fill="url(#grad-marks)"
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

      {/* Insert Marks Section */}
      <section
        id="insert-marks"
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
                  Insert Marks
                </CardTitle>
              </div>
              <p className="text-lg text-gray-700 mt-2">
                Select a test and assign marks to students.
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
                    fetchStudents();
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
                      'Load Students'
                    )}
                  </Button>
                </form>
              </motion.div>

              {/* Marks Input Table */}
              {students.length > 0 && (
                <motion.div variants={itemVariants}>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Table className="w-full mb-6">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold text-gray-700">
                            Email
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Marks
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map(s => (
                          <TableRow key={s.email} className="hover:bg-gray-50">
                            <TableCell>{s.email}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                className="border-[#1e3a8a] focus:ring-[#93c5fd]"
                                {...register(`marks.${s.email}`, {
                                  required: 'Marks are required',
                                  min: {
                                    value: 0,
                                    message: 'Marks cannot be negative',
                                  },
                                })}
                                defaultValue={s.marks || 0}
                              />
                              {errors.marks?.[s.email] && (
                                <span className="text-red-500 text-sm mt-1 block">
                                  {errors.marks[s.email].message}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Button
                      type="submit"
                      className="bg-[#060270] hover:bg-[#93c5fd] hover:text-[#060270] transition-all duration-300"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        'Submit Marks'
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* Empty State */}
              {selectedTestId && !loading && students.length === 0 && (
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
                    No students found for this test
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

export default InsertMarks;
