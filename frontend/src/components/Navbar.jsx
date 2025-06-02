// src/components/Navbar.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom'; // Use NavLink for active states
import { AiOutlineMenu, AiOutlineClose, AiOutlineSun, AiOutlineMoon, AiOutlineTool } from 'react-icons/ai';

const Logo = ({ isDarkMode }) => (
  <NavLink to="/" className="flex items-center space-x-2 shrink-0"> {/* Use NavLink for logo to go home */}
    <AiOutlineTool className={`w-7 h-7 transition-colors duration-300 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`} />
    <span className="text-2xl font-bold">
      <span className={`transition-colors duration-300 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>PDF</span>
      <span className={`transition-colors duration-300 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Maestro</span>
    </span>
  </NavLink>
);

const Navbar = ({ isDarkMode, toggleDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'All PDF Tools', href: '/all-tools' },
    {name: 'Solutions', href: '/solutions' },
    { name: 'FAQ / Help', href: '/help' },
    { name: 'About Us', href: '/about-us' },
  ];

  // Filter out any placeholder links if necessary, though all current links are valid
  const actualNavLinks = navLinks.filter(link => link.href && link.href !== '#');

  const getLinkClassName = ({ isActive }) => {
    const baseClasses = `px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out`;
    const activeClasses = isDarkMode
      ? 'text-sky-400 bg-slate-700 shadow-inner'
      : 'text-sky-600 bg-sky-100 shadow-inner';
    const inactiveClasses = isDarkMode
      ? 'text-slate-300 hover:text-sky-300 hover:bg-slate-700/60'
      : 'text-slate-600 hover:text-sky-600 hover:bg-slate-100';

    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  const getMobileLinkClassName = ({ isActive }) => {
    const baseClasses = `block px-3 py-3 rounded-md text-base font-medium transition-all duration-200 ease-in-out`; // Slightly more padding for mobile
    const activeClasses = isDarkMode
      ? 'text-sky-400 bg-slate-700'
      : 'text-sky-600 bg-sky-100';
    const inactiveClasses = isDarkMode
      ? 'text-slate-300 hover:bg-slate-700 hover:text-sky-300'
      : 'text-slate-700 hover:bg-slate-100 hover:text-sky-600';

    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }} // Start slightly off-screen and transparent
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`sticky top-0 z-50 w-full shadow-lg ${ // Increased shadow
        isDarkMode
          ? 'bg-slate-800/90 border-b border-slate-700/50 backdrop-blur-lg' // More blur, subtler border
          : 'bg-white/90 border-b border-slate-200/70 backdrop-blur-lg'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20"> {/* Slightly taller navbar */}
          <Logo isDarkMode={isDarkMode} />

          <div className="hidden md:flex items-center space-x-2"> {/* Desktop Links */}
            {actualNavLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.href}
                className={getLinkClassName}
                end={link.href === "/"} // `end` prop for exact match on Home link
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center"> {/* Right side items */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200
                          ${isDarkMode
                  ? 'text-slate-400 hover:text-sky-400 focus:ring-sky-500 focus:ring-offset-slate-800'
                  : 'text-slate-500 hover:text-sky-600 focus:ring-sky-600 focus:ring-offset-white'
                }`}
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <AiOutlineSun size={22} /> : <AiOutlineMoon size={22} />}
            </button>

            <div className="ml-2 md:hidden"> {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200
                            ${isDarkMode
                    ? 'text-slate-400 hover:text-sky-400 focus:ring-sky-500 focus:ring-offset-slate-800'
                    : 'text-slate-500 hover:text-sky-600 focus:ring-sky-600 focus:ring-offset-white'
                  }`}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
              >
                {isOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -20 }} // Slide down from top effect
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} // Slide up on exit
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-t"
            style={{ borderColor: isDarkMode ? 'rgba(51, 65, 85, 0.7)' : 'rgba(226, 232, 240, 0.7)' }} // Dynamic border with opacity
          >
            <div className="px-3 pt-2 pb-3 space-y-1 sm:px-4">
              {actualNavLinks.map((link) => (
                <NavLink
                  key={`${link.name}-mobile`}
                  to={link.href}
                  className={getMobileLinkClassName}
                  onClick={() => setIsOpen(false)} // Close menu on link click
                  end={link.href === "/"}
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;