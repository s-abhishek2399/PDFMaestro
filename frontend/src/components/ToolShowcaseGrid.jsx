// src/components/ToolShowcaseGrid.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toolCategoriesData, toolSpecificIcons } from '../data/toolsData';
import { FiTool } from 'react-icons/fi';

const ToolShowcaseGrid = ({ isDarkMode }) => {
  const allTools = toolCategoriesData.reduce((acc, category) => {
    if (!category.disabled && category.tools) {
      const categoryTools = category.tools.filter(tool => !tool.comingSoon && !tool.aliasFor);
      acc.push(...categoryTools);
    }
    return acc;
  }, []);

  const uniqueTools = Array.from(new Map(allTools.map(tool => [tool.slug, tool])).values());
  uniqueTools.sort((a, b) => a.name.localeCompare(b.name));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.035, // Slightly adjusted stagger
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 15 }, // Reduced y for smaller items
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 120, damping: 15, mass: 0.8 }, // Adjusted spring for smaller items
    },
  };

  if (uniqueTools.length === 0) {
    return null;
  }

  const renderToolNameWithPdf = (name) => {
    let displayName = name;
    // Check if "PDF" (case-insensitive) is already in the name
    if (!/pdf/i.test(name)) {
      displayName = `${name} PDF`; // Append " PDF" if not present
    }

    const parts = displayName.split(/(PDF)/gi); // Split by "PDF", case-insensitive, keep delimiter
    return parts.map((part, index) => {
      if (part.toLowerCase() === 'pdf') {
        return (
          <span 
            key={index} 
            className={isDarkMode ? 'text-sky-400' : 'text-sky-600'}
          >
            {part} {/* Ensure original casing of "PDF" is preserved if it was already there */}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div 
      className={`py-8 sm:py-10 border-b ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2.5 sm:gap-3" // Reduced gap
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {uniqueTools.map((tool) => {
            const IconComponent = toolSpecificIcons[tool.name] || FiTool;
            return (
              <motion.div
                key={tool.slug}
                variants={itemVariants}
                className="group relative"
              >
                <Link
                  to={`/${tool.slug}`}
                  className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-lg  // Reduced padding
                              min-h-[80px] sm:min-h-[90px] md:min-h-[100px] // Set min-height for items
                              transition-all duration-200 ease-out transform 
                              will-change-transform
                              ${isDarkMode 
                                ? 'bg-slate-800/50 hover:bg-slate-700/70 border border-slate-700/70 hover:border-sky-500 hover:scale-105' 
                                : 'bg-slate-100/60 hover:bg-white border border-transparent hover:border-slate-300 hover:shadow-lg hover:scale-105'
                              }
                              focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-sky-400 focus:ring-offset-slate-900' : 'focus:ring-sky-500 focus:ring-offset-white'} focus:scale-105`}
                  title={tool.description || tool.name}
                >
                  <IconComponent 
                    className={`w-6 h-6 sm:w-7 sm:h-7 mb-1 sm:mb-1.5 transition-all duration-200 ease-out // Reduced icon size and margin
                               ${isDarkMode 
                                 ? 'text-slate-400 group-hover:text-sky-400' 
                                 : 'text-slate-500 group-hover:text-sky-600'}
                               group-hover:scale-110 group-focus:text-sky-500`}
                  />
                  <span 
                    className={`text-[10px] sm:text-[11px] font-medium text-center line-clamp-2 leading-snug transition-colors duration-200 ease-out // Reduced font size, adjusted leading
                               ${isDarkMode 
                                 ? 'text-slate-400 group-hover:text-slate-200' 
                                 : 'text-slate-600 group-hover:text-slate-900'}`}
                  >
                    {renderToolNameWithPdf(tool.name)}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default ToolShowcaseGrid;