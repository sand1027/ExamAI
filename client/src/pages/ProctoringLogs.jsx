import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, Loader2 } from 'lucide-react';

function ProctoringLogs() {
  const { user } = useContext(AuthContext);
  const [testIds, setTestIds] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentViolations, setStudentViolations] = useState({});
  const primaryColor = '#060270';
  const secondaryColor = '#1e3a8a';
  const accentColor = '#93c5fd';

  useEffect(() => {
    const fetchTestIds = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in again.');
          return;
        }
        const res = await axios.get(
          'http://localhost:5000/api/proctor/livemonitoringtid',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const fetchedTestIds = Array.isArray(res.data.testIds)
          ? res.data.testIds
          : [];
        setTestIds(fetchedTestIds);
        if (fetchedTestIds.length === 0) {
          setError('No active tests found for monitoring.');
        }
      } catch (err) {
        console.error('Error fetching test IDs:', err);
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

  useEffect(() => {
    const violationsByStudent = logs.reduce((acc, log) => {
      if (log.details.violation && log.details.violation !== 'None') {
        const email = log.details.email || 'Unknown';
        if (!acc[email]) {
          acc[email] = {
            name: log.details.name || 'Unknown',
            logs: [],
          };
        }
        acc[email].logs.push(log);
      }
      return acc;
    }, {});
    setStudentViolations(violationsByStudent);
    console.log('ProctoringLogs - Student violations:', violationsByStudent);
  }, [logs]);

  const fetchLogs = async () => {
    if (!selectedTestId) {
      setError('Please select a test ID');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }
      console.log(
        `ProctoringLogs - Fetching logs for test ID: ${selectedTestId}`
      );
      const res = await axios.get(
        `http://localhost:5000/api/proctor/logs/${selectedTestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fetchedLogs = Array.isArray(res.data.logs) ? res.data.logs : [];
      console.log('ProctoringLogs - Fetched logs:', fetchedLogs);
      setLogs(fetchedLogs);
      if (fetchedLogs.length === 0) {
        setError('No logs found for the selected test.');
      }
    } catch (err) {
      console.error('ProctoringLogs - Error fetching logs:', err);
      setError(
        `${err.response?.data?.message || 'Failed to load logs'}. Status: ${
          err.response?.status || 'unknown'
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshTestIds = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(
        'http://localhost:5000/api/proctor/livemonitoringtid',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fetchedTestIds = Array.isArray(res.data.testIds)
        ? res.data.testIds
        : [];
      setTestIds(fetchedTestIds);
      if (fetchedTestIds.length === 0) {
        setError('No active tests found for monitoring.');
      } else {
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to refresh test IDs');
    } finally {
      setLoading(false);
    }
  };

  const handleShowViolations = email => {
    setSelectedStudent(email);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur-md">
          <CardContent className="p-6 text-center">
            <Alert variant="warning">
              <AlertDescription>
                Loading user information or not logged in. Please wait or log
                in.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.user_type !== 'professor') {
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
                Proctoring Logs
              </h1>
              <p className="text-lg md:text-xl mb-6 text-gray-200">
                Review proctoring logs and student violations for secure exams.
              </p>
              <p className="text-base italic text-gray-300 mb-8">
                “Ensure exam integrity with detailed monitoring.”
              </p>
              <Button
                className="bg-transparent border-2 border-white hover:bg-white hover:text-[#060270] text-white font-semibold py-3 px-6 rounded-lg"
                onClick={() =>
                  document
                    .getElementById('proctoring-logs')
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
                    id="grad-logs"
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
                  fill="url(#grad-logs)"
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

      {/* Proctoring Logs Section */}
      <section
        id="proctoring-logs"
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <CardTitle
                  className="text-3xl font-bold"
                  style={{ color: primaryColor }}
                >
                  Proctoring Logs
                </CardTitle>
              </div>
              <p className="text-lg text-gray-700 mt-2">
                Select a test to view proctoring logs and violations.
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
              <motion.form
                onSubmit={e => {
                  e.preventDefault();
                  fetchLogs();
                }}
                variants={itemVariants}
                className="flex gap-4 mb-6 items-end"
              >
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Test ID
                  </label>
                  <Select
                    value={selectedTestId}
                    onValueChange={setSelectedTestId}
                    disabled={loading || testIds.length === 0}
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
                    'Load Logs'
                  )}
                </Button>
                {testIds.length === 0 && !loading && (
                  <Button
                    onClick={refreshTestIds}
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                    disabled={loading}
                  >
                    Refresh Test IDs
                  </Button>
                )}
                {selectedTestId && (
                  <Button
                    onClick={fetchLogs}
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                    disabled={loading}
                  >
                    Refresh Logs
                  </Button>
                )}
              </motion.form>
              {Object.keys(studentViolations).length > 0 && (
                <motion.div variants={itemVariants} className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">
                    Students with Violations
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(studentViolations).map(
                      ([email, { name }]) => (
                        <Button
                          key={email}
                          onClick={() => handleShowViolations(email)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white"
                        >
                          {name} ({email})
                        </Button>
                      )
                    )}
                  </div>
                </motion.div>
              )}
              {loading && (
                <motion.div
                  variants={itemVariants}
                  className="text-center py-12"
                >
                  <Loader2
                    className="h-8 w-8 animate-spin mx-auto"
                    style={{ color: primaryColor }}
                  />
                  <p className="mt-2 text-gray-600">Loading data...</p>
                </motion.div>
              )}
              {!loading && logs.length === 0 && selectedTestId && (
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
                    No logs available for the selected test.
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Violation Dialog */}
        <Dialog open={showModal} onOpenChange={handleCloseModal}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>
                Violation Logs for{' '}
                {selectedStudent && studentViolations[selectedStudent]?.name} (
                {selectedStudent})
              </DialogTitle>
            </DialogHeader>
            {selectedStudent &&
            studentViolations[selectedStudent]?.logs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Violation</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Image</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentViolations[selectedStudent].logs.map(log => {
                    console.log('ProctoringLogs - Rendering log:', {
                      id: log._id,
                      snapshot_url: log.snapshot_url,
                      snapshotUrl: log.snapshotUrl,
                      details: log.details,
                    });
                    const imageUrl = log.snapshot_url || log.snapshotUrl;
                    return (
                      <TableRow key={log._id}>
                        <TableCell>
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>{log.event}</TableCell>
                        <TableCell>
                          <span className="text-red-600">
                            {log.details.violation}
                          </span>
                        </TableCell>
                        <TableCell>
                          <pre className="max-h-[100px] overflow-auto text-xs bg-gray-100 p-2 rounded">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </TableCell>
                        <TableCell>
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt="Violation snapshot"
                              className="max-w-[150px] max-h-[100px] object-contain border border-gray-200 rounded"
                              onError={e => {
                                e.target.alt = 'Failed to load image';
                                e.target.className = 'text-red-500';
                              }}
                            />
                          ) : (
                            <span className="text-gray-500">
                              No image available
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-600">
                No violation logs found for this student.
              </p>
            )}
            <DialogFooter>
              <Button onClick={handleCloseModal}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
}

export default ProctoringLogs;
