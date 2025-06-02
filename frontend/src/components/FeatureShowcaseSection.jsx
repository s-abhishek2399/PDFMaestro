// src/components/FeatureShowcaseSection.js
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toolCategoriesData, toolSpecificIcons } from '../data/toolsData'; // Adjusted path if necessary

const FeatureShowcaseSection = ({ isDarkMode }) => {
  const [activeCategory, setActiveCategory] = useState(toolCategoriesData[0].name);

  const activeCategoryData = useMemo(() => {
    return toolCategoriesData.find(cat => cat.name === activeCategory);
  }, [activeCategory]);

  // Filter out tools that are aliases for display in the showcase
  const displayedTools = useMemo(() => {
    if (!activeCategoryData || activeCategoryData.disabled) return [];
    return activeCategoryData.tools.filter(tool => !tool.aliasFor);
  }, [activeCategoryData]);

  return (
    <section id="all-tools" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
            One Platform, <span className={`${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>Endless PDF Possibilities</span>
          </h2>
          <p className={`mt-4 text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Discover our comprehensive suite of tools designed to handle any PDF task you throw at us.
          </p>
        </div>

        {/* Tab-like navigation for categories */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
          {toolCategoriesData.map((category) => (
            <button
              key={category.name}
              onClick={() => !category.disabled && setActiveCategory(category.name)}
              disabled={category.disabled}
              className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 
                          ${activeCategory === category.name && !category.disabled
                            ? (isDarkMode ? 'bg-sky-500 text-white focus:ring-sky-400 focus:ring-offset-slate-900' : 'bg-sky-600 text-white focus:ring-sky-500 focus:ring-offset-slate-50') 
                            : (isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-sky-300 focus:ring-sky-600 focus:ring-offset-slate-900' : 'bg-slate-200 text-slate-700 hover:bg-slate-300 hover:text-sky-600 focus:ring-sky-500 focus:ring-offset-slate-50')}
                          ${category.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
            >
              <category.icon className="inline w-5 h-5 mr-2 -mt-0.5" aria-hidden="true" />
              {category.name}
            </button>
          ))}
        </div>

        {/* Display tools for active category */}
        <AnimatePresence mode="wait">
          {activeCategoryData && !activeCategoryData.disabled && displayedTools.length > 0 ? (
            <motion.div
              key={activeCategory} // Keyed by category name for animation
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
            >
              {displayedTools.map((tool) => {
                const IconComponent = toolSpecificIcons[tool.name] || toolSpecificIcons.default;
                const toolPath = tool.comingSoon ? '#' : `/${tool.slug}`;
                const isToolDisabled = tool.comingSoon;

                return (
                  <motion.a // Using motion.a for individual item animation, though parent already animates
                    key={tool.name}
                    href={toolPath}
                    onClick={(e) => isToolDisabled && e.preventDefault()}
                    className={`relative flex flex-col items-center justify-center text-center p-4 rounded-lg transition-all duration-200 h-28 sm:h-32 group
                                ${isDarkMode 
                                    ? 'bg-slate-800 border border-slate-700' 
                                    : 'bg-slate-50 border border-slate-200'}
                                ${isToolDisabled 
                                    ? 'opacity-60 cursor-default' 
                                    : (isDarkMode ? 'hover:bg-slate-700 hover:border-sky-600' : 'hover:bg-slate-100 hover:border-sky-400')}
                              `}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <IconComponent className={`w-7 h-7 mb-2 ${isToolDisabled ? (isDarkMode ? 'text-slate-500' : 'text-slate-400') : (isDarkMode ? 'text-sky-400' : 'text-sky-600')}`} />
                    <span className={`text-xs sm:text-sm font-medium ${isToolDisabled ? (isDarkMode ? 'text-slate-400' : 'text-slate-500') : (isDarkMode ? 'text-slate-300' : 'text-slate-700')}`}>
                        {tool.name}
                    </span>
                    {isToolDisabled && (
                      <span className={`absolute top-1.5 right-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full
                                        ${isDarkMode ? 'bg-yellow-600/30 text-yellow-400 border border-yellow-500/30' : 'bg-yellow-100 text-yellow-600 border border-yellow-200/80'}`}>
                        SOON
                      </span>
                    )}
                  </motion.a>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key={`${activeCategory}-empty`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0}}
              className="text-center py-8"
            >
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {activeCategoryData?.disabled && activeCategoryData.comingSoonMessage 
                        ? activeCategoryData.comingSoonMessage
                        : activeCategoryData?.tools.filter(t => !t.aliasFor && !t.comingSoon).length === 0 && activeCategoryData?.tools.filter(t => !t.aliasFor).length > 0
                        ? `All tools in the "${activeCategory}" category are coming soon.`
                        : `Tools in the "${activeCategory}" category will be available soon or are currently being updated.`
                    }
                </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default FeatureShowcaseSection;