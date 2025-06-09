import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const primaryColor = '#060270';
  const secondaryColor = '#1e3a8a';
  const accentColor = '#93c5fd';

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
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
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const handleNewsletterSubmit = e => {
    e.preventDefault();
    alert('Subscribed to newsletter!');
    // Implement actual newsletter subscription logic here (e.g., API call)
  };

  return (
    <footer
      className="relative py-12 px-4 bg-gray-900 text-white"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%231e3a8a' fill-opacity='0.1' d='M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <motion.div
        className="max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Branding and Description */}
          <motion.div variants={itemVariants}>
            <h3
              className="text-2xl font-bold mb-4"
              style={{ color: accentColor }}
            >
              CareerConnect Proctal
            </h3>
            <p className="text-gray-400 mb-4">
              Empowering careers with secure, AI-powered proctoring for
              job-defining exams.
            </p>
            <motion.div
              className="flex gap-4"
              variants={itemVariants}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-300"
              >
                <Facebook className="w-6 h-6" style={{ color: accentColor }} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-300"
              >
                <Twitter className="w-6 h-6" style={{ color: accentColor }} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-300"
              >
                <Linkedin className="w-6 h-6" style={{ color: accentColor }} />
              </a>
            </motion.div>
          </motion.div>

          {/* Navigation Links */}
          <motion.div variants={itemVariants}>
            <h3
              className="text-xl font-semibold mb-4"
              style={{ color: primaryColor }}
            >
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { to: '/about', label: 'About' },
                { to: '/careerconnect', label: 'CareerConnect' },
                { to: '/contact', label: 'Contact' },
                { to: '/faq', label: 'FAQ' },
                { to: '/privacy', label: 'Privacy Policy' },
              ].map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-blue-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter Signup */}
          <motion.div variants={itemVariants}>
            <h3
              className="text-xl font-semibold mb-4"
              style={{ color: primaryColor }}
            >
              Stay Updated
            </h3>
            <form onSubmit={handleNewsletterSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full text-gray-900"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                style={{ backgroundColor: accentColor, color: primaryColor }}
              >
                <Mail className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </form>
          </motion.div>
        </div>

        {/* Bottom Bar with Copyright and Animated SVG */}
        <motion.div
          className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center"
          variants={itemVariants}
        >
          <p className="text-gray-400 mb-4 md:mb-0">
            © 2025 CareerConnect Proctal. All rights reserved.
          </p>
          <motion.div variants={svgVariants} animate="animate">
            <svg
              width="50"
              height="50"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="25"
                cy="25"
                r="20"
                fill={accentColor}
                fillOpacity="0.2"
              />
              <path
                d="M25 10C16.7157 10 10 16.7157 10 25C10 33.2843 16.7157 40 25 40C33.2843 40 40 33.2843 40 25C40 16.7157 33.2843 10 25 10ZM25 35C19.4772 35 15 30.5228 15 25C15 19.4772 19.4772 15 25 15C30.5228 15 35 19.4772 35 25C35 30.5228 30.5228 35 25 35Z"
                fill={primaryColor}
              />
              <path d="M25 18L30 25L25 32L20 25L25 18Z" fill={secondaryColor} />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;
