// src/pages/tools/SplitPdfPage.js
import React, { useState, useCallback, useEffect } from 'react';
import Navbar from '../../components/Navbar'; 
import Footer from '../../components/Footer';   
import FileUploadZone from '../../components/FileUploadZone'; 
import useDarkMode from '../../custom_hooks/useDarkMode';
import usePdfTool from '../../custom_hooks/usePdfTool'; 
import { 
    FiFileText, FiTrash2, FiUploadCloud, FiDownload, 
    FiRotateCcw, FiAlertTriangle, FiScissors 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const splitModes = [
  { id: 'extract', name: 'Extract Pages', description: 'Select pages or ranges to create a new PDF.' },
  { id: 'split_all', name: 'Split All Pages', description: 'Create a separate PDF for each page (generates a ZIP).' },
];

const SplitPdfPage = () => {
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [selectedFile, setSelectedFile] = useState(null);
  const [splitMode, setSplitMode] = useState(splitModes[0].id);
  const [pageRanges, setPageRanges] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [pageRangeError, setPageRangeError] = useState('');

  const { 
    processFiles, isLoading, error: toolError, progress, 
    processedFileUrl, processedFileName, successMessage,
    clearError, resetTool: resetPdfToolHook 
  } = usePdfTool('split');
  
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!toolError) setLocalError('');
    else setLocalError(toolError.message);
  }, [toolError]);

  const validatePageRanges = (ranges, maxPages) => {
    if (!ranges.trim()) {
      setPageRangeError('Please enter page numbers or ranges.');
      return false;
    }
    const rangeRegex = /^\s*(\d+\s*-\s*\d+|\d+)(\s*,\s*(\d+\s*-\s*\d+|\d+))*\s*$/;
    if (!rangeRegex.test(ranges)) {
      setPageRangeError('Invalid format. Use numbers or ranges (e.g., 1-3, 5, 8).');
      return false;
    }
    const parts = ranges.split(',');
    for (const part of parts) {
      const trimmedPart = part.trim();
      if (trimmedPart.includes('-')) {
        const [startStr, endStr] = trimmedPart.split('-');
        const start = parseInt(startStr.trim(), 10);
        const end = parseInt(endStr.trim(), 10);
        if (isNaN(start) || isNaN(end) || start < 1 || end < 1 || start > end || end > maxPages) {
          setPageRangeError(`Invalid range: ${trimmedPart}. Max page is ${maxPages}.`);
          return false;
        }
      } else {
        const page = parseInt(trimmedPart, 10);
        if (isNaN(page) || page < 1 || page > maxPages) {
          setPageRangeError(`Invalid page number: ${trimmedPart}. Max page is ${maxPages}.`);
          return false;
        }
      }
    }
    setPageRangeError('');
    return true;
  };

  const handleFileSelected = useCallback(async (files) => {
    clearError();
    setLocalError('');
    setPageRanges('');
    setTotalPages(0);
    setPageRangeError('');
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        setLocalError("Invalid file type. Please select a PDF file.");
        setSelectedFile(null);
      }
    } else {
      setSelectedFile(null);
    }
  }, [clearError]);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setPageRanges('');
    setTotalPages(0);
    setLocalError('');
    setPageRangeError('');
    clearError();
  }, [clearError]);

  const handleSplit = async () => {
    clearError();
    setLocalError('');
    if (!selectedFile) {
      setLocalError("Please select a PDF file to split.");
      return;
    }
    if (splitMode === 'extract' && !pageRanges.trim()) {
        setPageRangeError("Please specify pages or ranges to extract.");
        return;
    }
    if (splitMode === 'extract' && totalPages > 0 && !validatePageRanges(pageRanges, totalPages)) {
        return;
    }
    const options = { splitMode: splitMode };
    if (splitMode === 'extract') {
      options.pageRanges = pageRanges;
    }
    await processFiles([selectedFile], options);
  };
  
  const resetAll = () => {
    setSelectedFile(null);
    resetPdfToolHook();
    setLocalError('');
    clearError();
    setPageRanges('');
    setTotalPages(0);
    setPageRangeError('');
    setSplitMode(splitModes[0].id);
  };

  const currentError = localError || pageRangeError || (toolError ? toolError.message : '');
  
  useEffect(() => {
    const message = successMessage || (toolError ? toolError.message : null); // Check toolError.message
    let newTotalPages = 0;

    if (toolError && toolError.totalPages) { // Prioritize totalPages from hook if available on error
        newTotalPages = toolError.totalPages;
    } else if (successMessage && successMessage.totalPages) { // Prioritize from hook on success
        newTotalPages = successMessage.totalPages;
    } else if (message) { // Fallback to parsing message
        const pagesMatch = message.match(/PDF has (\d+) pages/i) || message.match(/Total pages: (\d+)/i);
        if (pagesMatch && pagesMatch[1]) {
            newTotalPages = parseInt(pagesMatch[1], 10);
        }
    }
    
    if (newTotalPages > 0) {
        setTotalPages(newTotalPages);
    }
  }, [successMessage, toolError]);


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
                Split PDF File
              </h1>
              <p className={`mt-3 sm:mt-4 text-base sm:text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Extract specific pages, page ranges, or split every page into a separate PDF.
              </p>
            </div>

            <AnimatePresence mode="wait">
            {!processedFileUrl && !isLoading ? (
              <motion.div
                key="upload-split-options-area"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-xl mx-auto"
              >
                {!selectedFile ? (
                  <FileUploadZone
                      onFilesSelected={handleFileSelected}
                      acceptedTypes="application/pdf"
                      multiple={false}
                      isDarkMode={isDarkMode}
                      disabled={isLoading}
                      maxFileSizeMB={100}
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
                                    Size: {formatFileSize(selectedFile.size)}
                                    {totalPages > 0 && ` (${totalPages} pages)`}
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

                    {/* Split Mode Options */}
                    <div className="mt-4 mb-6">
                        <h3 className={`text-md font-semibold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                            Split Mode:
                        </h3>
                        <div className="space-y-3">
                            {splitModes.map((mode) => (
                                <label
                                    key={mode.id} htmlFor={mode.id}
                                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all
                                                ${isDarkMode ? 'border-slate-600 hover:border-sky-500' : 'border-slate-300 hover:border-sky-600'}
                                                ${splitMode === mode.id ? (isDarkMode ? 'bg-sky-600/30 border-sky-500 ring-2 ring-sky-500' : 'bg-sky-100/70 border-sky-600 ring-2 ring-sky-600') : (isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50/50')}
                                            `}
                                >
                                    <input type="radio" id={mode.id} name="splitMode" value={mode.id} checked={splitMode === mode.id}
                                        onChange={(e) => { setSplitMode(e.target.value); setPageRangeError(''); setPageRanges('');}}
                                        className="form-radio h-4 w-4 text-sky-600 dark:text-sky-500 border-slate-400 dark:border-slate-500 focus:ring-sky-500 dark:focus:ring-sky-400 mr-3"
                                    />
                                    <div>
                                        <span className={`font-medium text-sm ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{mode.name}</span>
                                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{mode.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {splitMode === 'extract' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 mb-6">
                            <label htmlFor="pageRanges" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                Pages or Ranges to Extract:
                                {totalPages > 0 && <span className="text-xs text-slate-400"> (Total: {totalPages} pages)</span>}
                            </label>
                            <input
                                type="text" id="pageRanges" name="pageRanges" value={pageRanges}
                                onChange={(e) => {
                                    setPageRanges(e.target.value);
                                    if(totalPages > 0) validatePageRanges(e.target.value, totalPages); else setPageRangeError('');
                                }}
                                placeholder="e.g., 1-3, 5, 8-10"
                                className={`w-full px-3 py-2 text-sm rounded-md shadow-sm transition-colors duration-150
                                            border ${pageRangeError ? 'border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500' : (isDarkMode ? 'border-slate-600 bg-slate-700 focus:ring-sky-500 focus:border-sky-500' : 'border-slate-300 bg-white focus:ring-sky-600 focus:border-sky-600')}
                                            ${isDarkMode ? 'text-slate-100 placeholder-slate-400' : 'text-slate-900 placeholder-slate-500'}`}
                            />
                             <p className={`mt-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Use commas to separate pages or ranges (e.g., 1, 3-5, 7).
                            </p>
                        </motion.div>
                    )}
                  </motion.div>
                )}

                {(selectedFile || currentError) && (
                   <div className="mt-6 text-center">
                      {currentError && ( 
                        <motion.div 
                            initial={{opacity: 0, y: -10}} animate={{opacity:1, y: 0}}
                            className={`mb-4 p-3 rounded-md text-sm flex items-center justify-center ${isDarkMode ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-700 border border-red-200'}`}
                        >
                            <FiAlertTriangle className="w-5 h-5 mr-2"/> {currentError}
                        </motion.div>
                      )}
                      {selectedFile && (
                          <button 
                            onClick={handleSplit} 
                            className={`px-8 py-3.5 text-base sm:text-lg font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out
                                        focus:outline-none focus:ring-4 transform hover:scale-105 active:scale-95
                                        ${isDarkMode ? 'bg-sky-500 hover:bg-sky-400 text-white focus:ring-sky-500/50' : 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-600/50'}`}
                          >
                            <FiScissors className="inline w-5 h-5 mr-2 -mt-0.5" /> Split PDF
                          </button>
                      )}
                   </div>
                )}
              </motion.div>
            ) : isLoading ? ( 
                <motion.div 
                    key="loading-split" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                    className="mt-8 text-center max-w-md mx-auto"
                >
                    <div className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>
                        Splitting your PDF...
                    </div>
                    <div className={`w-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded-full h-2.5`}>
                        <motion.div
                            className={`h-2.5 rounded-full ${isDarkMode ? 'bg-sky-500' : 'bg-sky-600'}`}
                            initial={{ width: '0%' }} animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3, ease:"linear" }}
                        />
                    </div>
                    <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{progress}%</p>
                    {progress === 100 && !toolError && <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Finalizing...</p>}
                </motion.div>
            ) : processedFileUrl ? ( 
                <motion.div
                    key="results-split-area" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="max-w-md mx-auto text-center p-6 sm:p-8 rounded-xl shadow-xl 
                               border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}"
                >
                    <FiDownload className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                    <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        Split Successful!
                    </h2>
                    <p className={`mb-4 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {successMessage?.message || (processedFileName.endsWith('.zip') ? "Your PDF has been split into multiple files, bundled in a ZIP." : "Your selected pages have been extracted.")}
                        {totalPages > 0 && ` (Original PDF had ${totalPages} pages)`}
                    </p>
                    <a 
                        href={processedFileUrl} download={processedFileName} 
                        className={`inline-flex items-center justify-center px-8 py-3.5 text-base sm:text-lg font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out
                                    focus:outline-none focus:ring-4
                                    ${isDarkMode ? 'bg-green-500 hover:bg-green-400 text-white focus:ring-green-500/50' : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-600/50'}
                                    transform hover:scale-105 active:scale-95`}
                    >
                        <FiDownload className="mr-2 w-5 h-5" /> Download {processedFileName.endsWith('.zip') ? 'ZIP File' : 'Split PDF'}
                    </a>
                    <button 
                        onClick={resetAll} 
                        className={`mt-4 flex items-center justify-center w-full px-6 py-3 text-sm font-medium rounded-md transition-colors
                                    ${isDarkMode ? 'text-sky-400 hover:bg-slate-700 focus:bg-slate-700' : 'text-sky-600 hover:bg-slate-100 focus:bg-slate-100'}
                                    focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-sky-500' : 'focus:ring-sky-600'}`}
                    >
                        <FiRotateCcw className="mr-2 w-4 h-4" /> Split Another PDF
                    </button>
                </motion.div>
            ) : null}
            </AnimatePresence>
          </motion.div>
        </main>
        <Footer isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      </div>
    </div>
  );
};

export default SplitPdfPage;