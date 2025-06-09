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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';

const ViewResults = () => {
  const { user } = useContext(AuthContext);
  const [testIds, setTestIds] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const primaryColor = '#060270';
  const secondaryColor = '#1e3a8a';
  const accentColor = '#93c5fd';

  useEffect(() => {
    const fetchTestIds = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          return;
        }

        const res = await axios.get(
          'http://localhost:5000/api/tests/publish-results-testid',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const fetchedTestIds = Array.isArray(res.data.testIds)
          ? res.data.testIds
          : [];
        setTestIds(fetchedTestIds);

        if (fetchedTestIds.length === 0) {
          setError('No test IDs found.');
        }
      } catch (err) {
        console.error('Fetch Test IDs Error:', err);
        setError(err.response?.data?.message || 'Failed to load test IDs');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.user_type === 'professor') {
      fetchTestIds();
    } else {
      setError('You must be a professor to access this page.');
      setLoading(false);
    }
  }, [user]);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        return;
      }

      const res = await axios.post(
        'http://localhost:5000/api/tests/view-results',
        { choosetid: selectedTestId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setResults(Array.isArray(res.data.results) ? res.data.results : []);
    } catch (err) {
      console.error('View Results Error:', err);
      setError(err.response?.data?.message || 'Failed to load results');
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
                View Results
              </h1>
              <p className="text-lg md:text-xl mb-6 text-gray-200">
                Select a test to review student performance and marks.
              </p>
              <p className="text-base italic text-gray-300 mb-8">
                “Evaluate your students’ progress with ease.”
              </p>
              <Button
                className="bg-transparent border-2 border-white hover:bg-white hover:text-[#060270] text-white font-semibold py-3 px-6 rounded-lg"
                onClick={() =>
                  document
                    .getElementById('view-results')
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
                    id="grad-results"
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
                  fill="url(#grad-results)"
                  opacity="0.2"
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    ease: 'linear',
                    duration: 10,
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
                  transition={{ duration: 1.5, ease: 'easeOut' }}
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
                    ease: 'easeOut',
                  }}
                />
              </svg>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* View Results Section */}
      <section
        id="view-results"
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-0">
            <CardHeader>
              <div className="flex items-center gap-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={primaryColor}
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <CardTitle
                  className="text-3xl font-bold"
                  style={{ color: primaryColor }}
                >
                  View Results
                </CardTitle>
              </div>
              <p className="text-lg text-gray-600 mt-2">
                Select a test to view student results.
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

              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6 mb-6"
                variants={itemVariants}
              >
                <div>
                  <Label htmlFor="testId" style={{ color: secondaryColor }}>
                    Select Test ID
                  </Label>
                  <Select
                    value={selectedTestId}
                    onValueChange={setSelectedTestId}
                    id="testId"
                  >
                    <SelectTrigger className="mt-1 border-[#1e3a8a] focus:ring-[#93c5fd]">
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
                  className="w-full bg-[#060270] hover:bg-[#93c5fd] hover:text-[#060270] transition-all duration-300"
                  disabled={loading || !selectedTestId}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'View Results'
                  )}
                </Button>
              </motion.form>

              {results.length > 0 ? (
                <motion.div variants={itemVariants}>
                  <Table className="w-full">
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
                      {results.map(result => (
                        <TableRow
                          key={result.email}
                          className="hover:bg-gray-50"
                        >
                          <TableCell>{result.email}</TableCell>
                          <TableCell>{result.marks}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </motion.div>
              ) : (
                selectedTestId &&
                !loading && (
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
                      No results available
                    </p>
                  </motion.div>
                )
              )}
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
};

export default ViewResults;
