import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QAUploadForm from '../components/QAUploadForm';
import PracUploadForm from '../components/PracUploadForm';

function CreateTest() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('objective');
  const primaryColor = '#060270';
  const accentColor = '#93c5fd';

  if (!user || user.user_type !== 'professor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold" style={{ color: primaryColor }}>
            Unauthorized Access
          </h2>
          <p className="text-gray-600 mt-2">
            You must be logged in as a professor to access this page.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-12 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <motion.svg
        className="absolute inset-0 z-0"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0.05 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="bg-white/95 backdrop-blur-md shadow-2xl rounded-xl border-0">
            <CardHeader>
              <CardTitle
                className="text-4xl font-bold text-center"
                style={{ color: primaryColor }}
              >
                Create Test
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs
                value={activeTab}
                onValueChange={value => {
                  console.log('Tab changed to:', value);
                  setActiveTab(value);
                }}
                className="w-full"
              >
                <TabsList className="flex justify-center mb-6 bg-transparent border-b border-gray-200">
                  <TabsTrigger
                    value="objective"
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 font-medium rounded-t-lg transition-all data-[state=active]:text-[#060270] data-[state=active]:border-b-2 data-[state=active]:border-[#060270] hover:text-[#060270] hover:border-b-2 hover:border-[#93c5fd]"
                  >
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke={
                        activeTab === 'objective' ? primaryColor : '#6b7280'
                      }
                      strokeWidth={2}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </motion.svg>
                    Objective Test
                  </TabsTrigger>
                  <TabsTrigger
                    value="subjective"
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 font-medium rounded-t-lg transition-all data-[state=active]:text-[#060270] data-[state=active]:border-b-2 data-[state=active]:border-[#060270] hover:text-[#060270] hover:border-b-2 hover:border-[#93c5fd]"
                  >
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke={
                        activeTab === 'subjective' ? primaryColor : '#6b7280'
                      }
                      strokeWidth={2}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </motion.svg>
                    Subjective Test
                  </TabsTrigger>
                  <TabsTrigger
                    value="practical"
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 font-medium rounded-t-lg transition-all data-[state=active]:text-[#060270] data-[state=active]:border-b-2 data-[state=active]:border-[#060270] hover:text-[#060270] hover:border-b-2 hover:border-[#93c5fd]"
                  >
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke={
                        activeTab === 'practical' ? primaryColor : '#6b7280'
                      }
                      strokeWidth={2}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </motion.svg>
                    Practical Test
                  </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <TabsContent value="objective">
                    <motion.div
                      key="objective"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <QAUploadForm />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="subjective">
                    <motion.div
                      key="subjective"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <QAUploadForm />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="practical">
                    <motion.div
                      key="practical"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <PracUploadForm />
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default CreateTest;
