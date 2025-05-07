import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import axios from 'axios';

const Proctoring = ({ testId, token }) => {
  const webcamRef = useRef(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    console.log('Proctoring - Received token:', token);
    cocoSsd.load().then(setModel);
  }, [token]);

  const sendViolation = async (violationType, count) => {
    if (!token) {
      console.error('Proctoring - No token provided for violation request');
      return;
    }
    try {
      console.log('Proctoring - Sending violation:', {
        testId,
        violationType,
        count,
        token,
      });
      const response = await axios.post(
        'http://localhost:5000/api/proctor/video-feed',
        {
          data: {
            testid: testId,
            event: 'video_feed',
            details: { violation: violationType, count },
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Proctoring - Violation sent successfully:', response.data);
    } catch (error) {
      console.error('Proctoring - Error sending violation:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  };

  const detect = async () => {
    if (
      model &&
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
    ) {
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

      if (cellphoneCount >= 1) {
        await sendViolation('cell_phone_detected', cellphoneCount);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(detect, 2000);
    return () => clearInterval(interval);
  }, [model]);

  return (
    <div>
      <Webcam
        ref={webcamRef}
        audio={false}
        videoConstraints={{ facingMode: 'user' }}
        screenshotFormat="image/jpeg"
        style={{ width: 640, height: 480 }}
      />
    </div>
  );
};

export default Proctoring;
