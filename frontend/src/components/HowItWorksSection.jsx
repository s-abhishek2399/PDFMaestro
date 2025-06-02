// src/components/HowItWorksSection.js
import React from 'react';
import { motion } from 'framer-motion';
import { AiOutlineSelect, AiOutlineCloudUpload, AiOutlineDownload } from 'react-icons/ai';

const steps = [
  {
    icon: AiOutlineSelect,
    title: 'Choose Your Tool',
    description: 'Pick from our wide range of powerful PDF utilities tailored for your specific need.',
  },
  {
    icon: AiOutlineCloudUpload,
    title: 'Upload Your File(s)',
    description: 'Securely drag & drop your document or browse from your device. We prioritize your privacy.',
  },
  {
    icon: AiOutlineDownload,
    title: 'Process & Download',
    description: 'Your transformed file is ready in seconds. Download and share instantly.',
  },
];

const HowItWorksSection = ({ isDarkMode }) => {
  const headlineText = "PDF Tasks Made Simple".split(" ");
  
  const headlineWordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        type: 'spring',
        stiffness: 100,
        damping: 12
      },
    }),
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: 0.2 + i * 0.2, // Start after headline, then stagger
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1] // Ease Out Cubic
      },
    }),
  };

  return (
    <section className={`py-16 sm:py-24 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <motion.h2
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            aria-label="PDF Tasks Made Simple"
          >
            {headlineText.map((word, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={headlineWordVariants}
                className={`inline-block ${
                  (word === "Made" || word === "Simple") 
                  ? (isDarkMode ? 'text-sky-400' : 'text-sky-600') 
                  : ''
                } ${i < headlineText.length -1 ? 'mr-2 sm:mr-3' : ''}`} // Add space between words
              >
                {word}
              </motion.span>
            ))}
          </motion.h2>
          <motion.p
             initial={{ opacity: 0, y:10 }}
             whileInView={{ opacity:1, y:0 }}
             viewport={{ once: true, amount:0.3 }}
             transition={{delay: headlineText.length * 0.1 + 0.1, duration:0.5}}
             className={`mt-4 text-lg max-w-xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
          >
            Get your PDF work done effortlessly in just three straightforward steps.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-10 lg:gap-12 relative">
          {/* Optional: Decorative connecting lines (more complex to make look great) */}
           <div aria-hidden="true" className="hidden md:block absolute top-12 left-0 right-0 h-full">
                <svg width="100%" height="100%" preserveAspectRatio="none" className="pointer-events-none">
                    <path 
                        d={`M ${100 / 6}%, 0 Q ${100 / 2}%, 0 ${100 / 2}%, 50% T ${(100 / 6) * 5}%, 100%`} 
                        strokeDasharray="5, 5" 
                        strokeWidth="2"
                        className={`${isDarkMode ? 'stroke-slate-600' : 'stroke-slate-300'}`}
                        fill="none"
                        transform="translate(0, 20)" // Adjust Y offset of the line
                    />
                     {/* Example for a more wavy line for 3 items. For a straight dashed line between items 1-2 and 2-3:
                    <line x1="25%" y1="2.5rem" x2="75%" y2="2.5rem" className={`${isDarkMode ? 'stroke-slate-600' : 'stroke-slate-300'}`} strokeDasharray="5,5" strokeWidth="2"/>
                    Could have two lines: one from step 1 to 2's horizontal position, another from 2 to 3.
                     */}
                </svg>
            </div>


          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              custom={index}
              variants={stepVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              className={`flex flex-col items-center text-center p-6 sm:p-8 rounded-xl relative z-10
                           transform transition-all duration-300 hover:scale-105
                           ${isDarkMode 
                             ? 'bg-slate-700/70 shadow-2xl shadow-sky-900/10 border border-slate-600 hover:border-sky-500' 
                             : 'bg-white shadow-2xl shadow-sky-200/30 border border-slate-200/80 hover:border-sky-300'
                           }`}
            >
              <div
                className={`mb-6 inline-flex items-center justify-center p-4 rounded-full ring-4 ring-opacity-30
                            ${isDarkMode ? 'bg-sky-500 text-white ring-sky-400' : 'bg-sky-600 text-white ring-sky-500'}`}
              >
                <step.icon className="w-8 h-8 sm:w-10 sm:h-10" aria-hidden="true" />
                 <span 
                    className={`absolute -top-3 -right-3 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 text-sm font-bold rounded-full border-2 
                                ${isDarkMode ? 'bg-slate-600 text-sky-300 border-slate-500' : 'bg-slate-100 text-sky-700 border-white'}`}
                >
                    {index + 1}
                </span>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                {step.title}
              </h3>
              <p className={`text-sm sm:text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;