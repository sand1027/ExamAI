import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

const NavigationBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const primaryColor = '#060270';
  const secondaryColor = '#1e3a8a';
  const accentColor = '#93c5fd';

  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const menuVariants = {
    open: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
    closed: { opacity: 0, height: 0, transition: { duration: 0.3 } },
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-bold"
          style={{ color: primaryColor }}
        >
          CareerConnect Proctal
        </Link>
        <button
          className="lg:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {user ? (
              <>
                {user.user_type === 'professor' && (
                  <>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/professor-index"
                          className="px-4 py-2 text-sm font-medium"
                          style={{ color: secondaryColor }}
                        >
                          Dashboard
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger style={{ color: secondaryColor }}>
                        Exams
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:grid-cols-2">
                          {[
                            { to: '/create-test', label: 'Create Test' },
                            { to: '/exam-history', label: 'Exam History' },
                            { to: '/share-exam', label: 'Share Exam' },
                            {
                              to: '/question-management',
                              label: 'Manage Questions',
                            },
                            { to: '/insert-marks', label: 'Insert Marks' },
                            { to: '/view-results', label: 'View Results' },
                          ].map(item => (
                            <li key={item.to}>
                              <NavigationMenuLink asChild>
                                <Link
                                  to={item.to}
                                  className="block p-2 rounded-md hover:bg-gray-100"
                                  style={{ color: primaryColor }}
                                >
                                  {item.label}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger style={{ color: secondaryColor }}>
                        Proctoring
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[200px] gap-3 p-4">
                          {[
                            {
                              to: '/live-monitoring',
                              label: 'Live Monitoring',
                            },
                            {
                              to: '/proctoring-logs',
                              label: 'Proctoring Logs',
                            },
                          ].map(item => (
                            <li key={item.to}>
                              <NavigationMenuLink asChild>
                                <Link
                                  to={item.to}
                                  className="block p-2 rounded-md hover:bg-gray-100"
                                  style={{ color: primaryColor }}
                                >
                                  {item.label}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/payment"
                          className="px-4 py-2 text-sm font-medium"
                          style={{ color: secondaryColor }}
                        >
                          Manage Credits
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/report-problem"
                          className="px-4 py-2 text-sm font-medium"
                          style={{ color: secondaryColor }}
                        >
                          Report Problem
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        style={{
                          borderColor: accentColor,
                          color: primaryColor,
                        }}
                      >
                        Logout
                      </Button>
                    </NavigationMenuItem>
                  </>
                )}
                {user.user_type === 'student' && (
                  <>
                    {[
                      { to: '/student-index', label: 'Dashboard' },
                      { to: '/give-test', label: 'Take Test' },
                      { to: '/student-exam-history', label: 'Exam History' },
                      { to: '/student-results', label: 'Results' },
                      {
                        to: '/student-report-problem',
                        label: 'Report Problems',
                      },
                    ].map(item => (
                      <NavigationMenuItem key={item.to}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={item.to}
                            className="px-4 py-2 text-sm font-medium"
                            style={{ color: secondaryColor }}
                          >
                            {item.label}
                          </Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/change-password"
                          className="px-4 py-2 text-sm font-medium"
                          style={{ color: secondaryColor }}
                        >
                          Change Password
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        style={{
                          borderColor: accentColor,
                          color: primaryColor,
                        }}
                      >
                        Logout
                      </Button>
                    </NavigationMenuItem>
                  </>
                )}
              </>
            ) : (
              <>
                {[
                  { to: '/login', label: 'Login' },
                  { to: '/register', label: 'Register' },
                  { to: '/forgot-password', label: 'Forgot Password' },
                  { to: '/faq', label: 'FAQ' },
                  { to: '/contact-us', label: 'Contact Us' },
                  { to: '/careerconnect', label: 'CareerConnect' },
                ].map(item => (
                  <NavigationMenuItem key={item.to}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={item.to}
                        className="px-4 py-2 text-sm font-medium"
                        style={{ color: secondaryColor }}
                      >
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      {/* Mobile Menu */}
      <motion.div
        className="lg:hidden overflow-hidden"
        animate={isOpen ? 'open' : 'closed'}
        variants={menuVariants}
      >
        <div className="px-4 pb-4">
          {user ? (
            <>
              {user.user_type === 'professor' && (
                <>
                  {[
                    { to: '/professor-index', label: 'Dashboard' },
                    { to: '/payment', label: 'Manage Credits' },
                    { to: '/report-problem', label: 'Report Problem' },
                  ].map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block py-2 text-sm"
                      style={{ color: secondaryColor }}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="py-2">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: primaryColor }}
                    >
                      Exams
                    </p>
                    {[
                      { to: '/create-test', label: 'Create Test' },
                      { to: '/exam-history', label: 'Exam History' },
                      { to: '/share-exam', label: 'Share Exam' },
                      { to: '/question-management', label: 'Manage Questions' },
                      { to: '/insert-marks', label: 'Insert Marks' },
                      { to: '/view-results', label: 'View Results' },
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="block py-1 text-sm pl-4"
                        style={{ color: secondaryColor }}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <div className="py-2">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: primaryColor }}
                    >
                      Proctoring
                    </p>
                    {[
                      { to: '/live-monitoring', label: 'Live Monitoring' },
                      { to: '/proctoring-logs', label: 'Proctoring Logs' },
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="block py-1 text-sm pl-4"
                        style={{ color: secondaryColor }}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  {[
                    { to: '/faq', label: 'FAQ' },
                    { to: '/contact-us', label: 'Contact Us' },
                    { to: '/careerconnect', label: 'CareerConnect' },
                  ].map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block py-2 text-sm"
                      style={{ color: secondaryColor }}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="mt-2 w-full"
                    style={{ borderColor: accentColor, color: primaryColor }}
                  >
                    Logout
                  </Button>
                </>
              )}
              {user.user_type === 'student' && (
                <>
                  {[
                    { to: '/student-index', label: 'Dashboard' },
                    { to: '/give-test', label: 'Take Test' },
                    { to: '/student-exam-history', label: 'Exam History' },
                    { to: '/student-results', label: 'Results' },
                    { to: '/student-report-problem', label: 'Report Problems' },
                    { to: '/change-password', label: 'Change Password' },
                  ].map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block py-2 text-sm"
                      style={{ color: secondaryColor }}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  {[
                    { to: '/faq', label: 'FAQ' },
                    { to: '/contact-us', label: 'Contact Us' },
                    { to: '/careerconnect', label: 'CareerConnect' },
                  ].map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block py-2 text-sm"
                      style={{ color: secondaryColor }}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="mt-2 w-full"
                    style={{ borderColor: accentColor, color: primaryColor }}
                  >
                    Logout
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              {[
                { to: '/login', label: 'Login' },
                { to: '/register', label: 'Register' },
                { to: '/forgot-password', label: 'Forgot Password' },
                { to: '/faq', label: 'FAQ' },
                { to: '/contact-us', label: 'Contact Us' },
                { to: '/careerconnect', label: 'CareerConnect' },
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block py-2 text-sm"
                  style={{ color: secondaryColor }}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </div>
      </motion.div>
    </header>
  );
};

export default NavigationBar;
