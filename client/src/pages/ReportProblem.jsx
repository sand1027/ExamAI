import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

const ReportProblem = () => {
  const { user } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const primaryColor = '#060270';
  const secondaryColor = '#1e3a8a';
  const accentColor = '#93c5fd';

  const onSubmit = async data => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await axios.post(
        'http://localhost:5000/api/support/report',
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setMessage(res.data.message);
      reset();
    } catch (err) {
      console.error('Report submission error:', err);
      setError(err.response?.data?.message || 'Failed to report problem');
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

  if (!user) {
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
              You must be logged in to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background SVG */}
      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 z-0"
        variants={svgVariants}
        animate="animate"
      >
        {[...Array(12)].map((_, i) =>
          [...Array(8)].map((_, j) => (
            <motion.circle
              key={`${i}-${j}`}
              cx={120 + i * 120}
              cy={100 + j * 100}
              r="8"
              fill={accentColor}
              fillOpacity="0.2"
              variants={{
                animate: {
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2],
                  transition: {
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: (i + j) * 0.2,
                  },
                },
              }}
              animate="animate"
            />
          ))
        )}
        <path
          d="M120 100 H1320 M120 200 H1320 M120 300 H1320 M120 400 H1320 M120 500 H1320 M120 600 H1320 M120 700 H1320 M120 800 H1320 M120 100 V800 M240 100 V800 M360 100 V800 M480 100 V800 M600 100 V800 M720 100 V800 M840 100 V800 M960 100 V800 M1080 100 V800 M1200 100 V800 M1320 100 V800"
          stroke={secondaryColor}
          strokeWidth="1"
          strokeOpacity="0.1"
        />
        <motion.path
          d="M720 450 L820 350 L920 450 L820 550 Z"
          fill={primaryColor}
          fillOpacity="0.2"
          variants={{
            animate: {
              scale: [1, 1.1, 1],
              rotate: [0, 90, 0],
              transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
            },
          }}
          animate="animate"
        />
      </motion.svg>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative py-20 bg-gradient-to-b from-[#060270] to-[#1e3a8a] text-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <motion.div
              variants={itemVariants}
              className="text-center md:text-left"
            >
              <h1
                className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight"
                style={{ color: accentColor }}
              >
                Report an Issue
              </h1>
              <p className="text-lg md:text-xl mb-6 text-gray-200">
                Let us know about any problems you're facing, and we'll assist
                you promptly.
              </p>
              <p className="text-base italic text-gray-300 mb-8">
                “Your feedback helps us improve your experience.”
              </p>
            </motion.div>
            {/* Right: Animated SVG */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center"
              animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 200 200"
                className="w-48 h-48"
              >
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop
                      offset="0%"
                      style={{ stopColor: accentColor, stopOpacity: 1 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: secondaryColor, stopOpacity: 1 }}
                    />
                  </linearGradient>
                </defs>
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="url(#grad)"
                  opacity="0.2"
                />
                <path
                  d="M70 100 L90 120 L130 80 M100 100 L100 130"
                  stroke={accentColor}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="100" r="10" fill={accentColor} />
              </svg>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Form Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-2xl relative z-10"
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
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <CardTitle
                className="text-3xl font-bold"
                style={{ color: primaryColor }}
              >
                Report a Problem
              </CardTitle>
            </div>
            <p className="text-lg text-gray-600 mt-2">
              Fill out the form below to report any issues.
            </p>
          </CardHeader>
          <CardContent>
            {message && (
              <motion.div variants={itemVariants} className="mb-6">
                <Alert variant="success" className="bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    {message}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
            {error && (
              <motion.div variants={itemVariants} className="mb-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              variants={itemVariants}
            >
              <div>
                <Label htmlFor="subject" style={{ color: secondaryColor }}>
                  Subject
                </Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Enter subject"
                  {...register('subject', { required: 'Subject is required' })}
                  className={`mt-1 ${errors.subject ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.subject.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="description" style={{ color: secondaryColor }}>
                  Description
                </Label>
                <Textarea
                  id="description"
                  rows={5}
                  placeholder="Describe the problem"
                  {...register('description', {
                    required: 'Description is required',
                  })}
                  className={`mt-1 ${errors.description ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                style={{ backgroundColor: primaryColor, color: '#fff' }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Report'
                )}
              </Button>
            </motion.form>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
};

export default ReportProblem;
