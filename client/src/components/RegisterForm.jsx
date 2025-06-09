import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, User, Lock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const RegisterForm = () => {
  const primaryColor = '#060270';
  const secondaryColor = '#1e3a8a';
  const accentColor = '#93c5fd';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const videoRef = useRef();

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
      transition: { duration: 20, repeat: Infinity, ease: 'linear' },
    },
  };

  const nodeVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: i => i * 0.3,
      },
    },
  };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(err => {
        if (
          err.name === 'NotAllowedError' ||
          err.name === 'PermissionDeniedError'
        ) {
          setError('Camera access denied. Please allow camera permissions.');
        } else {
          setError('An error occurred while accessing the camera.');
        }
      });

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const onSubmitRegister = async data => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
      const capturedImage = canvas.toDataURL('image/jpeg');

      const formData = { ...data, user_image: capturedImage };

      const res = await axios.post(
        'http://localhost:5000/api/auth/register',
        formData
      );
      setUserData({ email: res.data.email, ...formData });
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const onSubmitOTP = async data => {
    try {
      await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email: userData.email,
        otp: data.otp,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
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
        {/* Left Side: Registration Form */}
        <motion.div
          className="lg:w-1/2 bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
          variants={itemVariants}
        >
          <h2
            className="text-3xl font-bold mb-6 text-center"
            style={{ color: primaryColor }}
          >
            {otpSent ? 'Verify OTP' : 'Create Account'}
          </h2>
          <div className="flex justify-center mb-6">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full max-w-[220px] rounded-lg border-2 border-gray-200 shadow-md hover:scale-105 transition-transform duration-300"
            />
          </div>
          {!otpSent ? (
            <form
              onSubmit={handleSubmit(onSubmitRegister)}
              className="space-y-6"
            >
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div>
                <Label htmlFor="name" style={{ color: secondaryColor }}>
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="mt-1"
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
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
              <div>
                <Label htmlFor="password" style={{ color: secondaryColor }}>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  className="mt-1"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="user_type" style={{ color: secondaryColor }}>
                  User Type
                </Label>
                <select
                  id="user_type"
                  {...register('user_type', {
                    required: 'User type is required',
                  })}
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900 focus:ring focus:ring-blue-300"
                >
                  <option value="student">Student</option>
                  <option value="professor">Professor</option>
                </select>
                {errors.user_type && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.user_type.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                style={{ backgroundColor: primaryColor, color: '#fff' }}
              >
                Register
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit(onSubmitOTP)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div>
                <Label htmlFor="otp" style={{ color: secondaryColor }}>
                  Enter OTP
                </Label>
                <Input
                  id="otp"
                  type="text"
                  {...register('otp', { required: 'OTP is required' })}
                  className="mt-1"
                  placeholder="Enter the OTP"
                />
                {errors.otp && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.otp.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                style={{ backgroundColor: primaryColor, color: '#fff' }}
              >
                Verify OTP
              </Button>
            </form>
          )}
          <p className="text-center text-gray-600 mt-4">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-300 hover:underline"
              style={{ color: accentColor }}
            >
              Login
            </Link>
          </p>
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
            {/* Rotating outer ring */}
            <motion.circle
              cx="200"
              cy="200"
              r="180"
              stroke={primaryColor}
              strokeWidth="4"
              strokeOpacity="0.3"
              fill="none"
              variants={svgVariants}
              animate="animate"
            />
            {/* Inner nodes */}
            {[0, 1, 2, 3].map(i => (
              <motion.circle
                key={i}
                cx={200 + 120 * Math.cos((i * 90 * Math.PI) / 180)}
                cy={200 + 120 * Math.sin((i * 90 * Math.PI) / 180)}
                r="20"
                fill={accentColor}
                variants={nodeVariants}
                animate="animate"
                custom={i}
              />
            ))}
            {/* Connecting lines */}
            <path
              d="M200 80 L200 320 M80 200 L320 200"
              stroke={secondaryColor}
              strokeWidth="2"
              strokeOpacity="0.5"
            />
            {/* Central node */}
            <motion.circle
              cx="200"
              cy="200"
              r="40"
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

export default RegisterForm;
