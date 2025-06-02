// src/components/PopularToolsSection.js
import React from 'react';
import { motion } from 'framer-motion';
import { FaFilePdf, FaCut, FaCompressArrowsAlt, FaExchangeAlt, FaImage, FaRedoAlt, FaLock } from 'react-icons/fa'; // Example icons
import { Link } from 'react-router-dom';

const popularTools = [
  { name: 'Merge PDF', icon: FaFilePdf, slug: 'merge-pdf', tagline: 'Combine multiple PDFs into one.' },
  { name: 'Split PDF', icon: FaCut, slug: 'split-pdf', tagline: 'Extract pages or create new PDFs.' },
  { name: 'Compress PDF', icon: FaCompressArrowsAlt, slug: 'compress-pdf', tagline: 'Reduce PDF file size quickly.' },
  { name: 'PDF to Word', icon: FaExchangeAlt, slug: 'pdf-to-word', tagline: 'Convert PDF to editable DOCX.' },
  { name: 'Images to PDF', icon: FaImage, slug: 'images-to-pdf', tagline: 'Convert JPG, PNG to PDF easily.' },
  { name: 'Rotate PDF', icon: FaRedoAlt, slug: 'rotate-pdf', tagline: 'Turn PDF pages clockwise.' },
  //   { name: 'Protect PDF', icon: FaLock, slug: 'protect-pdf', tagline: 'Add password to your PDF.' },
];

const PopularToolsSection = ({ isDarkMode }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  return (
    <section id="popular-tools" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
            Your Everyday <span className={`${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>PDF Essentials</span>
          </h2>
          <p className={`mt-4 text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Quickly access our most frequently used PDF tools to get your tasks done faster.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {popularTools.map((tool, index) => (
            <motion.a
              key={tool.name}
              href={tool.slug === 'merge-pdf' ? '/merge-pdf' :
                tool.slug === 'compress-pdf' ? '/compress-pdf' :
                tool.slug === 'split-pdf' ? '/split-pdf' :
                tool.slug === 'rotate-pdf' ? '/rotate-pdf' :
                tool.slug === 'images-to-pdf' ? '/images-to-pdf' :
                tool.slug === 'pdf-to-word' ? '/pdf-to-word' :


                
                
                  `#/${tool.slug}`}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className={`block p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300
                          ${isDarkMode
                  ? 'bg-slate-800 border border-slate-700 hover:border-sky-500'
                  : 'bg-white border border-slate-200 hover:border-sky-400'}`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700 text-sky-400' : 'bg-sky-100 text-sky-600'}`}>
                  <tool.icon className="w-7 h-7" aria-hidden="true" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    {tool.name}
                  </h3>
                  <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {tool.tagline}
                  </p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
        <div className="mt-12 text-center">
          <a
            href="/all-tools"
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm transition-colors
                            ${isDarkMode
                ? 'text-sky-400 bg-sky-900/30 hover:bg-sky-800/50 border-sky-700 hover:border-sky-600'
                : 'text-sky-600 bg-sky-100 hover:bg-sky-200 border-sky-200 hover:border-sky-300'
              }`}
          >
            View All PDF Tools
          </a>
        </div>
      </div>
    </section>
  );
};

export default PopularToolsSection;