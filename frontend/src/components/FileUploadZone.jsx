// src/components/FileUploadZone.js
import React, { useState, useRef, useCallback } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import { motion } from 'framer-motion';

const FileUploadZone = ({ 
  onFilesSelected, 
  acceptedTypes, 
  multiple, 
  isDarkMode, 
  children, 
  disabled,
  maxFiles,
  maxFileSizeMB // Max file size in MB per file
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef(null);

  const validateFiles = (files) => {
    const validFiles = [];
    let errorMsg = '';

    if (maxFiles && files.length > maxFiles) {
        errorMsg = `You can select a maximum of ${maxFiles} files.`;
        setErrorMessage(errorMsg);
        return { validFiles: [], error: errorMsg };
    }

    for (const file of files) {
      const fileType = file.type;
      const fileSizeMB = file.size / (1024 * 1024);

      if (acceptedTypes && !acceptedTypes.split(',').map(t => t.trim()).includes(fileType)) {
        errorMsg = `Invalid file type: ${file.name}. Please upload ${acceptedTypes}.`;
        // Allow continuing with other files, or stop all? For now, stop if one is bad.
        // To allow, push valid files and set error for the bad one.
        // For strictness, if one is bad, reject all.
        setErrorMessage(errorMsg);
        return { validFiles: [], error: errorMsg }; // Reject batch if one is invalid
      }
      if (maxFileSizeMB && fileSizeMB > maxFileSizeMB) {
        errorMsg = `File ${file.name} is too large (${fileSizeMB.toFixed(2)}MB). Maximum size is ${maxFileSizeMB}MB.`;
        setErrorMessage(errorMsg);
        return { validFiles: [], error: errorMsg }; // Reject batch if one is too large
      }
      validFiles.push(file);
    }
    setErrorMessage(''); // Clear previous error if all files are valid
    return { validFiles, error: null };
  };


  const handleFileProcessing = (selectedFilesArray) => {
    if (disabled) return;
    const { validFiles, error } = validateFiles(selectedFilesArray);
    if (error) {
        // Error is already set by validateFiles
        return;
    }
    if (validFiles.length > 0) {
        onFilesSelected(validFiles);
    }
  };

  const handleFileChange = (event) => {
    handleFileProcessing(Array.from(event.target.files));
    if (inputRef.current) {
        inputRef.current.value = null; // Reset input to allow selecting the same file again
    }
  };

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;
    handleFileProcessing(Array.from(event.dataTransfer.files));
  }, [disabled, acceptedTypes, multiple, onFilesSelected, maxFiles, maxFileSizeMB]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  }, []);
  
  const openFileDialog = () => {
    if (inputRef.current && !disabled) {
      setErrorMessage(''); // Clear error when user tries to select new files
      inputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <motion.div
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`p-6 sm:p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-200 ease-in-out
                    ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700' 
                               : (isDarkMode ? 'hover:border-sky-500 hover:bg-slate-700/30' : 'hover:border-sky-600 hover:bg-sky-50/50')}
                    ${isDragOver ? (isDarkMode ? 'border-sky-400 bg-slate-700/50' : 'border-sky-600 bg-sky-50/50') 
                                 : (isDarkMode ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-slate-100')}
                   `}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        <input
          type="file"
          ref={inputRef}
          multiple={multiple}
          accept={acceptedTypes}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
        <div className={`flex flex-col items-center justify-center pointer-events-none ${disabled ? 'opacity-70' : ''}`}>
          {children || (
            <>
              <FiUploadCloud className={`w-12 h-12 mb-4 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`} />
              <p className={`text-lg font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                Drag & drop files here
              </p>
              <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>
                or click to select files
              </p>
              {acceptedTypes && <p className={`mt-2 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Supports: {acceptedTypes}</p>}
              {maxFileSizeMB && <p className={`mt-1 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Max size: {maxFileSizeMB}MB per file</p>}
              {maxFiles && <p className={`mt-1 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Max files: {maxFiles}</p>}
            </>
          )}
        </div>
      </motion.div>
      {errorMessage && (
          <motion.p 
            initial={{opacity: 0, y: 10}}
            animate={{opacity:1, y: 0}}
            className="mt-3 text-sm text-red-500 dark:text-red-400 text-center"
          >
            {errorMessage}
          </motion.p>
      )}
    </div>
  );
};

export default FileUploadZone;