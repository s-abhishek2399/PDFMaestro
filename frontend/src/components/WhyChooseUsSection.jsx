// src/components/WhyChooseUsSection.js
import React from 'react';
import { motion } from 'framer-motion';
import { FiZap, FiShield, FiThumbsUp, FiGift, FiCpu, FiGlobe } from 'react-icons/fi'; // Example icons

const benefits = [
  {
    icon: FiZap,
    title: 'Blazing Fast Processing',
    description: "Don't wait around. Our optimized engine processes your PDFs in mere seconds.",
  },
  {
    icon: FiShield,
    title: 'Your Privacy, Our Priority',
    description: 'Files encrypted during transfer & auto-deleted. We never read or share your data. (Typically 1 hour, confirm actual policy)',
  },
  {
    icon: FiThumbsUp,
    title: 'Intuitive & Beautiful Design',
    description: 'Enjoy a seamless experience with our modern, easy-to-navigate interface for all users.',
  },
  {
    icon: FiCpu, // Replacing toolbox for 'Comprehensive Toolset'
    title: 'Comprehensive Toolset',
    description: "From simple conversions to complex manipulations, we've got you covered for all PDF tasks.",
  },
  {
    icon: FiGlobe,
    title: 'Access Anywhere, Anytime',
    description: 'No downloads, no installations. Works perfectly on all your browsers and devices.',
  },
  {
    icon: FiGift,
    title: 'Generously Free Core Tools',
    description: 'Unlock powerful PDF functionalities essential for everyday tasks without spending a dime.',
  },
];

const WhyChooseUsSection = ({ isDarkMode }) => {
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: "spring", 
        stiffness: 100
      },
    }),
  };
  
  return (
    <section className={`py-16 sm:py-24 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}> {/* Alternating bg */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
            Why <span className={`${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>PDFMaestro</span> Stands Out
          </h2>
          <p className={`mt-4 text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            We're committed to providing the best PDF experience with features designed for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className={`p-6 rounded-xl shadow-lg
                          ${isDarkMode 
                            ? 'bg-slate-800 border border-slate-700' 
                            : 'bg-white border border-slate-200'}`}
            >
              <div className={`inline-block p-3 rounded-full mb-4 
                              ${isDarkMode ? 'bg-sky-500/10 text-sky-400' : 'bg-sky-100 text-sky-600'}`}>
                <benefit.icon className="w-7 h-7" aria-hidden="true" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                {benefit.title}
              </h3>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;