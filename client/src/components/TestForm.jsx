import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

const TestForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debug, setDebug] = useState({});
  const [capturedImage, setCapturedImage] = useState(null);
  const [testType, setTestType] = useState('objective');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const navigate = useNavigate();
  const primaryColor = '#060270';
  const secondaryColor = '#1e3a8a';
  const accentColor = '#93c5fd';

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setMessage('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      videoRef.current.srcObject = stream;
      setStreamActive(true);
    } catch (err) {
      setMessage(
        `Camera error: ${err.message}. Please ensure camera permissions are granted.`
      );
      console.error('Camera error:', err);
    }
  };

  const captureImage = () => {
    if (!streamActive) {
      setMessage('Please start the camera first');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);

    const tracks = video.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    setStreamActive(false);

    setMessage('Image captured successfully. You can now submit the form.');
  };

  const onSubmit = async data => {
    if (!capturedImage) {
      setMessage('Please capture your image before submitting');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setDebug({});

    try {
      const res = await axios.post(
        'http://localhost:5000/api/student/give-test',
        {
          ...data,
          img_hidden_form: capturedImage,
          test_type: testType,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setMessage(
        `Test access granted. Redirecting to test ID: ${res.data.test_id}`
      );
      setDebug(res.data);

      const path =
        testType === 'practical'
          ? `/test-practical/${res.data.test_id}`
          : `/test/${res.data.test_id}`;
      console.log('Navigating to:', path);
      setTimeout(() => {
        navigate(path);
      }, 2000);
    } catch (error) {
      console.error('Error accessing test:', error);
      setMessage(
        error.response?.data?.message ||
          error.response?.statusText ||
          'Failed to access test. Please try again.'
      );
      setDebug(error.response?.data || {});
    } finally {
      setIsLoading(false);
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

  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 relative overflow-hidden"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%231e3a8a' fill-opacity='0.1' d='M0,160L48,149.3C96,139,192,117,288,106.7C384,96,480,96,576,122.7C672,149,768,203,864,213.3C960,224,1056,192,1152,165.3C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
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

      {/* Main Content */}
      <motion.div
        className="max-w-2xl w-full bg-white/95 backdrop-blur-md p-8 rounded-lg shadow-2xl relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2
          className="text-3xl font-bold mb-6 text-center"
          style={{ color: primaryColor }}
        >
          Access Test
        </h2>

        {message && (
          <Alert
            variant={message.includes('granted') ? 'success' : 'destructive'}
            className="mb-6"
          >
            <AlertDescription className="flex items-center gap-2">
              {message.includes('granted') ? null : (
                <AlertCircle className="h-4 w-4" />
              )}
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Test Type Selection */}
        <motion.div variants={itemVariants} className="mb-6">
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-xl" style={{ color: secondaryColor }}>
                Test Type Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label
                htmlFor="testType"
                className="mb-2"
                style={{ color: secondaryColor }}
              >
                Select Test Type
              </Label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="objective">Objective</SelectItem>
                  <SelectItem value="subjective">Subjective</SelectItem>
                  <SelectItem value="practical">Practical</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </motion.div>

        {/* Face Verification */}
        <motion.div variants={itemVariants} className="mb-6">
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-xl" style={{ color: secondaryColor }}>
                Face Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-4">
                <video
                  ref={videoRef}
                  width="640"
                  height="480"
                  autoPlay
                  className={
                    streamActive ? 'block mx-auto rounded-md' : 'hidden'
                  }
                />
                <canvas ref={canvasRef} className="hidden" />
                {capturedImage && (
                  <div className="mt-4">
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="max-w-full max-h-[300px] mx-auto rounded-md"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-4">
                {!streamActive && !capturedImage && (
                  <Button
                    onClick={startCamera}
                    style={{ backgroundColor: primaryColor, color: '#fff' }}
                  >
                    Start Camera
                  </Button>
                )}
                {streamActive && (
                  <Button
                    onClick={captureImage}
                    style={{ backgroundColor: primaryColor, color: '#fff' }}
                  >
                    Capture
                  </Button>
                )}
                {capturedImage && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCapturedImage(null);
                      startCamera();
                    }}
                    style={{
                      borderColor: secondaryColor,
                      color: secondaryColor,
                    }}
                  >
                    Retake
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          variants={itemVariants}
        >
          <div>
            <Label htmlFor="test_id" style={{ color: secondaryColor }}>
              Test ID
            </Label>
            <Input
              id="test_id"
              type="text"
              {...register('test_id', { required: 'Test ID is required' })}
              className="mt-1"
              placeholder="Enter test ID"
            />
            {errors.test_id && (
              <p className="text-red-500 text-sm mt-1">
                {errors.test_id.message}
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
              placeholder="Enter test password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !capturedImage}
            style={{ backgroundColor: primaryColor, color: '#fff' }}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Verifying...
              </span>
            ) : (
              'Access Test'
            )}
          </Button>
        </motion.form>

        {/* Debug Information */}
        {Object.keys(debug).length > 0 && (
          <motion.div variants={itemVariants} className="mt-6">
            <Card className="border-0 shadow-none">
              <CardHeader>
                <CardTitle
                  className="text-xl"
                  style={{ color: secondaryColor }}
                >
                  Debug Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-gray-600 bg-gray-100 p-4 rounded-md">
                  {JSON.stringify(debug, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default TestForm;
