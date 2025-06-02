// src/pages/FaqPage.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiChevronDown, FiChevronUp, FiLifeBuoy, // Using FiLifeBuoy for main icon
    FiMessageCircle, // Changed from FiMessageSquare for a softer feel
    FiMail, FiAlertCircle 
} from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import useDarkMode from '../../custom_hooks/useDarkMode';
import { faqCategories } from '../../data/faqData'; // Assuming faqData.js is correctly populated

const FaqItem = ({ faq, isOpen, onToggle, isDarkMode }) => {
  return (
    <div 
        className={`border-b last:border-b-0 transition-colors duration-200 
                   ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}
    >
      <button
        onClick={onToggle}
        className="flex justify-between items-center w-full py-5 sm:py-6 px-3 sm:px-4 text-left focus:outline-none group"
        aria-expanded={isOpen}
      >
        <span className={`text-base sm:text-lg font-medium transition-colors duration-200 ease-in-out
                       ${isDarkMode 
                         ? (isOpen ? 'text-sky-400' : 'text-slate-100 group-hover:text-sky-400') 
                         : (isOpen ? 'text-sky-600' : 'text-slate-800 group-hover:text-sky-600')}`}
        >
          {faq.question}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <FiChevronDown 
            className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ml-4 transition-colors duration-200 ease-in-out
                        ${isDarkMode 
                          ? (isOpen ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200') 
                          : (isOpen ? 'text-sky-600' : 'text-slate-500 group-hover:text-slate-700')}`} 
          />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto', marginTop: '-0.5rem', paddingBottom: '1.5rem' }, //pb-6
              collapsed: { opacity: 0, height: 0, marginTop: '0rem', paddingBottom: '0rem' },
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className={`px-3 sm:px-4 pt-1 pb-2 text-sm sm:text-base leading-relaxed prose prose-sm dark:prose-invert max-w-none 
                           ${isDarkMode 
                             ? 'prose-p:text-slate-300 prose-strong:text-slate-100 prose-a:text-sky-400 hover:prose-a:text-sky-300' 
                             : 'prose-p:text-slate-600 prose-strong:text-slate-800 prose-a:text-sky-600 hover:prose-a:text-sky-500'}`}>
              {/* If faq.answer can contain multiple paragraphs or simple HTML, wrap in a div or use dangerouslySetInnerHTML carefully */}
              {/* For now, assuming it's a single paragraph string. */}
              <p>{faq.answer}</p> 
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FaqPage = () => {
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [openIndexes, setOpenIndexes] = useState({}); 

  const handleToggle = (catIndex, faqIndex) => {
    const key = `${catIndex}-${faqIndex}`;
    setOpenIndexes(prev => {
      // Allow multiple items to be open
      return { ...prev, [key]: !prev[key] };
      // // To allow only one item open at a time:
      // const newOpenState = !prev[key];
      // return newOpenState ? { [key]: true } : {};
    });
  };

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1, ease:"circOut" } },
  };

  const sectionHeaderVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };
  
  const categoryVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (i) => ({
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: "easeOut",
        delay: i * 0.1  // Stagger category appearance
      } 
    }),
  };


  return (
    <div className={`${isDarkMode ? 'dark' : ''} font-sans`}>
      <div className={`bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen transition-colors duration-300 flex flex-col`}>
        <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

        <motion.main 
          variants={pageVariants}
          initial="initial"
          animate="animate"
          className="flex-grow"
        >
          {/* Hero Section for FAQ */}
          <div className={`py-20 sm:py-24 text-center border-b ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <motion.div
              variants={sectionHeaderVariants}
              initial="initial"
              animate="animate"
              className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
            >
              <FiLifeBuoy className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 ${isDarkMode ? 'text-sky-400' : 'text-sky-500'}`} />
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight ${isDarkMode ? 'text-slate-50' : 'text-slate-900'}`}>
                Help & Frequently Asked Questions
              </h1>
              <p className={`mt-6 text-lg sm:text-xl max-w-2xl mx-auto ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Welcome to PDFMaestro! All our tools are free. Find quick answers below or contact us for more help.
              </p>
            </motion.div>
          </div>

          {/* FAQ Content Section */}
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            {faqCategories.length > 0 ? (
              faqCategories.map((category, catIndex) => (
                <motion.section 
                  key={category.categoryName}
                  variants={categoryVariants}
                  custom={catIndex} 
                  initial="initial"
                  animate="animate"
                  className="mb-14 sm:mb-16"
                >
                  <h2 className={`text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 pb-3 border-b 
                                 ${isDarkMode ? 'text-sky-400 border-slate-700' : 'text-sky-600 border-slate-300'}`}>
                    {category.categoryName}
                  </h2>
                  <div className={`rounded-xl overflow-hidden shadow-lg ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                    {category.faqs.map((faq, faqIndex) => (
                      <FaqItem
                        key={faq.question}
                        faq={faq}
                        isOpen={openIndexes[`${catIndex}-${faqIndex}`] || false}
                        onToggle={() => handleToggle(catIndex, faqIndex)}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>
                </motion.section>
              ))
            ) : (
              <motion.div 
                variants={categoryVariants} custom={0} initial="initial" animate="animate"
                className={`text-center py-12 px-6 rounded-xl border-2 border-dashed 
                           ${isDarkMode ? 'border-slate-700 bg-slate-800/40' : 'border-slate-300 bg-slate-100/70'}`}>
                <FiAlertCircle className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  Information Coming Soon
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  We're currently preparing helpful guides and FAQs. Please check back shortly!
                </p>
              </motion.div>
            )}

            <motion.div
              variants={categoryVariants} // Reuse category variant for consistent animation
              custom={faqCategories.length} // Stagger after last category
              initial="initial"
              animate="animate"
              className={`mt-20 sm:mt-24 py-10 sm:py-12 px-6 sm:px-10 rounded-2xl text-center 
                         ${isDarkMode ? 'bg-slate-800 shadow-2xl border border-slate-700' : 'bg-white shadow-xl border border-slate-200'}`}
            >
              <FiMessageCircle className={`w-12 h-12 mx-auto mb-6 ${isDarkMode ? 'text-sky-400' : 'text-sky-500'}`} />
              <h3 className={`text-2xl sm:text-3xl font-bold mb-4 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                Still Have Questions?
              </h3>
              <p className={`mb-5 text-base max-w-lg mx-auto ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Our team is happy to help! If you didn't find your answer, please feel free to send us an email.
              </p>
              <p className={`mb-8 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Email us at: {' '}
                <a 
                  href="mailto:inity5174@gmail.com" 
                  className={`font-semibold ${isDarkMode ? 'text-sky-400 hover:text-sky-300' : 'text-sky-600 hover:text-sky-500'} underline underline-offset-2`}
                >
                  inity5174@gmail.com
                </a>
                <br />
                We aim to respond within 24 business hours.
              </p>
             
            </motion.div>
          </div>
        </motion.main>
        <Footer isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      </div>
    </div>
  );
};

export default FaqPage;