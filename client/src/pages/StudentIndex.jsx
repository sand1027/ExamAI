import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function StudentIndex() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#060270] to-[#1E3A8A]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto" />
          <p className="mt-4 text-lg font-medium text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.user_type !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#060270] to-[#1E3A8A]">
        <Card className="w-full max-w-md shadow-2xl bg-white/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-[#060270]">
              Unauthorized Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-lg">
              Please log in as a student to access this page.
            </p>
            <Button
              asChild
              className="mt-6 w-full bg-[#060270] hover:bg-[#1E3A8A] text-white text-lg py-6"
            >
              <Link to="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Half: Animation Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-full lg:w-1/2 min-h-screen bg-cover bg-center flex flex-col justify-center items-center text-white relative overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-[#060270]/70"></div>
        <svg
          className="absolute inset-0 opacity-10"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern
            id="pattern"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="20" cy="20" r="2" fill="#E5E7EB" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#pattern)" />
        </svg>
        <div className="relative z-10 text-center px-6 max-w-2xl">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight"
          >
            Unlock Your Potential
          </motion.h1>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg md:text-xl mb-8 text-gray-200"
          >
            Master your skills with personalized tests and track your progress
            effortlessly.
          </motion.p>
          <motion.div
            animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="w-24 h-24 mx-auto mb-8"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-full w-full"
            >
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop
                    offset="0%"
                    style={{ stopColor: '#060270', stopOpacity: 1 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: '#1E3A8A', stopOpacity: 1 }}
                  />
                </linearGradient>
              </defs>
              <path
                fill="url(#grad)"
                stroke="white"
                strokeWidth={1}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </motion.div>
          <Button
            asChild
            className="bg-transparent border-2 border-white hover:bg-white hover:text-[#060270] text-white font-semibold py-6 text-lg rounded-lg"
          >
            <Link to="/profile">View Profile</Link>
          </Button>
        </div>
      </motion.div>

      {/* Right Half: Form Section */}
      <div className="w-full lg:w-1/2 min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 flex items-center justify-center py-12">
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-lg mx-auto px-4"
        >
          <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center gap-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-[#060270]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <div>
                <CardTitle className="text-3xl font-bold text-[#060270]">
                  Student Dashboard
                </CardTitle>
                <p className="text-lg text-gray-600">Welcome, {user.name}</p>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-gray-500 text-sm">
                Access your tests and track your academic journey.
              </p>
              <Button
                asChild
                className="w-full bg-[#060270] hover:bg-[#1E3A8A] text-white font-semibold py-6 text-lg rounded-lg"
              >
                <Link to="/give-test">Take Test</Link>
              </Button>
              <Button
                asChild
                className="w-full bg-[#1E3A8A] hover:bg-[#060270] text-white font-semibold py-6 text-lg rounded-lg"
              >
                <Link to={`/tests-given/${user.email}`}>View Results</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default StudentIndex;
