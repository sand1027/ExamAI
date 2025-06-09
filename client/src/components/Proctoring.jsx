import React, { useRef, useState, useEffect, useContext } from 'react';
import Webcam from 'react-webcam';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Proctoring = ({ testId, token, setViolations, style }) => {
  const { user } = useContext(AuthContext);
  const webcamRef = useRef(null);
  const [model, setModel] = useState(null);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [lastViolations, setLastViolations] = useState({}); // Track last violation timestamps
  const violationCooldown = 10000; // 10 seconds cooldown for same violation type

  // Load COCO-SSD model
  useEffect(() => {
    console.log('Proctoring - Initializing with props:', {
      testId,
      token,
      user,
    });
    cocoSsd
      .load()
      .then(setModel)
      .catch(err => {
        console.error('Proctoring - Model loading error:', err);
        setViolations?.(prev =>
          [
            ...prev,
            `Model failed to load at ${new Date().toLocaleTimeString()}`,
          ].slice(-3)
        );
      });
  }, []); // Empty dependency array to load model only once

  // Handle webcam ready state
  const onWebcamUserMedia = () => {
    setIsWebcamReady(true);
    console.log('Proctoring - Webcam ready');
  };

  const onWebcamUserMediaError = err => {
    console.error('Proctoring - Webcam access error:', err);
    setIsWebcamReady(false);
    setViolations?.(prev =>
      [
        ...prev,
        `Webcam access failed at ${new Date().toLocaleTimeString()}`,
      ].slice(-3)
    );
  };

  // Send violation with retry logic and cooldown
  const sendViolation = async (violationType, count, retryCount = 0) => {
    const maxRetries = 3;
    const now = Date.now();

    // Check cooldown for this violation type
    if (
      lastViolations[violationType] &&
      now - lastViolations[violationType] < violationCooldown
    ) {
      console.log(`Proctoring - Skipping ${violationType}: within cooldown`);
      return;
    }

    if (!token || !user?.email) {
      console.error('Proctoring - Missing token or user email:', {
        token,
        email: user?.email,
      });
      setViolations?.(prev =>
        [
          ...prev,
          `Violation not sent: Missing auth at ${new Date().toLocaleTimeString()}`,
        ].slice(-3)
      );
      return;
    }

    // Capture snapshot with retry
    let imageSrc = null;
    for (let i = 0; i < 3; i++) {
      imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) break;
      console.warn(`Proctoring - Snapshot capture attempt ${i + 1} failed`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait before retry
    }

    if (!imageSrc) {
      console.error('Proctoring - Failed to capture snapshot after retries');
      setViolations?.(prev =>
        [
          ...prev,
          `Snapshot capture failed at ${new Date().toLocaleTimeString()}`,
        ].slice(-3)
      );
      return;
    }

    try {
      // Convert base64 to Blob
      const response = await fetch(imageSrc);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('testid', testId);
      formData.append('event', 'video_feed');
      formData.append('snapshot', blob, 'violation.jpg');
      formData.append(
        'details',
        JSON.stringify({
          violation: violationType,
          count,
          email: user.email || 'unknown',
          name: user.name || 'Unknown',
        })
      );

      console.log('Proctoring - Sending violation:', {
        testId,
        violationType,
        count,
        email: user.email,
      });

      const res = await axios.post(
        'http://localhost:5000/api/proctor/video-feed',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Proctoring - Violation sent successfully:', res.data);
      setViolations?.(prev =>
        [
          ...prev,
          `${violationType} detected at ${new Date().toLocaleTimeString()}`,
        ].slice(-3)
      );

      // Update last violation timestamp
      setLastViolations(prev => ({ ...prev, [violationType]: now }));
    } catch (error) {
      console.error('Proctoring - Error sending violation:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      if (retryCount < maxRetries) {
        console.log(
          `Proctoring - Retrying ${violationType} (${retryCount + 1}/${maxRetries})`
        );
        await new Promise(resolve =>
          setTimeout(resolve, 1000 * (retryCount + 1))
        );
        await sendViolation(violationType, count, retryCount + 1);
      } else {
        setViolations?.(prev =>
          [
            ...prev,
            `Violation send failed: ${violationType} at ${new Date().toLocaleTimeString()}`,
          ].slice(-3)
        );
      }
    }
  };

  // Object detection
  const detect = async () => {
    if (
      !model ||
      !isWebcamReady ||
      !webcamRef.current ||
      !webcamRef.current.video ||
      webcamRef.current.video.readyState !== 4
    ) {
      console.warn('Proctoring - Detection skipped: dependencies not ready');
      return;
    }

    try {
      const predictions = await model.detect(webcamRef.current.video);
      const persons = predictions.filter(p => p.class === 'person');
      const cellphones = predictions.filter(p => p.class === 'cell phone');

      const personCount = persons.length;
      const cellphoneCount = cellphones.length;

      if (personCount === 0) {
        await sendViolation('no_person_detected', personCount);
      } else if (personCount >= 2) {
        await sendViolation('multiple_persons_detected', personCount);
      }

      if (cellphoneCount > 0) {
        await sendViolation('cell_phone_detected', cellphoneCount);
      }
    } catch (err) {
      console.error('Proctoring - Detection error:', err);
      setViolations?.(prev =>
        [
          ...prev,
          `Detection failed at ${new Date().toLocaleTimeString()}`,
        ].slice(-3)
      );
    }
  };

  // Setup detection interval
  useEffect(() => {
    if (!model || !isWebcamReady) return;

    const interval = setInterval(detect, 5000); // Increased to 5 seconds for performance
    return () => {
      clearInterval(interval);
      if (webcamRef.current?.video?.srcObject) {
        try {
          webcamRef.current.video.srcObject
            .getTracks()
            .forEach(track => track.stop());
          console.log('Proctoring - Webcam tracks stopped');
        } catch (err) {
          console.error('Proctoring - Error stopping webcam tracks:', err);
        }
      }
    };
  }, [model, isWebcamReady]);

  // Restrict to students
  if (!user || user.user_type !== 'student') {
    return <div>Only students can access proctoring during tests.</div>;
  }

  return (
    <Webcam
      ref={webcamRef}
      audio={false}
      videoConstraints={{ facingMode: 'user', width: 200, height: 150 }}
      screenshotFormat="image/jpeg"
      onUserMedia={onWebcamUserMedia}
      onUserMediaError={onWebcamUserMediaError}
      style={{ ...style, borderRadius: '8px', objectFit: 'cover' }}
    />
  );
};

export default Proctoring;
