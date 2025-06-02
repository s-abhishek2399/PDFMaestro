// src/pages/AboutUsPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import useDarkMode from '../../custom_hooks/useDarkMode';
import { FiZap, FiShield, FiUsers, FiTarget, FiCoffee } from 'react-icons/fi'; // Example icons

const AboutUsPage = () => {
  const [isDarkMode, toggleDarkMode] = useDarkMode();

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const sectionVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (i) => ({ // i for stagger index
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" },
    }),
  };

  const missionPoints = [
    { 
      icon: FiZap, 
      title: "Simplicity & Speed", 
      text: "We believe managing PDFs shouldn't be complicated. Our tools are designed for intuitive use and rapid processing, getting your tasks done efficiently." 
    },
    { 
      icon: FiShield, 
      title: "Security & Privacy", 
      text: "Your documents are important. We prioritize the security of your files with secure connections and automatic deletion of processed data from our servers." 
    },
    { 
      icon: FiUsers, 
      title: "User-Focused", 
      text: "PDFMaestro is built for you. We continuously listen to user feedback to improve our tools and provide solutions that truly meet your needs." 
    },
  ];

  return (
    <div className={`${isDarkMode ? 'dark' : ''} font-sans`}>
      <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen transition-colors duration-300 flex flex-col">
        <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

        <motion.main 
          variants={pageVariants}
          initial="initial"
          animate="animate"
          className="flex-grow"
        >
          {/* Hero-like Section for About Us */}
          <div className={`py-20 sm:py-28 text-center border-b ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
            <motion.div
              variants={sectionVariants} custom={0} initial="initial" animate="animate"
              className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
            >
              <FiCoffee className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 ${isDarkMode ? 'text-sky-400' : 'text-sky-500'}`} />
              <h1 className={`text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight ${isDarkMode ? 'text-slate-50' : 'text-slate-900'}`}>
                About PDFMaestro
              </h1>
              <p className={`mt-6 text-lg sm:text-xl max-w-2xl mx-auto ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Empowering you with simple, powerful, and secure PDF tools for every task. We're passionate about making document management effortless.
              </p>
            </motion.div>
          </div>

          {/* Our Mission/Story Section */}
          <div className="py-16 sm:py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div variants={sectionVariants} custom={1} initial="initial" animate="animate">
                <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight text-center mb-4 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                  Our Commitment
                </h2>
                <p className={`text-center text-md sm:text-lg mb-12 sm:mb-16 max-w-3xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  At PDFMaestro, we're dedicated to providing a seamless and reliable experience for all your PDF challenges. We understand that dealing with documents can be tedious, so we've built a suite of tools that are not only powerful but also incredibly easy to use.
                </p>
              </motion.div>

              <motion.div 
                className="grid md:grid-cols-3 gap-8 sm:gap-10"
                variants={sectionVariants} custom={2} initial="initial" animate="animate" // This will animate the grid container
              >
                {missionPoints.map((point, index) => (
                  <motion.div 
                    key={point.title}
                    // For individual item stagger if parent doesn't have staggerChildren
                    // initial={{ opacity: 0, y: 20 }}
                    // animate={{ opacity: 1, y: 0 }}
                    // transition={{ delay: (index * 0.15) + 0.4, duration: 0.5 }}
                    className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800 shadow-lg' : 'bg-white shadow-xl border border-slate-100'}`}
                  >
                    <div className={`mb-4 inline-flex items-center justify-center p-3 rounded-full ${isDarkMode ? 'bg-sky-500/20 text-sky-400' : 'bg-sky-100 text-sky-600'}`}>
                      <point.icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      {point.title}
                    </h3>
                    <p className={`text-sm sm:text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {point.text}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
              
              <motion.div 
                variants={sectionVariants} custom={3} initial="initial" animate="animate"
                className={`mt-16 sm:mt-20 p-6 sm:p-8 rounded-xl text-center 
                            ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-100 border border-slate-200'}`}
              >
                <FiTarget className={`w-10 h-10 mx-auto mb-4 ${isDarkMode ? 'text-sky-400' : 'text-sky-500'}`} />
                <h3 className={`text-xl sm:text-2xl font-semibold mb-3 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                  Looking Ahead
                </h3>
                <p className={`mb-6 text-sm sm:text-base max-w-md mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  We're constantly working to expand our toolkit and enhance existing features. Your feedback is invaluable in shaping the future of PDFMaestro.
                </p>
                {/* Optional: Link to a contact page or feedback form */}
              </motion.div>

            </div>
          </div>
        </motion.main>
        <Footer isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      </div>
    </div>
  );
};

export default AboutUsPage;