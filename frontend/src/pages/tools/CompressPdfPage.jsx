// src/pages/tools/CompressPdfPage.js
import React, { useState, useCallback, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FileUploadZone from '../../components/FileUploadZone';
import useDarkMode from '../../custom_hooks/useDarkMode';
import usePdfTool from '../../custom_hooks/usePdfTool';
import { FiFileText, FiTrash2, FiUploadCloud, FiDownload, FiRotateCcw, FiAlertTriangle, FiZap } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const compressionLevels = [
  { id: 'recommended', name: 'Recommended', description: 'Good balance between size and quality.', value: 'medium' },
  { id: 'high', name: 'High Compression', description: 'Smallest file size, may reduce quality.', value: 'high' },
  { id: 'low', name: 'Less Compression', description: 'Better quality, larger file size.', value: 'low' },
];

const CompressPdfPage = () => {
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [selectedFile, setSelectedFile] = useState(null); // Stores the File object
  const [compressionOption, setCompressionOption] = useState(compressionLevels[0].value); // Default to 'recommended'
  
  const { 
    processFiles, 
    isLoading, 
    error: toolError, 
    progress, 
    processedFileUrl, 
    processedFileName, 
    successMessage, // Will hold original and new size from backend
    clearError, 
    resetTool: resetPdfToolHook 
  } = usePdfTool('compress'); // Operation name is 'compress'
  
  const [localError, setLocalError] = useState('');
  const [originalSize, setOriginalSize] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);


  useEffect(() => {
    if (!toolError) setLocalError('');
    else setLocalError(toolError.message);
  }, [toolError]);

  useEffect(() => {
    // Parse sizes from successMessage if available (backend will send this)
    if (successMessage && successMessage.includes('Original size:')) {
        try {
            const origMatch = successMessage.match(/Original size: ([\d.]+\s\w+)/);
            const compMatch = successMessage.match(/New size: ([\d.]+\s\w+)/);
            if (origMatch && origMatch[1]) setOriginalSize(origMatch[1]);
            if (compMatch && compMatch[1]) setCompressedSize(compMatch[1]);
        } catch (e) {
            console.error("Error parsing sizes from success message:", e);
        }
    }
  }, [successMessage]);


  const handleFileSelected = useCallback((files) => { // Expects an array from FileUploadZone
    clearError();
    setLocalError('');
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setOriginalSize(formatFileSize(file.size)); // Show original size immediately
        setCompressedSize(null); // Reset compressed size display
      } else {
        setLocalError("Invalid file type. Please select a PDF file.");
        setSelectedFile(null);
        setOriginalSize(null);
      }
    } else {
      setSelectedFile(null);
      setOriginalSize(null);
    }
  }, [clearError]);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setOriginalSize(null);
    setCompressedSize(null);
    setLocalError('');
    clearError(); // Clear any backend errors too
    // Do not reset the entire tool hook here, only if they click "Compress Another"
  }, [clearError]);

  const handleCompress = async () => {
    clearError();
    setLocalError('');
    if (!selectedFile) {
      setLocalError("Please select a PDF file to compress.");
      return;
    }
    // `processFiles` from the hook expects an array of files
    await processFiles([selectedFile], { compressionLevel: compressionOption });
  };
  
  const resetAll = () => {
    setSelectedFile(null);
    resetPdfToolHook();
    setLocalError('');
    clearError();
    setOriginalSize(null);
    setCompressedSize(null);
    setCompressionOption(compressionLevels[0].value); // Reset to default option
  };

  const currentError = localError || (toolError ? toolError.message : '');

  return (
    <div className={`${isDarkMode ? 'dark' : ''} font-sans`}>
      <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen transition-colors duration-300 flex flex-col">
        <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <motion.div 
            initial={{ opacity: 0, y:20 }}
            animate={{ opacity: 1, y:0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8 sm:mb-12">
              <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                Compress PDF File
              </h1>
              <p className={`mt-3 sm:mt-4 text-base sm:text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Reduce the file size of your PDF documents quickly and easily while trying to maintain the best quality.
              </p>
            </div>

            <AnimatePresence mode="wait">
            {!processedFileUrl && !isLoading ? (
              <motion.div
                key="upload-options-area"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-xl mx-auto" // Adjusted max-width
              >
                {!selectedFile ? (
                  <FileUploadZone
                      onFilesSelected={handleFileSelected}
                      acceptedTypes="application/pdf"
                      multiple={false} // Only one file
                      isDarkMode={isDarkMode}
                      disabled={isLoading}
                      maxFileSizeMB={100} // Example: Max 100MB for compression
                  >
                      <FiUploadCloud className={`w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`} />
                      <p className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                          Drag & Drop PDF Here
                      </p>
                      <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>
                          or click to select a file
                      </p>
                      <p className={`mt-2 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Supports: .pdf files only. Max 100MB.</p>
                  </FileUploadZone>
                ) : (
                  <motion.div 
                    initial={{opacity:0, y:10}} animate={{opacity:1,y:0}}
                    className={`p-4 sm:p-6 rounded-xl shadow-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                  >
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center overflow-hidden">
                            <FiFileText className={`w-8 h-8 mr-3 flex-shrink-0 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`} />
                            <div>
                                <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`} title={selectedFile.name}>
                                    {selectedFile.name}
                                </p>
                                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Size: {originalSize || formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={removeFile}
                            className={`p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 ${isDarkMode ? 'text-slate-400 hover:text-red-400 hover:bg-slate-600 focus:ring-red-500' : 'text-slate-500 hover:text-red-500 hover:bg-slate-300 focus:ring-red-600'}`}
                            aria-label="Remove file"
                        >
                            <FiTrash2 className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Compression Options */}
                    <div className="mt-4 mb-6">
                        <h3 className={`text-md font-semibold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                            Compression Level:
                        </h3>
                        <div className="space-y-3">
                            {compressionLevels.map((level) => (
                                <label
                                    key={level.id}
                                    htmlFor={level.id}
                                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all
                                                ${isDarkMode ? 'border-slate-600 hover:border-sky-500' : 'border-slate-300 hover:border-sky-600'}
                                                ${compressionOption === level.value ? (isDarkMode ? 'bg-sky-600/30 border-sky-500 ring-2 ring-sky-500' : 'bg-sky-100/70 border-sky-600 ring-2 ring-sky-600') : (isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50/50')}
                                            `}
                                >
                                    <input
                                        type="radio"
                                        id={level.id}
                                        name="compressionLevel"
                                        value={level.value}
                                        checked={compressionOption === level.value}
                                        onChange={(e) => setCompressionOption(e.target.value)}
                                        className="form-radio h-4 w-4 text-sky-600 dark:text-sky-500 border-slate-400 dark:border-slate-500 focus:ring-sky-500 dark:focus:ring-sky-400 mr-3"
                                    />
                                    <div>
                                        <span className={`font-medium text-sm ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{level.name}</span>
                                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{level.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                  </motion.div>
                )}

                {(selectedFile || currentError) && (
                   <div className="mt-6 text-center">
                      {currentError && (
                          <motion.p 
                              initial={{opacity: 0, y: 10}} animate={{opacity:1, y: 0}}
                              className={`mb-4 p-3 rounded-md text-sm flex items-center justify-center ${isDarkMode ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-700 border border-red-200'}`}
                          >
                              <FiAlertTriangle className="w-5 h-5 mr-2"/> {currentError}
                          </motion.p>
                      )}
                      {selectedFile && (
                          <button
                          onClick={handleCompress}
                          className={`px-8 py-3.5 text-base sm:text-lg font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out
                                      focus:outline-none focus:ring-4 transform hover:scale-105 active:scale-95
                                      ${isDarkMode ? 'bg-sky-500 hover:bg-sky-400 text-white focus:ring-sky-500/50' : 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-600/50'}
                                      `}
                          >
                            <FiZap className="inline w-5 h-5 mr-2 -mt-0.5" /> Compress PDF
                          </button>
                      )}
                   </div>
                )}
              </motion.div>
            ) : isLoading ? (
              <motion.div 
                  key="loading-compress"
                  initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                  className="mt-8 text-center max-w-md mx-auto"
              >
                <div className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>
                  Compressing your PDF...
                </div>
                <div className={`w-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded-full h-2.5`}>
                  <motion.div
                    className={`h-2.5 rounded-full ${isDarkMode ? 'bg-sky-500' : 'bg-sky-600'}`}
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease:"linear" }}
                  />
                </div>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{progress}%</p>
                {progress === 100 && !toolError && <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Finalizing...</p>}
              </motion.div>
            ) : processedFileUrl ? (
              <motion.div
                key="results-compress-area"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto text-center p-6 sm:p-8 rounded-xl shadow-xl 
                           border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}"
              >
                <FiDownload className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                  Compression Successful!
                </h2>
                {originalSize && compressedSize && (
                    <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        Original size: {originalSize}
                    </p>
                )}
                {compressedSize && (
                     <p className={`text-sm mb-4 font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        New size: {compressedSize}
                    </p>
                )}
                {!compressedSize && successMessage &&  // Fallback if specific sizes not parsed
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{successMessage}</p>
                }
                <a
                  href={processedFileUrl}
                  download={processedFileName}
                  className={`inline-flex items-center justify-center px-8 py-3.5 text-base sm:text-lg font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out
                              focus:outline-none focus:ring-4
                              ${isDarkMode ? 'bg-green-500 hover:bg-green-400 text-white focus:ring-green-500/50' : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-600/50'}
                              transform hover:scale-105 active:scale-95
                              `}
                >
                  <FiDownload className="mr-2 w-5 h-5" /> Download Compressed PDF
                </a>
                <button
                  onClick={resetAll}
                  className={`mt-4 flex items-center justify-center w-full px-6 py-3 text-sm font-medium rounded-md transition-colors
                              ${isDarkMode ? 'text-sky-400 hover:bg-slate-700 focus:bg-slate-700' : 'text-sky-600 hover:bg-slate-100 focus:bg-slate-100'}
                              focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-sky-500' : 'focus:ring-sky-600'}`}
                >
                  <FiRotateCcw className="mr-2 w-4 h-4" /> Compress Another PDF
                </button>
              </motion.div>
            ) : null}
            </AnimatePresence>
          </motion.div>
        </main>
        <Footer isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

export default CompressPdfPage;