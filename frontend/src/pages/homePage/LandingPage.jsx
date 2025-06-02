import React from 'react';
import Navbar from '../../components/Navbar';
import PopularToolsSection from '../../components/PopularToolsSection';
import HowItWorksSection from '../../components/HowItWorksSection';
import FeatureShowcaseSection from '../../components/FeatureShowcaseSection';
import WhyChooseUsSection from '../../components/WhyChooseUsSection';
// import TestimonialsSection from '../../components/TestimonialsSection';
import FinalCTASection from '../../components/FinalCTASection';
import Footer from '../../components/Footer';
import useDarkMode from '../../custom_hooks/useDarkMode';
import ToolShowcaseGrid from '../../components/ToolShowcaseGrid';
const LandingPage = () => {
  const [isDarkMode, toggleDarkMode] = useDarkMode();

  return (
    <div className={`${isDarkMode ? 'dark' : ''} font-sans`}> {/* Ensure dark class is applied to root for Tailwind */}
      <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen transition-colors duration-300">
        <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <PopularToolsSection isDarkMode={isDarkMode} />
        <ToolShowcaseGrid isDarkMode={isDarkMode} />
        <HowItWorksSection isDarkMode={isDarkMode} />
        <FeatureShowcaseSection isDarkMode={isDarkMode} />
        <WhyChooseUsSection isDarkMode={isDarkMode} />
        {/* <TestimonialsSection isDarkMode={isDarkMode} /> */}
        <FinalCTASection isDarkMode={isDarkMode} />
        <Footer isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

export default LandingPage;