import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const LoginForm = () => {
  const primaryColor = '#060270';
  const secondaryColor = '#1e3a8a';
  const accentColor = '#93c5fd';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login } = useContext(AuthContext);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      y: [0, -10, 0],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const checkmarkVariants = {
    animate: {
      scale: [1, 1.2, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const onSubmit = async data => {
    try {
      await login(data.email, data.password, data.user_type, null);
      if (data.user_type === 'student') {
        navigate('/student-index');
      } else {
        navigate('/professor-index');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%231e3a8a' fill-opacity='0.1' d='M0,192L48,186.7C96,181,192,171,288,149.3C384,128,480,96,576,106.7C672,117,768,171,864,192C960,213,1056,203,1152,181.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
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
        {/* Left Side: Login Form */}
        <motion.div
          className="lg:w-1/2 bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
          variants={itemVariants}
        >
          <h2
            className="text-3xl font-bold mb-6 text-center"
            style={{ color: primaryColor }}
          >
            Login to CareerConnect Proctal
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
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
                {...register('password', { required: 'Password is required' })}
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
              Login
            </Button>
          </form>
          <p className="text-center text-gray-600 mt-4">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-blue-300 hover:underline"
              style={{ color: accentColor }}
            >
              Register
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
            {/* Laptop representing exam-taking */}
            <motion.rect
              x="100"
              y="150"
              width="200"
              height="120"
              rx="10"
              fill={accentColor}
              fillOpacity="0.2"
              variants={svgVariants}
              animate="animate"
            />
            <rect
              x="100"
              y="270"
              width="200"
              height="10"
              fill={secondaryColor}
            />
            {/* Screen content */}
            <rect
              x="120"
              y="170"
              width="160"
              height="80"
              fill={primaryColor}
              fillOpacity="0.3"
            />
            {/* Question mark */}
            <motion.path
              d="M180 200C180 190 190 180 200 180C210 180 220 190 220 200C220 210 210 220 200 220C190 220 180 210 180 200ZM200 230V240"
              fill={accentColor}
              variants={svgVariants}
              animate="animate"
            />
            <circle cx="200" cy="245" r="5" fill={accentColor} />
            {/* Checkmark */}
            <motion.path
              d="M240 190L250 200L270 180"
              stroke={secondaryColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={checkmarkVariants}
              animate="animate"
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginForm;
