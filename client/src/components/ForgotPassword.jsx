import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const primaryColor = '#060270';
  const secondaryColor = '#1e3a8a';
  const accentColor = '#93c5fd';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
      rotate: [0, 360],
      transition: { duration: 25, repeat: Infinity, ease: 'linear' },
    },
  };

  const nodeVariants = {
    animate: {
      scale: [1, 1.15, 1],
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: i => i * 0.4,
      },
    },
  };

  const onSubmit = async data => {
    try {
      const res = await axios.post('/api/auth/forgot-password', data);
      setMessage(res.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
      setMessage('');
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%231e3a8a' fill-opacity='0.1' d='M0,160L48,149.3C96,139,192,117,288,106.7C384,96,480,96,576,122.7C672,149,768,203,864,213.3C960,224,1056,192,1152,165.3C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <motion.div
        className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Left Side: Forgot Password Form */}
        <motion.div
          className="lg:w-1/2 bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
          variants={itemVariants}
        >
          <h2
            className="text-3xl font-bold mb-6 text-center"
            style={{ color: primaryColor }}
          >
            Forgot Password
          </h2>
          {message && (
            <Alert variant="success">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="email" style={{ color: secondaryColor }}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="mt-1"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              style={{ backgroundColor: primaryColor, color: '#fff' }}
            >
              Send Reset Email
            </Button>
          </form>
        </motion.div>

        {/* Right Side: Animated SVG */}
        <motion.div
          className="lg:w-1/2 mt-12 lg:mt-0 flex justify-center"
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
            {/* Outer rotating hexagon */}
            <motion.path
              d="M200 60 L300 110 L300 290 L200 340 L100 290 L100 110 Z"
              stroke={primaryColor}
              strokeWidth="4"
              strokeOpacity="0.3"
              fill="none"
              variants={svgVariants}
              animate="animate"
            />
            {/* Inner nodes */}
            {[0, 1, 2].map(i => (
              <motion.circle
                key={i}
                cx={200 + 100 * Math.cos(((i * 120 + 30) * Math.PI) / 180)}
                cy={200 + 100 * Math.sin(((i * 120 + 30) * Math.PI) / 180)}
                r="25"
                fill={accentColor}
                variants={nodeVariants}
                animate="animate"
                custom={i}
              />
            ))}
            {/* Connecting triangle */}
            <path
              d="M200 120 L280 230 L120 230 Z"
              stroke={secondaryColor}
              strokeWidth="2"
              strokeOpacity="0.5"
              fill="none"
            />
            {/* Central node */}
            <motion.circle
              cx="200"
              cy="200"
              r="35"
              fill={primaryColor}
              variants={nodeVariants}
              animate="animate"
              custom={0}
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
