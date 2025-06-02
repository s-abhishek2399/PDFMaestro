// src/custom_hooks/useDarkMode.js
import { useState, useEffect } from 'react';

const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      // Check if OS prefers dark mode
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return savedMode !== null ? JSON.parse(savedMode) : prefersDark;
    }
    return false; // Default to light mode if window is not defined (SSR)
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return [isDarkMode, toggleDarkMode];
};

export default useDarkMode;