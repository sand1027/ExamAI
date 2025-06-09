import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';

import TestForm from '../components/TestForm';

const GiveTest = () => {
  const { user, loading } = useContext(AuthContext);
  const primaryColor = '#060270';
  const secondaryColor = '#1e3a8a';
  const accentColor = '#93c5fd';

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

  if (!user || user.user_type !== 'student') {
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
              Please log in as a student to access this page.
            </p>
            <Button
              asChild
              className="mt-6 w-full text-lg py-6 rounded-lg"
              style={{ backgroundColor: primaryColor, color: '#fff' }}
            >
              <Link to="/login">Go to Login</Link>
            </Button>
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
          d="M120 100 H1320 M120 200 H1320 M120 360 H1320 M120 400 H1320 M120 500 H1320 M120 600 H1320 M120 720 H1320 M120 800 H1320 M120 100 V800 M240 320 V800 M360 480 V720 M480 720 M720 100 V800 M840 720 M1080 H720 M960 480 V960 M1080 M720 M1320 M480 V800"
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
            {/* Left: Text and Button */}
            <motion.div
              variants={itemVariants}
              className="text-center md:text-left"
            >
              <h1
                className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight"
                style={{ color: accentColor }}
              >
                Start Your Test
              </h1>
              <p className="text-lg md:text-xl mb-6 text-gray-200">
                Verify your identity and access your test with ease.
              </p>
              <p className="text-base italic text-gray-300 mb-8">
                “Unlock Your Potential with Every Challenge”
              </p>
              <Button
                asChild
                className="bg-transparent border-2 border-white hover:bg-white hover:text-[#060270] text-white font-semibold py-6 text-lg rounded-lg"
              >
                <Link to="/student-index">Back to Dashboard</Link>
              </Button>
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
                  d="M100 40 L120 80 L80 80 Z M80 120 H120 M100 160 L80 120 L120 120"
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

      {/* Test Form Section */}
      <section className="py-12 bg-gray-50">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl"
        >
          <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-0 hover:shadow-xl transition-shadow duration-300 relative">
            <CardHeader className="flex flex-col items-center gap-3">
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
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                <CardTitle
                  className="text-2xl font-bold"
                  style={{ color: primaryColor }}
                >
                  Access Your Test
                </CardTitle>
              </div>
              <p className="text-base text-gray-600 text-center">
                Welcome, {user.name}
              </p>
            </CardHeader>
            <CardContent>
              <motion.div variants={itemVariants}>
                <TestForm />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
};

export default GiveTest;
