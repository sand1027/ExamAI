// src/layouts/ProfessorLayout.jsx
import React, { useContext } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { SidebarContext } from '../context/SidebarContext';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';

const ProfessorLayout = () => {
  const { user } = useContext(AuthContext);
  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);
  const primaryColor = '#060270';
  const secondaryColor = '#1e3a8a';
  const accentColor = '#93c5fd';

  const navItems = [
    { to: '/create-test', label: 'Create Test', icon: 'M12 4v16m8-8H4' },
    {
      to: '/exam-history',
      label: 'Exam History',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      to: '/share-exam',
      label: 'Share Exam',
      icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    },
    {
      to: '/question-management',
      label: 'Manage Questions',
      icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4 0 2.21-1.79 4-4 4-.547 0-1.074-.112-1.557-.31',
    },
    {
      to: '/insert-marks',
      label: 'Insert Marks',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    },
    {
      to: '/view-results',
      label: 'View Results',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      to: '/live-monitoring',
      label: 'Live Monitoring',
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    },
    {
      to: '/proctoring-logs',
      label: 'Proctoring Logs',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      to: '/payment',
      label: 'Manage Credits',
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    },
    {
      to: '/report-problem',
      label: 'Report Problem',
      icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      to: '/faq',
      label: 'FAQ',
      icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4 0 2.21-1.79 4-4 4-.547 0-1.074-.112-1.557-.31',
    },
    {
      to: '/contact-us',
      label: 'Contact Us',
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    },
  ];

  if (!user || user.user_type !== 'professor') {
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
    <div className="flex flex-col min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Sidebar and Content Wrapper */}
      <div className="flex flex-1">
        {/* Sidebar for Desktop */}
        <motion.aside
          initial={{ x: isSidebarOpen ? 0 : -250 }}
          animate={{ x: isSidebarOpen ? 0 : -250 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="hidden lg:block w-64 bg-white/95 backdrop-blur-md shadow-lg z-20"
          style={{ height: 'calc(100vh - 80px)' }}
        >
          <div className="p-6 flex justify-between items-center">
            <div>
              <h2
                className="text-2xl font-bold"
                style={{ color: primaryColor }}
              >
                Professor Dashboard
              </h2>
              <p className="text-sm text-gray-600 mt-1">Welcome, {user.name}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="mt-4">
            {navItems.map(item => (
              <Button
                key={item.to}
                asChild
                variant="ghost"
                className="w-full justify-start text-left px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-[#060270]"
              >
                <Link to={item.to} className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke={primaryColor}
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={item.icon}
                    />
                  </svg>
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Sidebar Trigger */}
          <div className="lg:hidden p-4 bg-white shadow-md sticky top-0 z-30">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-6 flex justify-between items-center">
                  <div>
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: primaryColor }}
                    >
                      Professor Dashboard
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Welcome, {user.name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="mt-4">
                  {navItems.map(item => (
                    <Button
                      key={item.to}
                      asChild
                      variant="ghost"
                      className="w-full justify-start text-left px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-[#060270]"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Link to={item.to} className="flex items-center gap-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke={primaryColor}
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={item.icon}
                          />
                        </svg>
                        {item.label}
                      </Link>
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#060270] text-white py-8 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: accentColor }}
              >
                Exam Management System
              </h3>
              <p className="text-gray-300 text-sm">
                Empowering educators with seamless tools for exam creation,
                proctoring, and result management.
              </p>
            </div>
            <div>
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: accentColor }}
              >
                Quick Links
              </h3>
              <ul className="space-y-2">
                {[
                  'Create Test',
                  'Exam History',
                  'View Results',
                  'Report Problem',
                ].map((label, i) => (
                  <li key={i}>
                    <Link
                      to={navItems.find(item => item.label === label).to}
                      className="text-gray-300 hover:text-[#93c5fd] text-sm"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: accentColor }}
              >
                Contact Us
              </h3>
              <p className="text-gray-300 text-sm">
                Email: support@examsystem.com
                <br />
                Phone: +1-800-555-1234
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-4 text-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Exam Management System. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
