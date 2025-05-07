import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

function AIQuestionGenerator() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [testType, setTestType] = useState('objective');

  const generateQuestions = async data => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/ai/generate-questions',
        {
          subject: data.subject,
          topic: data.topic,
          testType: data.testType,
          numQuestions: parseInt(data.numQuestions),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const { success, data: responseData } = response.data;

      if (success) {
        setQuestions(responseData.questions);
        setTestType(data.testType);
        reset();
      } else {
        setError('Failed to generate questions. Please try again.');
      }
    } catch (err) {
      console.error('Question generation error:', err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Failed to generate questions. Please check your input or API configuration.'
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (questions.length === 0) {
      setError('No questions to download.');
      return;
    }

    let headers, rows;

    if (testType === 'objective') {
      headers = [
        'Question #',
        'Question',
        'Option A',
        'Option B',
        'Option C',
        'Option D',
        'Correct Answer',
      ];
      rows = questions.map(q => [
        q.qid,
        `"${q.question.replace(/"/g, '""')}"`,
        `"${q.options.a.replace(/"/g, '""')}"`,
        `"${q.options.b.replace(/"/g, '""')}"`,
        `"${q.options.c.replace(/"/g, '""')}"`,
        `"${q.options.d.replace(/"/g, '""')}"`,
        q.answer,
      ]);
    } else {
      headers = ['Question #', 'Question', 'Answer'];
      rows = questions.map(q => [
        q.qid,
        `"${q.question.replace(/"/g, '""')}"`,
        `"${q.answer.replace(/"/g, '""')}"`,
      ]);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${testType}_questions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h4 className="text-2xl font-bold mb-2">AI Question Generator</h4>
      <p className="text-gray-600 mb-4">
        Generate AI-powered questions using OpenRouter
      </p>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit(generateQuestions)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <input
            type="text"
            placeholder="e.g. Data engineering"
            className="mt-1 block w-full p-2 border rounded-md"
            {...register('subject', { required: 'Subject is required' })}
          />
          {errors.subject && (
            <span className="text-red-500 text-sm">
              {errors.subject.message}
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Topic
          </label>
          <input
            type="text"
            placeholder="e.g. Hadoop"
            className="mt-1 block w-full p-2 border rounded-md"
            {...register('topic', { required: 'Topic is required' })}
          />
          {errors.topic && (
            <span className="text-red-500 text-sm">{errors.topic.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Question Type
          </label>
          <select
            className="mt-1 block w-full p-2 border rounded-md"
            {...register('testType', { required: 'Question type is required' })}
          >
            <option value="objective">Objective</option>
            <option value="subjective">Subjective</option>
            <option value="practical">Practical</option>
          </select>
          {errors.testType && (
            <span className="text-red-500 text-sm">
              {errors.testType.message}
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Number of Questions
          </label>
          <input
            type="number"
            defaultValue={5}
            className="mt-1 block w-full p-2 border rounded-md"
            {...register('numQuestions', {
              required: 'Number is required',
              min: { value: 1, message: 'Minimum 1' },
              max: { value: 20, message: 'Maximum 20' },
            })}
          />
          {errors.numQuestions && (
            <span className="text-red-500 text-sm">
              {errors.numQuestions.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Generating...
            </span>
          ) : (
            'Generate AI Questions'
          )}
        </button>
      </form>

      {questions.length > 0 && (
        <div className="mt-6">
          <h5 className="text-xl font-semibold mb-4">Generated Questions</h5>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border">#</th>
                  <th className="py-2 px-4 border">Question</th>
                  {testType === 'objective' ? (
                    <>
                      <th className="py-2 px-4 border">Options</th>
                      <th className="py-2 px-4 border">Correct Answer</th>
                    </>
                  ) : (
                    <th className="py-2 px-4 border">Answer</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {questions.map((q, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border">{q.qid}</td>
                    <td className="py-2 px-4 border">{q.question}</td>
                    {testType === 'objective' ? (
                      <>
                        <td className="py-2 px-4 border">
                          <ul className="list-none">
                            <li>
                              <strong>A:</strong> {q.options.a}
                            </li>
                            <li>
                              <strong>B:</strong> {q.options.b}
                            </li>
                            <li>
                              <strong>C:</strong> {q.options.c}
                            </li>
                            <li>
                              <strong>D:</strong> {q.options.d}
                            </li>
                          </ul>
                        </td>
                        <td className="py-2 px-4 border">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            {q.answer}
                          </span>
                        </td>
                      </>
                    ) : (
                      <td className="py-2 px-4 border">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          {q.answer}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-4 space-x-2">
            <button
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50"
              onClick={downloadCSV}
            >
              Download CSV
            </button>
            <button
              className="border border-gray-600 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-50"
              onClick={() => {
                setQuestions([]);
                reset();
              }}
            >
              Clear Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIQuestionGenerator;
