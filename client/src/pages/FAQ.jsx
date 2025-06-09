import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

const FAQ = () => {
  const primaryColor = '#060270';
  const secondaryColor = '#1e3a8a';
  const accentColor = '#93c5fd';
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: 'How do I create an exam?',
      answer:
        "Professors can create exams by navigating to the 'Create Test' page and selecting the type of exam (objective, subjective, or practical).",
    },
    {
      question: 'How does proctoring work?',
      answer:
        'Proctoring uses webcam and audio to monitor students, logging images, audio frequency, and window events every 5 seconds.',
    },
    {
      question: 'How do I reset my password?',
      answer:
        "Use the 'Forgot Password' link on the login page to receive a reset email.",
    },
  ];

  const toggleAccordion = index => {
    setActiveIndex(activeIndex === index ? null : index);
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

  const accordionVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: { height: 'auto', opacity: 1 },
  };

  const svgVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.1, 0.15, 0.1],
      transition: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
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
        {/* Grid of subtle nodes */}
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
        {/* Connecting lines */}
        <path
          d="M120 100 H1320 M120 200 H1320 M120 300 H1320 M120 400 H1320 M120 500 H1320 M120 600 H1320 M120 700 H1320 M120 800 H1320 M120 100 V800 M240 100 V800 M360 100 V800 M480 100 V800 M600 100 V800 M720 100 V800 M840 100 V800 M960 100 V800 M1080 100 V800 M1200 100 V800 M1320 100 V800"
          stroke={secondaryColor}
          strokeWidth="1"
          strokeOpacity="0.1"
        />
        {/* Central accent shape */}
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

      {/* FAQ Content */}
      <motion.div
        className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full relative z-10"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <h2
          className="text-3xl font-bold mb-6 text-center"
          style={{ color: primaryColor }}
        >
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200">
              <Button
                variant="ghost"
                className="w-full flex justify-between items-center py-3 text-left"
                style={{ color: secondaryColor }}
                onClick={() => toggleAccordion(index)}
              >
                <span className="text-lg font-medium">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 transform transition-transform duration-300 ${
                    activeIndex === index ? 'rotate-180' : ''
                  }`}
                  style={{ color: accentColor }}
                />
              </Button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    variants={accordionVariants}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <p className="text-gray-600 pb-4">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default FAQ;
