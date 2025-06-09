import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { BookOpen, Shield, Video, ArrowRight } from 'lucide-react';

const Home = () => {
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

  const features = [
    {
      icon: <Shield className="w-12 h-12" style={{ color: secondaryColor }} />,
      title: 'Secure Proctoring',
      description:
        'Advanced AI monitoring ensures a fair and secure testing environment.',
    },
    {
      icon: <Video className="w-12 h-12" style={{ color: secondaryColor }} />,
      title: 'Live Monitoring',
      description: 'Real-time proctoring with seamless video integration.',
    },
    {
      icon: (
        <BookOpen className="w-12 h-12" style={{ color: secondaryColor }} />
      ),
      title: 'Easy Exam Creation',
      description:
        'Create and manage exams effortlessly with our intuitive platform.',
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
              CareerConnect Proctal
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-lg mx-auto lg:mx-0">
              Empower your future with secure, AI-powered proctoring for
              career-defining exams.
            </p>
            <div className="flex gap-4 justify-center lg:justify-start">
              <Button
                as={Link}
                to="/register"
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
                to="/demo"
                variant="outline"
                className="px-8 py-3 text-lg font-semibold"
                style={{ borderColor: secondaryColor, color: secondaryColor }}
              >
                Watch Demo
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

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-4xl font-bold text-center mb-12"
            style={{ color: primaryColor }}
          >
            Why Choose CareerConnect Proctal?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {features.map((feature, index) => (
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
                        {feature.icon}
                        <span style={{ color: primaryColor }}>
                          {feature.title}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
                {index < features.length - 1 && (
                  <motion.div
                    className="hidden md:flex absolute items-center justify-center"
                    style={{
                      left: `${(index + 1) * 33.33 - 2}%`,
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
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-16 px-4"
        style={{ backgroundColor: secondaryColor }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-6 text-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Ready to Transform Your Exam Experience?
          </motion.h2>
          <motion.p
            className="text-lg text-gray-200 mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join thousands of users who trust CareerConnect Proctal for secure
            and efficient proctoring.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button
              as={Link}
              to="/register"
              className="px-8 py-3 text-lg"
              style={{
                backgroundColor: accentColor,
                borderColor: accentColor,
                color: primaryColor,
              }}
            >
              Start Your Journey
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-2xl font-bold" style={{ color: accentColor }}>
              CareerConnect Proctal
            </h3>
            <p className="text-gray-400">
              Empowering careers, one exam at a time.
            </p>
          </div>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-blue-300">
              About
            </Link>
            <Link to="/contact" className="hover:text-blue-300">
              Contact
            </Link>
            <Link to="/privacy" className="hover:text-blue-300">
              Privacy Policy
            </Link>
            <Link to="/careerconnect" className="hover:text-blue-300">
              CareerConnect
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
