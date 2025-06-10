import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Peer from 'peerjs';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2 } from 'lucide-react';

function LiveMonitoring() {
  const { user } = useContext(AuthContext);
  const stableUser = useMemo(() => user, [user?.id]);
  const [testIds, setTestIds] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatuses, setConnectionStatuses] = useState({});
  const peerRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const isMountedRef = useRef(true);
  const API_BASE_URL = 'http://localhost:5000';
  const primaryColor = '#060270';
  const secondaryColor = '#1e3a8a';
  const accentColor = '#93c5fd';

  const logEvent = (event, details) => {
    console.log(`[LiveMonitoring] ${event}:`, details);
  };

  const updateConnectionStatus = (studentId, status, error = null) => {
    if (!isMountedRef.current) return;
    setConnectionStatuses(prev => ({
      ...prev,
      [studentId]: { status, error, timestamp: Date.now() },
    }));
  };

  useEffect(() => {
    logEvent('useEffect mounted', {
      user: stableUser,
      token: localStorage.getItem('token'),
    });
    isMountedRef.current = true;

    if (!stableUser || !stableUser.id) {
      setError('User not authenticated. Please log in.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in again.');
      return;
    }

    const peerId = `professor-${stableUser.id}-${Date.now()}`;
    peerRef.current = new Peer(peerId, {
      host: '/',
      port: 9000,
      path: '/peerjs',
      debug: 2,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ],
      },
    });

    peerRef.current.on('open', () => {
      logEvent('PeerJS connected', { peerId });
      setError('');
    });

    peerRef.current.on('error', err => {
      logEvent('PeerJS error', { message: err.message, type: err.type });
      setError(`PeerJS error: ${err.message}`);
    });

    const fetchTestIds = async () => {
      try {
        setLoading(true);
        logEvent('Fetching test IDs', { token });
        const res = await axios.get(
          `${API_BASE_URL}/api/proctor/livemonitoringtid`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        logEvent('fetchTestIds response', {
          status: res.status,
          data: res.data,
        });
        const fetchedTestIds = Array.isArray(res.data.testIds)
          ? res.data.testIds
          : [];
        setTestIds(fetchedTestIds);
        if (fetchedTestIds.length === 0) {
          setError(
            'No active tests found for monitoring. Create a test first.'
          );
        }
      } catch (err) {
        logEvent('fetchTestIds error', {
          status: err.response?.status,
          message: err.response?.data?.message || err.message,
          data: err.response?.data,
        });
        setError(err.response?.data?.message || 'Failed to load test IDs');
      } finally {
        setLoading(false);
      }
    };

    if (stableUser.user_type === 'professor') {
      fetchTestIds();
    } else {
      setError('You must be a professor to access this page.');
    }

    return () => {
      logEvent('useEffect unmounted');
      isMountedRef.current = false;
      Object.entries(peerConnectionsRef.current).forEach(
        ([studentId, connectionData]) => {
          if (connectionData.peer) {
            connectionData.peer.close();
            logEvent('Closed peer connection', { studentId });
          }
        }
      );
      if (peerRef.current) {
        peerRef.current.destroy();
        logEvent('PeerJS destroyed', {});
      }
    };
  }, [stableUser]);

  useEffect(() => {
    if (!selectedTestId || !peerRef.current) return;

    const handlePeerConnection = async (studentId, offer) => {
      logEvent('Setting up WebRTC', { studentId });
      updateConnectionStatus(studentId, 'connecting');

      try {
        if (peerConnectionsRef.current[studentId]?.peer) {
          peerConnectionsRef.current[studentId].peer.close();
        }

        const peer = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ],
        });

        peerConnectionsRef.current[studentId] = {
          peer,
          student_id: studentId,
          connected: false,
        };

        peer.ontrack = event => {
          logEvent('Received track', { studentId, kind: event.track.kind });
          updateConnectionStatus(studentId, 'received_track');
          const videoElement = document.getElementById(`video-${studentId}`);
          if (videoElement) {
            videoElement.srcObject = event.streams[0];
            updateConnectionStatus(studentId, 'connected');
          }
        };

        peer.onicecandidate = async event => {
          if (event.candidate) {
            logEvent('Generated ICE candidate', { studentId });
            await axios.post(
              `${API_BASE_URL}/api/proctor/signal`,
              {
                test_id: selectedTestId,
                student_id: studentId,
                type: 'ice-candidate',
                data: event.candidate,
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              }
            );
          }
        };

        peer.oniceconnectionstatechange = () => {
          const state = peer.iceConnectionState;
          logEvent('ICE connection state changed', { studentId, state });
          updateConnectionStatus(studentId, `ice_${state}`);
          if (state === 'failed' || state === 'disconnected') {
            updateConnectionStatus(
              studentId,
              'failed',
              `ICE connection ${state}`
            );
            requestNewOffer(studentId);
          }
        };

        if (offer) {
          await peer.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          await axios.post(
            `${API_BASE_URL}/api/proctor/signal`,
            {
              test_id: selectedTestId,
              student_id: studentId,
              type: 'answer',
              data: answer,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
          updateConnectionStatus(studentId, 'answer_sent');
        }
      } catch (err) {
        logEvent('WebRTC Setup Error', { studentId, error: err.message });
        updateConnectionStatus(studentId, 'error', err.message);
      }
    };

    const pollSignals = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/proctor/signal/${selectedTestId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        logEvent('pollSignals response', {
          status: res.status,
          data: res.data,
        });
        const signals = res.data.signals || [];
        for (const signal of signals) {
          const { student_id, type, data } = signal;
          if (type === 'offer') {
            handlePeerConnection(student_id, data);
          } else if (
            type === 'ice-candidate' &&
            peerConnectionsRef.current[student_id]?.peer
          ) {
            await peerConnectionsRef.current[student_id].peer.addIceCandidate(
              new RTCIceCandidate(data)
            );
          }
        }
      } catch (err) {
        logEvent('pollSignals error', {
          status: err.response?.status,
          message: err.response?.data?.message || err.message,
        });
      }
    };

    const interval = setInterval(pollSignals, 5000);
    students.forEach(({ student_id }) => requestNewOffer(student_id));

    return () => clearInterval(interval);
  }, [selectedTestId, students]);

  const requestNewOffer = async studentId => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/proctor/request-offer`,
        { test_id: selectedTestId, student_id: studentId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      logEvent('Requested new offer', { studentId });
    } catch (err) {
      logEvent('Error requesting offer', {
        studentId,
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedTestId) {
      setError('Please select a test ID first');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      logEvent('handleSubmit', { token, testId: selectedTestId });
      const res = await axios.post(
        `${API_BASE_URL}/api/proctor/live-monitoring`,
        { choosetid: selectedTestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      logEvent('handleSubmit response', { status: res.status, data: res.data });
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      const uniqueStudents = data.map(item => ({
        student_id: item.student_id,
        email: item.email || 'Unknown',
        name: item.name || 'Unknown',
        timestamp: item.timestamp,
      }));
      setStudents(uniqueStudents);
      const newStatuses = {};
      uniqueStudents.forEach(({ student_id }) => {
        newStatuses[student_id] = { status: 'waiting', timestamp: Date.now() };
      });
      setConnectionStatuses(newStatuses);
      uniqueStudents.forEach(({ student_id }) => requestNewOffer(student_id));
    } catch (err) {
      logEvent('handleSubmit error', {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
        data: err.response?.data,
      });
      setError(err.response?.data?.message || 'Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const refreshTestIds = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      logEvent('refreshTestIds', { token });
      const res = await axios.get(
        `${API_BASE_URL}/api/proctor/livemonitoringtid`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      logEvent('refreshTestIds response', {
        status: res.status,
        data: res.data,
      });
      const fetchedTestIds = Array.isArray(res.data.testIds)
        ? res.data.testIds
        : [];
      setTestIds(fetchedTestIds);
      if (fetchedTestIds.length === 0) {
        setError('No active tests found for monitoring. Create a test first.');
      } else {
        setError('');
      }
    } catch (err) {
      logEvent('refreshTestIds error', {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
      });
      setError(err.response?.data?.message || 'Failed to refresh test IDs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = status => {
    if (!status) return 'bg-gray-500';
    if (status === 'connected' || status === 'ice_connected')
      return 'bg-green-500';
    if (status.includes('error') || status.includes('failed'))
      return 'bg-red-500';
    return 'bg-yellow-500';
  };

  useEffect(() => {
    if (!selectedTestId) return;
    const interval = setInterval(() => {
      handleSubmit();
      logEvent('Periodic student data refresh', { test_id: selectedTestId });
    }, 60000);
    return () => clearInterval(interval);
  }, [selectedTestId]);

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

  if (!stableUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur-md">
          <CardContent className="p-6 text-center">
            <Alert variant="warning">
              <AlertDescription>
                Loading user information or not logged in.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stableUser.user_type !== 'professor') {
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 pt-0 pb-12 relative overflow-hidden">
      <motion.svg
        className="absolute inset-0 z-0"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        variants={svgVariants}
        animate="animate"
      >
        <defs>
          <pattern
            id="pattern-circles"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <motion.circle
              cx="10"
              cy="10"
              r="2"
              fill={accentColor}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </pattern>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#pattern-circles)"
        />
      </motion.svg>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative pt-[64px] pb-20 bg-gradient-to-b from-[#060270] to-[#1e3a8a] text-white"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center md:text-left"
            >
              <h1
                className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight"
                style={{ color: accentColor }}
              >
                Live Exam Monitoring
              </h1>
              <p className="text-lg md:text-xl mb-6 text-gray-200">
                Monitor students in real-time during exams with live video
                feeds.
              </p>
              <p className="text-base italic text-gray-300 mb-8">
                “Ensure exam integrity with live supervision.”
              </p>
              <Button
                className="bg-transparent border-2 border-white hover:bg-white hover:text-[#060270] text-white font-semibold py-3 px-6 rounded-lg"
                onClick={() =>
                  document
                    .getElementById('live-monitoring')
                    .scrollIntoView({ behavior: 'smooth' })
                }
              >
                Get Started
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="flex justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 200 200"
                className="w-48 h-48"
              >
                <defs>
                  <linearGradient
                    id="grad-monitoring"
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
                      style={{ stopColor: primaryColor, stopOpacity: 1 }}
                    />
                  </linearGradient>
                </defs>
                <motion.circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="url(#grad-monitoring)"
                  opacity="0.2"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                <motion.path
                  d="M70 100 L90 120 L130 80 M100 50 L100 150"
                  stroke={accentColor}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                />
                <motion.circle
                  cx="100"
                  cy="100"
                  r="10"
                  fill={accentColor}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </svg>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <section
        id="live-monitoring"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
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
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m-6 0H5a2 2 0 01-2-2V8a2 2 0 012-2h4m6 8V6m-6 8v-4"
                  />
                </svg>
                <CardTitle
                  className="text-3xl font-bold"
                  style={{ color: primaryColor }}
                >
                  Live Exam Monitoring
                </CardTitle>
              </div>
              <p className="text-lg text-gray-700 mt-2">
                Select a test to start monitoring students in real-time.
              </p>
            </CardHeader>
            <CardContent>
              {error && (
                <motion.div variants={itemVariants} className="mb-6">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
              <motion.form
                onSubmit={e => {
                  e.preventDefault();
                  handleSubmit();
                }}
                variants={itemVariants}
                className="flex gap-4 mb-6 items-end"
              >
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Test ID
                  </label>
                  <Select
                    value={selectedTestId}
                    onValueChange={setSelectedTestId}
                    disabled={loading || testIds.length === 0}
                  >
                    <SelectTrigger className="border-[#1e3a8a] focus:ring-[#93c5fd]">
                      <SelectValue placeholder="Select a test" />
                    </SelectTrigger>
                    <SelectContent>
                      {testIds.map(tid => (
                        <SelectItem key={tid} value={tid}>
                          {tid}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="bg-[#060270] hover:bg-[#93c5fd] hover:text-[#060270] transition-all duration-300"
                  disabled={loading || !selectedTestId}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Start Monitoring'
                  )}
                </Button>
                <Button
                  onClick={refreshTestIds}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                  disabled={loading}
                >
                  Refresh Tests
                </Button>
              </motion.form>
              {students.length > 0 && (
                <motion.div variants={itemVariants}>
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">
                    Monitoring {students.length} Student
                    {students.length !== 1 ? 's' : ''} (Test ID:{' '}
                    {selectedTestId})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {students.map(student => {
                      const { student_id, name, email } = student;
                      const connectionStatus = connectionStatuses[
                        student_id
                      ] || {
                        status: 'unknown',
                      };
                      return (
                        <motion.div key={student_id} variants={itemVariants}>
                          <Card className="border border-gray-200">
                            <CardContent className="p-4">
                              <div className="flex justify-between mb-2">
                                <h5 className="text-md font-semibold">
                                  {name || 'Unknown'}
                                </h5>
                                <Badge
                                  className={`${getStatusColor(connectionStatus.status)} text-white`}
                                >
                                  {connectionStatus.status?.replace('_', ' ')}
                                  'unknown'
                                </Badge>
                              </div>
                              <div className="text-gray-500 text-sm mb-2">
                                ID: {student_id} | {email}
                              </div>
                              <div
                                className="relative bg-gray-800 rounded-lg overflow-hidden"
                                style={{ height: '200px' }}
                              >
                                <video
                                  id={`video-${student_id}`}
                                  autoPlay
                                  playsInline
                                  muted
                                  className="w-full h-full object-contain"
                                />
                                {connectionStatus.status !== 'connected' && (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50">
                                    {connectionStatus.status === 'waiting' ? (
                                      <span>Waiting for connection...</span>
                                    ) : connectionStatus.status?.includes(
                                        'error'
                                      ) ? (
                                      <span>
                                        Connection error:{' '}
                                        {connectionStatus.error || 'Unknown'}
                                      </span>
                                    ) : (
                                      <Loader2 className="h-8 w-8 animate-spin" />
                                    )}
                                  </div>
                                )}
                              </div>
                              {connectionStatus.error && (
                                <Alert variant="destructive" className="mt-2">
                                  <AlertDescription>
                                    {connectionStatus.error}
                                  </AlertDescription>
                                </Alert>
                              )}
                              <div className="flex justify-between mt-2 text-sm text-gray-500">
                                <span>
                                  Last updated:{' '}
                                  {new Date(
                                    connectionStatus.timestamp || Date.now()
                                  )
                                    .toTimeString()
                                    .slice(0, 8)}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => requestNewOffer(student_id)}
                                  disabled={
                                    connectionStatus.status === 'connected' ||
                                    loading
                                  }
                                >
                                  Retry Connection
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
              {loading && (
                <motion.div
                  variants={itemVariants}
                  className="text-center py-12"
                >
                  <Loader2
                    className="h-16 w-16 mx-auto animate-spin"
                    style={{ color: primaryColor }}
                  />
                  <p className="mt-2 text-lg text-gray-600">Loading data...</p>
                </motion.div>
              )}
              {!loading && testIds.length === 0 && (
                <motion.div variants={itemVariants} className="mt-6">
                  <Alert variant="warning">
                    <AlertDescription>
                      No tests are currently available for monitoring. Please
                      create a test first.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}

export default LiveMonitoring;
