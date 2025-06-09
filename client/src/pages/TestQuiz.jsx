import React, { useState, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MessageCircle } from 'lucide-react';
import axios from 'axios';
import Proctoring from '../components/Proctoring';
import { AuthContext } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

function TestQuiz() {
  const { testid } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQid, setCurrentQid] = useState(1);
  const [markedAnswers, setMarkedAnswers] = useState({});
  const [bookmarks, setBookmarks] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcValue, setCalcValue] = useState('');
  const [violations, setViolations] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/student/test/${testid}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        const shuffled = res.data.questions.sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
        setTimeLeft(res.data.duration);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load test');
      }
    };
    fetchQuestions();

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testid]);

  const handleAnswer = async ans => {
    try {
      await axios.post(
        'http://localhost:5000/api/student/test',
        { flag: 'mark', qid: questions[currentQid - 1].qid, ans, testid },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setMarkedAnswers({
        ...markedAnswers,
        [questions[currentQid - 1].qid]: ans,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save answer');
    }
  };

  const toggleBookmark = () => {
    const qid = questions[currentQid - 1].qid;
    const newBookmarks = new Set(bookmarks);
    if (newBookmarks.has(qid)) {
      newBookmarks.delete(qid);
    } else {
      newBookmarks.add(qid);
    }
    setBookmarks(newBookmarks);
  };

  const submitTest = async () => {
    setShowStats(true);
  };

  const confirmSubmit = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/student/test',
        { flag: 'submit', testid },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      navigate('/student-index');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit test');
    }
  };

  const handleCalculator = value => {
    if (value === '=') {
      try {
        setCalcValue(eval(calcValue).toString());
      } catch {
        setCalcValue('Error');
      }
    } else if (value === 'C') {
      setCalcValue('');
    } else {
      setCalcValue(calcValue + value);
    }
  };

  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!user || user.user_type !== 'student') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-red-600">Unauthorized Access</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_200px] gap-4 h-[calc(100vh-4rem)]">
        {/* Left: Vertical Question List */}
        <div className="bg-gray-100 p-4 rounded-lg overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Questions</h3>
          <div className="flex flex-col space-y-2">
            {questions.map((q, i) => (
              <Button
                key={q.qid}
                onClick={() => setCurrentQid(i + 1)}
                className={`p-2 rounded-lg text-left ${
                  currentQid === i + 1
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : bookmarks.has(q.qid)
                      ? 'bg-yellow-200 hover:bg-yellow-300'
                      : markedAnswers[q.qid]
                        ? 'bg-green-200 hover:bg-green-300'
                        : 'bg-white hover:bg-gray-100'
                } transition-colors`}
              >
                Question {i + 1}
              </Button>
            ))}
          </div>
        </div>

        {/* Center: Question Display */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Objective Test</h2>
            <div className="text-lg font-semibold text-red-600">
              Time Left: {formatTime(timeLeft)}
            </div>
          </div>
          {error && (
            <Alert className="bg-red-100 border-red-500 text-red-700 p-4 rounded-lg">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {questions.length > 0 && (
            <Card className="border-none p-4">
              <h3 className="text-xl font-semibold mb-4">
                {questions[currentQid - 1].question}
              </h3>
              <div className="space-y-2">
                {['a', 'b', 'c', 'd'].map(option => (
                  <label
                    key={option}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={
                        markedAnswers[questions[currentQid - 1].qid] === option
                      }
                      onChange={() => handleAnswer(option)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>{questions[currentQid - 1].options[option]}</span>
                  </label>
                ))}
              </div>
              <div className="flex space-x-2 mt-4 flex-wrap gap-2">
                <Button
                  onClick={() => setCurrentQid(prev => Math.max(1, prev - 1))}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Previous
                </Button>
                <Button
                  onClick={() =>
                    setCurrentQid(prev => Math.min(questions.length, prev + 1))
                  }
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Next
                </Button>
                <Button
                  onClick={toggleBookmark}
                  className={`${
                    bookmarks.has(questions[currentQid - 1].qid)
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-gray-200 hover:bg-gray-300 text-black'
                  }`}
                >
                  {bookmarks.has(questions[currentQid - 1].qid)
                    ? 'Unbookmark'
                    : 'Bookmark'}
                </Button>
                <Button
                  onClick={() => setShowCalculator(!showCalculator)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {showCalculator ? 'Hide Calculator' : 'Show Calculator'}
                </Button>
                <Button
                  onClick={submitTest}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Submit Test
                </Button>
              </div>
              {showCalculator && (
                <Card className="mt-4 p-4 border rounded-lg">
                  <Input
                    value={calcValue}
                    readOnly
                    className="w-full p-2 border rounded-lg mb-2"
                  />
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      '1',
                      '2',
                      '3',
                      '+',
                      '4',
                      '5',
                      '6',
                      '-',
                      '7',
                      '8',
                      '9',
                      '*',
                      '0',
                      '.',
                      '=',
                      '/',
                    ].map(val => (
                      <Button
                        key={val}
                        onClick={() => handleCalculator(val)}
                        className="bg-gray-200 hover:bg-gray-300 text-black"
                      >
                        {val}
                      </Button>
                    ))}
                    <Button
                      onClick={() => handleCalculator('C')}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      C
                    </Button>
                  </div>
                </Card>
              )}
            </Card>
          )}
        </div>

        {/* Right: Proctoring and Violations */}
        <div className="bg-gray-100 p-4 rounded-lg flex flex-col space-y-4">
          <Proctoring
            testId={testid}
            token={localStorage.getItem('token')}
            setViolations={setViolations}
            style={{ width: '150px', height: '112.5px' }}
          />
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Violations
            </h3>
            {violations.length > 0 ? (
              <ul className="space-y-2">
                {violations.map((violation, index) => (
                  <li key={index} className="text-sm text-red-600">
                    {violation}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">No violations detected</p>
            )}
          </div>
        </div>
      </div>

      {/* Submission Dialog */}
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-xl font-bold">
            Submission Statistics
          </DialogTitle>
          <div className="space-y-2">
            <p>Total Questions: {questions.length}</p>
            <p>Answered: {Object.keys(markedAnswers).length}</p>
            <p>Bookmarked: {bookmarks.size}</p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowStats(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSubmit}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Confirm Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TestQuiz;
