import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useForm, Controller } from 'react-hook-form';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

function ShareExam() {
  const { user } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const [testIds, setTestIds] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const primaryColor = '#060270';
  const accentColor = '#93c5fd';

  useEffect(() => {
    const fetchTestIds = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tests/history', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTestIds(res.data.exams.map(e => e.test_id));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load test IDs');
      }
    };

    if (user && user.user_type === 'professor') {
      fetchTestIds();
    }
  }, [user]);

  const onSubmit = async data => {
    try {
      const payload = {
        test_id: data.test_id,
        emails: data.emails.split(',').map(email => email.trim()),
      };

      const res = await axios.post(
        'http://localhost:5000/api/tests/share',
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setMessage(res.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to share exam');
      setMessage('');
    }
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
          <p className="text-gray-600 mt-2">
            You must be logged in as a professor to access this page.
          </p>
        </motion.div>
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
                Share Exam
              </h1>
              <p className="text-lg md:text-xl mb-6 text-gray-200">
                Easily share your exams with students or colleagues via email.
              </p>
              <p className="text-base italic text-gray-300 mb-8">
                “Collaborate seamlessly with secure sharing.”
              </p>
              <Button
                className="bg-transparent border-2 border-white hover:bg-white hover:text-[#060270] text-white font-semibold py-3 px-6 rounded-lg"
                onClick={() =>
                  document
                    .getElementById('share-form')
                    .scrollIntoView({ behavior: 'smooth' })
                }
              >
                Share Now
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
                    id="grad-share"
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
                  fill="url(#grad-share)"
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

      {/* Share Form Section */}
      <section
        id="share-form"
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
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </motion.svg>
                <CardTitle
                  className="text-3xl font-bold"
                  style={{ color: primaryColor }}
                >
                  Share Exam
                </CardTitle>
              </div>
              <p className="text-lg text-gray-600 mt-2">
                Select a test and enter the recipient emails to share securely.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              {message && (
                <Alert variant="success" className="mb-4">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test ID
                  </label>
                  <Controller
                    name="test_id"
                    control={control}
                    rules={{ required: 'Test ID is required' }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        className="border-[#1e3a8a] focus:ring-[#93c5fd]"
                      >
                        <SelectTrigger>
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
                    )}
                  />
                  {errors.test_id && (
                    <span className="text-red-500 text-sm mt-1 block">
                      {errors.test_id.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Emails (comma-separated)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. user1@example.com, user2@example.com"
                    className="border-[#1e3a8a] focus:ring-[#93c5fd]"
                    {...register('emails', { required: 'Emails are required' })}
                  />
                  {errors.emails && (
                    <span className="text-red-500 text-sm mt-1 block">
                      {errors.emails.message}
                    </span>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#060270] hover:bg-[#93c5fd] hover:text-[#060270] transition-all duration-300"
                >
                  Share Exam
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </section>

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
                  Tips for Sharing Exams
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>
                  Ensure the test ID is correct to avoid sharing the wrong exam.
                </li>
                <li>
                  Enter multiple emails separated by commas (e.g.,
                  user1@example.com, user2@example.com).
                </li>
                <li>
                  Verify recipient emails to ensure they are correct and belong
                  to the intended users.
                </li>
                <li>
                  Shared exams are secure and accessible only to the specified
                  recipients.
                </li>
                <li>
                  Contact support if you encounter any issues during sharing.
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}

export default ShareExam;
