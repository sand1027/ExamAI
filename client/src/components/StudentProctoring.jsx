import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Peer from 'peerjs';

function StudentProctoring({ testId, studentId }) {
  const peerRef = useRef(null);
  const videoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const streamRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('initializing');
  const [errorMessage, setErrorMessage] = useState('');
  const reconnectAttemptRef = useRef(0);
  const maxReconnectAttempts = 20;
  const API_BASE_URL = 'http://localhost:5000';

  const logEvent = (event, details) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[StudentProctoring] ${event}:`, details);
    }
  };

  const createAndSendOffer = async () => {
    try {
      if (!peerConnectionRef.current) {
        throw new Error('Connection not ready');
      }

      logEvent('Creating new offer', { testId, studentId });
      setConnectionStatus('creating_offer');

      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveVideo: false,
        offerToReceiveAudio: false,
      });

      await peerConnectionRef.current.setLocalDescription(offer);
      logEvent('Set local description (offer)', { offer_type: offer.type });

      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/proctor/signal`,
        { test_id: testId, student_id: studentId, type: 'offer', data: offer },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      logEvent('Sent offer', { testId, studentId });
      setConnectionStatus('offer_sent');
    } catch (err) {
      logEvent('Error creating offer', { error: err.message });
      setErrorMessage(`Offer creation failed: ${err.message}`);
      setConnectionStatus('offer_error');
    }
  };

  const logVideoFeed = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('No authentication token found');
      setConnectionStatus('auth_error');
      return;
    }

    const maxRetries = 3;
    let retryCount = 0;
    while (retryCount < maxRetries) {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/proctor/video-feed`,
          {
            data: {
              testid: testId,
              event: 'video_feed',
              details: { status: 'active' },
            },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        logEvent('Video feed logged to server', { response: response.data });
        break;
      } catch (err) {
        retryCount++;
        if (retryCount === maxRetries) {
          setErrorMessage(`Failed to log video feed: ${err.message}`);
          setConnectionStatus('log_error');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const setupConnection = async () => {
    try {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      setConnectionStatus('creating_peer_connection');
      peerConnectionRef.current = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ],
      });

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          peerConnectionRef.current.addTrack(track, streamRef.current);
          logEvent('Added track to peer connection', { kind: track.kind });
        });
      } else {
        throw new Error('No media stream available');
      }

      peerConnectionRef.current.onicecandidate = async event => {
        if (event.candidate) {
          logEvent('Generated ICE candidate', { candidate: event.candidate });
          await axios.post(
            `${API_BASE_URL}/api/proctor/signal`,
            {
              test_id: testId,
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

      peerConnectionRef.current.oniceconnectionstatechange = () => {
        const state = peerConnectionRef.current.iceConnectionState;
        logEvent('ICE connection state changed', { state });
        setConnectionStatus(`ice_${state}`);
        if (state === 'disconnected' || state === 'failed') {
          if (reconnectAttemptRef.current < maxReconnectAttempts) {
            reconnectAttemptRef.current++;
            setTimeout(setupConnection, 2000 * reconnectAttemptRef.current);
          } else {
            setErrorMessage('Max reconnect attempts reached');
            setConnectionStatus('failed');
          }
        } else if (state === 'connected' || state === 'completed') {
          reconnectAttemptRef.current = 0;
          setConnectionStatus('connected');
        }
      };

      await createAndSendOffer();
    } catch (err) {
      logEvent('Error in setting up WebRTC', { error: err.message });
      setErrorMessage(`WebRTC setup error: ${err.message}`);
      setConnectionStatus('setup_error');
    }
  };

  useEffect(() => {
    logEvent('useEffect mounted');
    const isMountedRef = { current: true };
    if (!testId || !studentId) {
      setErrorMessage('Test ID and Student ID are required');
      setConnectionStatus('error');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('No authentication token found');
      setConnectionStatus('auth_error');
      return;
    }

    const peerId = `student-${studentId}-${testId}`;
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
      setConnectionStatus('peer_connected');
      setErrorMessage('');
      reconnectAttemptRef.current = 0;
    });

    peerRef.current.on('error', err => {
      logEvent('PeerJS error', { message: err.message, type: err.type });
      setErrorMessage(`PeerJS error: ${err.message}`);
      setConnectionStatus('peer_error');
    });

    const pollSignals = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/proctor/signal/${testId}/${studentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const signals = res.data.signals || [];
        for (const signal of signals) {
          const { type, data } = signal;
          if (type === 'answer' && peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(
              new RTCSessionDescription(data)
            );
            setConnectionStatus('answer_received');
          } else if (type === 'ice-candidate' && peerConnectionRef.current) {
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(data)
            );
          }
        }
      } catch (err) {
        logEvent('Signal Polling Error', { message: err.message });
      }
    };

    const startVideo = async () => {
      try {
        setConnectionStatus('requesting_camera');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            frameRate: { max: 15 },
          },
          audio: false,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setConnectionStatus('camera_accessed');
        }

        await logVideoFeed();
        await setupConnection();

        const logInterval = setInterval(logVideoFeed, 30000);
        const signalInterval = setInterval(pollSignals, 5000);
        return () => {
          clearInterval(logInterval);
          clearInterval(signalInterval);
        };
      } catch (err) {
        setErrorMessage(`Camera access error: ${err.name} - ${err.message}`);
        setConnectionStatus('camera_error');
      }
    };

    startVideo();

    return () => {
      logEvent('useEffect unmounted');
      isMountedRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [testId, studentId]);

  return (
    <div className="mt-3 proctoring-container">
      <h3>Proctoring Active</h3>
      <div
        className={`status-indicator mb-2 ${
          connectionStatus === 'connected' ||
          connectionStatus.includes('ice_connected')
            ? 'text-success'
            : connectionStatus.includes('error') ||
                connectionStatus.includes('failed')
              ? 'text-danger'
              : 'text-warning'
        }`}
      >
        Status: {connectionStatus.replace(/_/g, ' ')}
        {errorMessage && (
          <div className="error-message text-danger">{errorMessage}</div>
        )}
      </div>
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{
          width: '100%',
          maxWidth: '320px',
          border: '1px solid #ddd',
          backgroundColor: '#f0f0f0',
        }}
      />
      <p className="mt-2 text-muted small">
        Your video is being shared with the proctor. Please keep this window
        open.
      </p>
      {(connectionStatus.includes('error') ||
        connectionStatus.includes('failed') ||
        connectionStatus.includes('disconnected')) && (
        <div>
          <button
            className="btn btn-sm btn-warning me-2"
            onClick={() => setupConnection()}
          >
            Retry Connection
          </button>
        </div>
      )}
    </div>
  );
}

export default StudentProctoring;
