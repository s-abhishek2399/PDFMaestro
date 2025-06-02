// src/pages/AllToolsPage.js
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar'; 
import Footer from '../../components/Footer';   
import useDarkMode from '../../custom_hooks/useDarkMode';
import { toolCategoriesData as allToolCategories, toolSpecificIcons } from '../../data/toolsData'; 
import { motion, AnimatePresence } from 'framer-motion';
import { FiTool, FiAlertCircle, FiArrowRightCircle, FiSearch, FiX } from 'react-icons/fi';

const AllToolsPage = () => {
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [searchTerm, setSearchTerm] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 120, damping: 14 },
    },
  };

  const filteredToolCategories = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase().trim();

    if (!lowercasedSearchTerm) {
      return allToolCategories.map(category => ({
          ...category,
          tools: category.tools || [] 
      }));
    }

    const result = allToolCategories.map(category => {
      if (category.disabled) {
        return { ...category, tools: category.tools || [] };
      }

      const categoryNameMatches = category.name.toLowerCase().includes(lowercasedSearchTerm);
      
      const matchingTools = (category.tools || []).filter(tool => {
        const toolNameMatches = tool.name.toLowerCase().includes(lowercasedSearchTerm);
        const toolDescriptionMatches = tool.description && tool.description.toLowerCase().includes(lowercasedSearchTerm);
        
        if (categoryNameMatches && !tool.comingSoon) {
            return true; 
        }
        return toolNameMatches || toolDescriptionMatches;
      });
      
      return {
        ...category,
        tools: matchingTools,
      };
    })
    .filter(category => {
        return category.disabled || (category.tools && category.tools.length > 0) || category.comingSoonMessage;
    });
    
    return result;

  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };
  
  const hasAnyVisibleCategories = useMemo(() => filteredToolCategories.length > 0, [filteredToolCategories]);

  return (
    <div className={`${isDarkMode ? 'dark' : ''} font-sans`}>
      <div className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen transition-colors duration-300 flex flex-col">
        <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-10 sm:mb-12">
            <motion.h1
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${isDarkMode ? 'text-slate-50' : 'text-slate-900'}`}
            >
              All PDF Tools
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className={`mt-4 text-lg max-w-3xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
            >
              Explore our full suite of powerful and easy-to-use PDF utilities. Find the perfect tool for any task.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
            className="mb-10 sm:mb-12 max-w-2xl mx-auto"
          >
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className={`h-5 w-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                </div>
                <input
                    type="search" name="toolSearch" id="toolSearch" value={searchTerm} onChange={handleSearchChange}
                    placeholder="Search for a tool (e.g., merge, compress, word to pdf...)"
                    className={`block w-full pl-10 pr-10 py-3 text-sm rounded-xl shadow-md focus:outline-none transition-all duration-200
                                border ${isDarkMode 
                                    ? 'bg-slate-700 text-slate-100 placeholder-slate-400 border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500' 
                                    : 'bg-white text-slate-800 placeholder-slate-500 border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500'}`}
                />
                {searchTerm && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button onClick={clearSearch} className={`p-1 rounded-full ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`} aria-label="Clear search">
                        <FiX className="h-4 w-4" />
                    </button>
                    </div>
                )}
            </div>
          </motion.div>

          <AnimatePresence mode="popLayout">
            {filteredToolCategories.map((category) => (
              category.disabled ? (
                <motion.div
                    key={`${category.name}-disabled`} 
                    variants={itemVariants} // Apply itemVariants for consistency if the whole block animates
                    initial="hidden" 
                    animate="visible" // Use animate here for direct rendering controlled by AnimatePresence
                    exit="hidden" // Define exit for AnimatePresence
                    layout // Animate layout changes
                    className={`mb-12 p-6 rounded-lg text-center ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-200 border-slate-300'}`}
                >
                    <div className="flex items-center justify-center mb-3">
                    <category.icon className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`} />
                    <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{category.name}</h2>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {category.comingSoonMessage || "This category of tools is currently under development. Check back soon!"}
                    </p>
                </motion.div>
              ) : 
              category.tools && category.tools.length > 0 ? (
                <motion.div
                  key={category.name} className="mb-12 sm:mb-16"
                  layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, type:"spring", stiffness:100, damping:15 }}
                >
                  <div className="mb-8 sm:mb-10 pb-3 border-b-2 relative">
                    <div className={`absolute bottom-[-2px] left-0 h-0.5 w-1/4 sm:w-1/6 ${isDarkMode ? 'bg-sky-500' : 'bg-sky-600'}`}></div>
                    <div className="flex items-end space-x-3">
                        <category.icon className={`w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`} />
                        <div>
                        <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{category.name}</h2>
                        {category.description && (<p className={`text-sm mt-1 max-w-2xl ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{category.description}</p>)}
                        </div>
                    </div>
                  </div>
                  
                  <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6"
                    variants={containerVariants} initial="hidden" animate="visible" // Stagger children
                  >
                    {category.tools.map((tool) => {
                      const IconComponent = toolSpecificIcons[tool.name] || FiTool;
                      const cardBaseClass = `group rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-out flex flex-col text-left h-full relative`;
                      const cardBgClass = isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200';
                      const activeCardHoverClass = isDarkMode
                          ? 'hover:border-sky-500 hover:shadow-[0_0_15px_rgba(56,189,248,0.2)] hover:scale-[1.02]'
                          : 'hover:border-sky-500 hover:shadow-[0_0_15px_rgba(14,165,233,0.2)] hover:scale-[1.02]';
                      const disabledCardClass = isDarkMode
                          ? 'bg-slate-800/60 border-slate-700/60 opacity-70 cursor-not-allowed'
                          : 'bg-slate-100/60 border-slate-200/60 opacity-70 cursor-not-allowed';

                      return (
                        <motion.div key={tool.slug} variants={itemVariants} layout> {/* Animate individual card layout changes */}
                          {tool.comingSoon ? (
                            <div className={`${cardBaseClass} ${disabledCardClass} p-5`}>
                              <div className={`p-2.5 mb-3 rounded-lg inline-block ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                  <IconComponent className={`w-6 h-6 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                              </div>
                              <h3 className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{tool.name}</h3>
                              <p className={`text-xs flex-grow mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{tool.description || "Details coming soon."}</p>
                              <div className={`mt-auto text-[10px] font-semibold px-2 py-0.5 rounded-full self-start ${isDarkMode ? 'bg-yellow-600/30 text-yellow-400 border border-yellow-500/30' : 'bg-yellow-100 text-yellow-600 border border-yellow-200/80'}`}>
                                  COMING SOON
                              </div>
                            </div>
                          ) : (
                            <Link to={`/${tool.slug}`} className={`${cardBaseClass} ${cardBgClass} ${activeCardHoverClass}`}>
                              <div className="p-5 flex flex-col flex-grow">
                                  <div className={`p-3 mb-4 rounded-lg inline-block self-start transition-colors duration-300 ${isDarkMode ? 'bg-slate-700 group-hover:bg-sky-500/20' : 'bg-slate-100 group-hover:bg-sky-100'}`}>
                                      <IconComponent className={`w-7 h-7 transition-colors duration-300 ${isDarkMode ? 'text-sky-400 group-hover:text-sky-300' : 'text-sky-600 group-hover:text-sky-500'}`} />
                                  </div>
                                  <h3 className={`text-lg font-semibold mb-1.5 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{tool.name}</h3>
                                  <p className={`text-sm flex-grow mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tool.description}</p>
                                  <div className={`mt-auto text-sm font-medium flex items-center transition-colors duration-300 ${isDarkMode ? 'text-sky-500 group-hover:text-sky-400' : 'text-sky-600 group-hover:text-sky-500'}`}>
                                      Use Tool <FiArrowRightCircle className="ml-1.5 w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-0.5"/>
                                  </div>
                              </div>
                            </Link>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </motion.div>
              ) : null 
            ))}
          </AnimatePresence>
          
          {searchTerm && !hasAnyVisibleCategories && (
             <motion.div 
                key="no-results" // Add key for AnimatePresence
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="text-center py-16"
            >
                <FiAlertCircle className={`w-16 h-16 mx-auto mb-6 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <h3 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>No Tools Found</h3>
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    We couldn't find any tools matching "{searchTerm}". Try a different search term.
                </p>
             </motion.div>
          )}
        </main>
        <Footer isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

export default AllToolsPage;