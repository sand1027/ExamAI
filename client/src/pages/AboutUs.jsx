import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, BookOpen } from 'lucide-react';

const AboutUs = () => {
  const primaryColor = '#060270';
  const secondaryColor = '#1e3a8a';
  const accentColor = '#93c5fd';

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900">
      <motion.section
        className="py-16 px-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1
            className="text-5xl font-bold mb-6"
            style={{ color: primaryColor }}
            variants={itemVariants}
          >
            About CareerConnect Proctal
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            CareerConnect Proctal is a leading platform for secure, AI-powered
            proctoring, empowering educators and students to conduct fair and
            efficient exams.
          </motion.p>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: (
                <Shield
                  className="w-12 h-12"
                  style={{ color: secondaryColor }}
                />
              ),
              title: 'Our Mission',
              description:
                'To provide a secure and accessible platform for career-defining assessments.',
            },
            {
              icon: (
                <Users
                  className="w-12 h-12"
                  style={{ color: secondaryColor }}
                />
              ),
              title: 'Our Team',
              description:
                'A dedicated group of educators, technologists, and innovators.',
            },
            {
              icon: (
                <BookOpen
                  className="w-12 h-12"
                  style={{ color: secondaryColor }}
                />
              ),
              title: 'Our Vision',
              description:
                'To revolutionize online education with cutting-edge proctoring solutions.',
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-4">
                    {item.icon}
                    <span style={{ color: primaryColor }}>{item.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default AboutUs;
