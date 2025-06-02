// src/components/FinalCTASection.jsx
import React from 'react';
import { motion, useViewportScroll, useTransform } from 'framer-motion'; // Added more hooks for potential parallax
import { FiArrowRight, FiZap } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const FinalCTASection = ({ isDarkMode }) => {
  const headlineWords = "Ready to Master Your PDFs?".split(" ");

  // Variants for staggered word animation
  const wordContainerVariants = {
    hidden: { opacity: 1 }, // Parent is visible
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const wordChildVariants = {
    hidden: { opacity: 0, y: 25, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring', damping: 15, stiffness: 100 },
    },
  };

  // Variant for paragraph and button container
  const fadeInVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: 'easeOut', delay: headlineWords.length * 0.1 + 0.3 },
    },
  };

  return (
    <section 
      className={`relative py-24 sm:py-32 md:py-40 overflow-hidden
                 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-sky-600 text-white'}`}
    >
      {/* Abstract Background Element - Static Version */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-0"
      >
        <div 
          className={`absolute -bottom-1/3 -left-1/4 w-[150%] h-[150%] opacity-20 dark:opacity-15 rounded-full 
                     ${isDarkMode ? 'bg-[radial-gradient(ellipse_at_center,_rgba(30,144,255,0.3)_0%,_transparent_60%)]' 
                                  : 'bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.25)_0%,_transparent_60%)]'}`}
          style={{ transform: 'translateZ(0)' }} // For GPU acceleration
        />
         <div 
          className={`absolute -top-1/4 -right-1/4 w-[120%] h-[120%] opacity-15 dark:opacity-10 rounded-full 
                     ${isDarkMode ? 'bg-[radial-gradient(ellipse_at_center,_rgba(79,70,229,0.2)_0%,_transparent_65%)]' 
                                  : 'bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.15)_0%,_transparent_65%)]'}`}
          style={{ transform: 'translateZ(0)' }}
        />
      </div>


      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight mb-6 sm:mb-8"
          variants={wordContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }} // Trigger when 20% is visible
        >
          {headlineWords.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              variants={wordChildVariants}
              className={`inline-block 
                         ${i === headlineWords.length - 1 ? (isDarkMode ? 'text-sky-400' : 'text-yellow-300') : (isDarkMode ? 'text-slate-100' : 'text-white')}
                         ${i < headlineWords.length -1 ? 'mr-2 sm:mr-2.5 md:mr-3' : ''}`}
            >
              {word}
            </motion.span>
          ))}
        </motion.h2>

        <motion.p
          variants={fadeInVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className={`text-lg sm:text-xl max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed
                      ${isDarkMode ? 'text-slate-300' : 'text-sky-100'}`}
        >
          Simplify your document workflows with PDFMaestro. Access a full suite of powerful, intuitive, and completely free online PDF tools.
        </motion.p>

        <motion.div
          variants={fadeInVariants} // Re-use fadeIn for button, but with a slightly later effective delay due to parent's delay
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
        >
          <Link
            to="/all-tools" 
            className={`inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-4 
                        text-base sm:text-lg font-semibold rounded-xl shadow-2xl transition-all duration-300 ease-out-cubic
                        transform focus:outline-none focus:ring-4 focus:ring-offset-2 group
                        ${isDarkMode 
                            ? 'text-slate-900 bg-sky-400 hover:bg-sky-300 focus:ring-sky-400/60 focus:ring-offset-slate-900 active:bg-sky-500' 
                            : 'text-white bg-sky-700 hover:bg-sky-800 focus:ring-sky-700/60 focus:ring-offset-sky-600 active:bg-sky-800'
                        }
                        hover:shadow-[0_0_30px_0px_rgba(56,189,248,0.4)] dark:hover:shadow-[0_0_30px_0px_rgba(56,189,248,0.3)]
                        hover:-translate-y-1 active:translate-y-0`}
          >
            <FiZap className="w-5 h-5 sm:w-6 sm:h-6 mr-2.5 -ml-1 transition-transform duration-300 group-hover:rotate-[15deg]"/>
            Explore Free Tools
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;