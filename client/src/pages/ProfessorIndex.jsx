import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ProfessorIndex = () => {
  const { user } = useContext(AuthContext);
  const primaryColor = '#060270';
  const secondaryColor = '#1e3a8a';
  const accentColor = '#93c5fd';

  const navItems = [
    { to: '/create-test', label: 'Create Test', icon: 'M12 4v16m8-8H4' },
    {
      to: '/exam-history',
      label: 'Exam History',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      to: '/share-exam',
      label: 'Share Exam',
      icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    },
    {
      to: '/question-management',
      label: 'Manage Questions',
      icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4 0 2.21-1.79 4-4 4-.547 0-1.074-.112-1.557-.31',
    },
    {
      to: '/insert-marks',
      label: 'Insert Marks',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    },
    {
      to: '/view-results',
      label: 'View Results',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      to: '/live-monitoring',
      label: 'Live Monitoring',
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    },
    {
      to: '/proctoring-logs',
      label: 'Proctoring Logs',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      to: '/payment',
      label: 'Manage Credits',
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    },
    {
      to: '/report-problem',
      label: 'Report Problem',
      icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      to: '/faq',
      label: 'FAQ',
      icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4 0 2.21-1.79 4-4 4-.547 0-1.074-.112-1.557-.31',
    },
    {
      to: '/contact-us',
      label: 'Contact Us',
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    },
    {
      to: '/ai-question-generator',
      label: 'AI Question Generator',
      icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z', // Icon for AI (magic wand-like)
    },
  ];

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
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Main Content */}
      <div className="flex-1">
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
                transition: {
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
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
              <motion.div
                variants={itemVariants}
                className="text-center md:text-left"
              >
                <h1
                  className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight"
                  style={{ color: accentColor }}
                >
                  Professor Dashboard
                </h1>
                <p className="text-lg md:text-xl mb-6 text-gray-200">
                  Manage your exams, results, and proctoring with ease,{' '}
                  {user.name}.
                </p>
                <p className="text-base italic text-gray-300 mb-8">
                  “Empower your teaching with seamless tools.”
                </p>
                <Button
                  asChild
                  className="bg-transparent border-2 border-white hover:bg-white hover:text-[#060270] text-white font-semibold py-6 text-lg rounded-lg"
                >
                  <Link to="/create-test">Get Started</Link>
                </Button>
              </motion.div>
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
                    <linearGradient
                      id="grad"
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
                    d="M70 100 L90 120 L130 80 M100 50 L100 150"
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

        {/* Quick Actions Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10"
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <CardTitle
                  className="text-3xl font-bold"
                  style={{ color: primaryColor }}
                >
                  Quick Actions
                </CardTitle>
              </div>
              <p className="text-lg text-gray-600 mt-2">
                Access key features to manage your teaching tasks.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {navItems.map(item => (
                  <motion.div key={item.to} variants={itemVariants}>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full h-24 flex flex-col items-center justify-center text-center text-gray-700 hover:bg-gray-100 hover:text-[#060270] border-gray-200"
                    >
                      <Link
                        to={item.to}
                        className="flex flex-col items-center gap-2"
                      >
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
                            d={item.icon}
                          />
                        </svg>
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </Link>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
};

export default ProfessorIndex;
