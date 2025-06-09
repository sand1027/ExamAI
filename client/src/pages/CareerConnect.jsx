import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Briefcase,
  CheckCircle,
  FileText,
  Monitor,
  ArrowRight,
} from 'lucide-react';

const CareerConnect = () => {
  const { user } = useContext(AuthContext);
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
      rotate: 360,
      transition: { duration: 20, ease: 'linear', repeat: Infinity },
    },
  };

  const arrowVariants = {
    animate: {
      x: [0, 10, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const processSteps = [
    {
      icon: <FileText className="w-8 h-8" style={{ color: secondaryColor }} />,
      title: 'Apply for Jobs',
      description:
        'Browse opportunities and submit your application with your resume.',
    },
    {
      icon: (
        <CheckCircle className="w-8 h-8" style={{ color: secondaryColor }} />
      ),
      title: 'Admin Verification',
      description: 'Our team reviews your application to ensure eligibility.',
    },
    {
      icon: <Monitor className="w-8 h-8" style={{ color: secondaryColor }} />,
      title: 'Take Proctored Exams',
      description:
        'Complete objective, practical, or subjective exams securely.',
    },
    {
      icon: <Briefcase className="w-8 h-8" style={{ color: secondaryColor }} />,
      title: 'Await Results',
      description: 'Receive your results and hiring decisions from our team.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <motion.section
        className="relative flex items-center justify-center min-h-[70vh] py-12 px-4 overflow-hidden bg-gradient-to-r from-gray-50 to-gray-200"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%231e3a8a' fill-opacity='0.1' d='M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between px-4">
          {/* Left Side: Text and Buttons */}
          <motion.div
            className="lg:w-1/2 text-center lg:text-left z-10"
            variants={itemVariants}
          >
            <h1
              className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight"
              style={{ color: primaryColor }}
            >
              Launch Your Career with CareerConnect
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-lg mx-auto lg:mx-0">
              Discover top job opportunities and prove your skills with secure,
              AI-powered proctoring.
            </p>
            <div className="flex gap-4 justify-center lg:justify-start">
              <Button
                as={Link}
                to={user ? '/student-index' : '/register'}
                className="px-8 py-3 text-lg font-semibold"
                style={{
                  backgroundColor: primaryColor,
                  color: '#fff',
                }}
              >
                Get Started
              </Button>
              <Button
                as={Link}
                to="/faq"
                variant="outline"
                className="px-8 py-3 text-lg font-semibold"
                style={{ borderColor: secondaryColor, color: secondaryColor }}
              >
                Learn More
              </Button>
            </div>
          </motion.div>
          {/* Right Side: Animated SVG */}
          <motion.div
            className="lg:w-1/2 mt-12 lg:mt-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <svg
              width="400"
              height="400"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto"
            >
              <motion.circle
                cx="200"
                cy="200"
                r="160"
                fill={accentColor}
                fillOpacity="0.1"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <path
                d="M200 80C134.238 80 80 134.238 80 200C80 265.762 134.238 320 200 320C265.762 320 320 265.762 320 200C320 134.238 265.762 80 200 80ZM200 280C156.863 280 120 243.137 120 200C120 156.863 156.863 120 200 120C243.137 120 280 156.863 280 200C280 243.137 243.137 280 200 280Z"
                fill={primaryColor}
              />
              <motion.path
                d="M200 140L240 200L200 260L160 200L200 140Z"
                fill={secondaryColor}
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </svg>
          </motion.div>
        </div>
      </motion.section>

      {/* Process Explanation */}
      <section className="py-16 px-4 bg-white">
        <motion.div
          className="max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <h2
            className="text-4xl font-bold text-center mb-12"
            style={{ color: primaryColor }}
          >
            How CareerConnect Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {processSteps.map((step, index) => (
              <React.Fragment key={index}>
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-4">
                        {step.icon}
                        <span style={{ color: primaryColor }}>
                          {step.title}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
                {index < processSteps.length - 1 && (
                  <motion.div
                    className="hidden lg:flex absolute items-center justify-center"
                    style={{
                      left: `${(index + 1) * 25 - 2}%`,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                    variants={arrowVariants}
                    animate="animate"
                  >
                    <ArrowRight
                      className="w-6 h-6"
                      style={{ color: secondaryColor }}
                    />
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default CareerConnect;
