// src/pages/SolutionsPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import useDarkMode from '../../custom_hooks/useDarkMode';
import { solutions } from '../../data/solutionsData'; // Adjust path
import { FiArrowRight, FiCheckCircle, FiShare2 } from 'react-icons/fi'

const SolutionsPage = () => {
  const [isDarkMode, toggleDarkMode] = useDarkMode();

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
  };

  const sectionVariants = {
    initial: { opacity: 0, y: 30 },
    animate: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
    }),
  };

  const toolItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: (i) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut"}
    })
  }

  return (
    <div className={`${isDarkMode ? 'dark' : ''} font-sans`}>
      <div className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen transition-colors duration-300 flex flex-col">
        <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

        <motion.main 
          variants={pageVariants}
          initial="initial"
          animate="animate"
          className="flex-grow"
        >
          {/* Hero Section for Solutions Page */}
          <div className={`py-20 sm:py-24 text-center border-b ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
            >
              {/* You can use a relevant icon here, e.g., FiTarget or FiZap */}
              <FiShare2 className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 ${isDarkMode ? 'text-sky-400' : 'text-sky-500'}`} />
              <h1 className={`text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight ${isDarkMode ? 'text-slate-50' : 'text-slate-900'}`}>
                PDF Solutions for Every Scenario
              </h1>
              <p className={`mt-6 text-lg sm:text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Discover how PDFMaestro's versatile tools can streamline your document workflows, whether for academic, professional, or personal use.
              </p>
            </motion.div>
          </div>

          {/* Solutions Content Section */}
          <div className="py-16 sm:py-24">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
              {solutions.map((solution, index) => (
                <motion.section 
                  key={solution.id}
                  variants={sectionVariants}
                  custom={index} // For stagger effect
                  initial="initial"
                  animate="animate"
                  className={`p-6 sm:p-8 rounded-xl shadow-xl ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                    <div className={`mb-6 md:mb-0 md:shrink-0 flex justify-center md:justify-start`}>
                      <div className={`inline-flex items-center justify-center p-4 rounded-full ${isDarkMode ? 'bg-sky-500/10 text-sky-400' : 'bg-sky-100 text-sky-600'}`}>
                        <solution.icon className="w-10 h-10 sm:w-12 sm:h-12" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-3 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        {solution.title}
                      </h2>
                      <p className={`text-sm sm:text-base mb-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {solution.description}
                      </p>
                    </div>
                  </div>
                  
                  {solution.keyProblemsSolved && solution.keyProblemsSolved.length > 0 && (
                    <div className="mt-6 pt-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}">
                      <h3 className={`text-md font-semibold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Key Challenges Addressed:</h3>
                      <ul className="space-y-1.5">
                        {solution.keyProblemsSolved.map((problem, idx) => (
                          <li key={idx} className="flex items-start">
                            <FiCheckCircle className={`w-4 h-4 mr-2.5 mt-0.5 shrink-0 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                            <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{problem}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {solution.relevantTools && solution.relevantTools.length > 0 && (
                    <div className="mt-6 pt-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}">
                      <h3 className={`text-md font-semibold mb-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Recommended Tools:</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {solution.relevantTools.map((tool, toolIdx) => {
                          const ToolIcon = tool.icon || FiTool; // Fallback icon
                          return (
                            <motion.div 
                              key={tool.slug} 
                              custom={toolIdx} 
                              variants={toolItemVariants}
                              initial="initial" // Ensure variants are applied
                              animate="animate"  // Ensure variants are applied
                            >
                              <Link
                                to={`/${tool.slug}`}
                                className={`flex items-center space-x-2 p-2.5 sm:p-3 rounded-lg transition-all duration-200 ease-out group
                                            ${isDarkMode 
                                              ? 'bg-slate-700/50 hover:bg-slate-600/70 hover:border-sky-500/50 border border-slate-600/40' 
                                              : 'bg-slate-100 hover:bg-slate-200 hover:border-sky-400/50 border border-slate-200/80'}`}
                              >
                                <ToolIcon className={`w-5 h-5 shrink-0 ${isDarkMode ? 'text-sky-400 group-hover:text-sky-300' : 'text-sky-600 group-hover:text-sky-500'}`} />
                                <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-slate-300 group-hover:text-slate-100' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                  {tool.name}
                                </span>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                      {solution.ctaText && (
                        <div className="mt-6 text-center sm:text-right">
                           <Link 
                            to="/all-tools" // Or a specific category link
                            className={`inline-flex items-center px-4 py-2 text-xs sm:text-sm font-medium rounded-md shadow-sm transition-colors
                                        ${isDarkMode ? 'bg-sky-500 hover:bg-sky-400 text-white' : 'bg-sky-600 hover:bg-sky-700 text-white'}`}
                           >
                               {solution.ctaText} <FiArrowRight className="ml-2 h-4 w-4"/>
                           </Link>
                        </div>
                      )}
                    </div>
                  )}
                </motion.section>
              ))}
            </div>
          </div>
        </motion.main>
        <Footer isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      </div>
    </div>
  );
};

export default SolutionsPage;