// src/pages/tools/PdfToImagePage.jsx
import React, { useState, useCallback, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FileUploadZone from '../../components/FileUploadZone';
import useDarkMode from '../../custom_hooks/useDarkMode';
import usePdfTool from '../../custom_hooks/usePdfTool';
import { FaFilePdf, FaFileImage } from 'react-icons/fa';
import { 
    FiUploadCloud, FiDownload, FiAlertTriangle, 
    FiRotateCcw, FiCheckCircle, FiTrash2, FiSettings // For options
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'; /* ... (same as other files) ... */
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const imageFormats = [
    { id: 'png', name: 'PNG' },
    { id: 'jpeg', name: 'JPEG' },
    // { id: 'tiff', name: 'TIFF' }, // Add if backend supports & you want it
];

const pageSelectionModes = [
    { id: 'all', name: 'Convert All Pages' },
    { id: 'specific', name: 'Convert Specific Pages' },
];

const PdfToImagePage = () => {
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [selectedFile, setSelectedFile] = useState(null);
  const [clientSideError, setClientSideError] = useState('');
  const [imageFormat, setImageFormat] = useState(imageFormats[0].id);
  const [dpi, setDpi] = useState(200);
  const [pageSelectionMode, setPageSelectionMode] = useState(pageSelectionModes[0].id);
  const [pagesToConvert, setPagesToConvert] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [pageRangeError, setPageRangeError] = useState('');


  const { 
    processFiles, isLoading, error: toolError, progress, 
    processedFileUrl, processedFileName, successMessage,
    clearError, resetTool: resetPdfToolHook 
  } = usePdfTool('pdf_to_image');

  const validatePageRanges = (ranges, maxPages) => {
    if (!ranges.trim() && pageSelectionMode === 'specific') {
      setPageRangeError('Please enter page numbers or ranges.'); return false;
    }
    if (!ranges.trim() && pageSelectionMode === 'all') {
        setPageRangeError(''); return true;
    }
    const rangeRegex = /^\s*(\d+\s*-\s*\d+|\d+)(\s*,\s*(\d+\s*-\s*\d+|\d+))*\s*$/;
    if (!rangeRegex.test(ranges)) {
      setPageRangeError('Invalid format. Use e.g., 1-3, 5, 8.'); return false;
    }
    const parts = ranges.split(',');
    for (const part of parts) {
      const trimmedPart = part.trim();
      if (trimmedPart.includes('-')) {
        const [startStr, endStr] = trimmedPart.split('-');
        const start = parseInt(startStr.trim(), 10); const end = parseInt(endStr.trim(), 10);
        if (isNaN(start) || isNaN(end) || start < 1 || end < 1 || start > end || end > maxPages) {
          setPageRangeError(`Invalid range: ${trimmedPart}. Max page is ${maxPages}.`); return false;
        }
      } else {
        const page = parseInt(trimmedPart, 10);
        if (isNaN(page) || page < 1 || page > maxPages) {
          setPageRangeError(`Invalid page: ${trimmedPart}. Max page is ${maxPages}.`); return false;
        }
      }
    }
    setPageRangeError(''); return true;
  };

  const handleFileSelected = useCallback((files) => {
    clearError(); setClientSideError(''); setTotalPages(0); setPagesToConvert(''); setPageRangeError('');
    if (files && files.length > 0) {
        setSelectedFile(files[0]);
        // Attempt to get page count quickly on frontend (optional, backend will also do it)
        // This requires a library like pdf.js or similar, can be complex.
        // For now, we'll rely on backend to report totalPages.
    } else {
        setSelectedFile(null);
    }
  }, [clearError]);

  const removeFile = useCallback(() => {
    setSelectedFile(null); resetPdfToolHook(); clearError(); setClientSideError('');
    setTotalPages(0); setPagesToConvert(''); setPageRangeError('');
  }, [clearError, resetPdfToolHook]);

  const handleConvert = async () => {
    clearError(); setClientSideError('');
    if (!selectedFile) {
      setClientSideError("Please select a PDF file."); return;
    }
    if (pageSelectionMode === 'specific' && !pagesToConvert.trim()) {
        setPageRangeError("Please specify pages or ranges to convert."); return;
    }
    if (pageSelectionMode === 'specific' && totalPages > 0 && !validatePageRanges(pagesToConvert, totalPages)) {
        return;
    }

    const options = {
        imageFormat,
        dpi,
        pageSelectionMode,
        pagesToConvert: pageSelectionMode === 'specific' ? pagesToConvert : '',
    };
    await processFiles([selectedFile], options);
  };
  
  const resetAll = () => {
    setSelectedFile(null); resetPdfToolHook(); clearError(); setClientSideError('');
    setImageFormat(imageFormats[0].id); setDpi(200); setPageSelectionMode(pageSelectionModes[0].id);
    setPagesToConvert(''); setTotalPages(0); setPageRangeError('');
  };

  useEffect(() => {
    // Extract totalPages from successMessage or toolError if backend sends it
    let pages = 0;
    if (successMessage && successMessage.totalPages) {
        pages = parseInt(successMessage.totalPages, 10);
    } else if (toolError && toolError.totalPages) { // Assuming backend might send totalPages even on error
        pages = parseInt(toolError.totalPages, 10);
    }
    if (pages > 0 && totalPages !== pages) {
        setTotalPages(pages);
    }
  }, [successMessage, toolError, totalPages]);

  const currentCombinedError = clientSideError || pageRangeError || (toolError ? toolError.message : '');
  const displaySuccessMessage = successMessage ? successMessage.message : "Your PDF has been converted to images.";

  return (
    <div className={`${isDarkMode ? 'dark' : ''} font-sans`}>
      <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen transition-colors duration-300 flex flex-col">
        <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <motion.div initial={{ opacity: 0, y:20 }} animate={{ opacity: 1, y:0 }} transition={{ duration: 0.5 }}>
            <div className="text-center mb-8 sm:mb-12">
              <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                PDF to Image Converter
              </h1>
              <p className={`mt-3 sm:mt-4 text-base sm:text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Convert pages from your PDF documents into high-quality images (PNG, JPEG).
              </p>
            </div>
            <AnimatePresence mode="wait">
            {!processedFileUrl && !isLoading ? (
              <motion.div key="upload-pdf2image-area" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-xl mx-auto">
                {!selectedFile ? (
                  <FileUploadZone
                      onFilesSelected={handleFileSelected} acceptedTypes="application/pdf"
                      multiple={false} isDarkMode={isDarkMode} disabled={isLoading} maxFileSizeMB={100}>
                      <FaFilePdf className={`w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`} />
                      <p className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Drag & Drop PDF File Here</p>
                      <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>or click to select a file</p>
                      <p className={`mt-2 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Max 100MB.</p>
                  </FileUploadZone>
                ) : (
                  <motion.div initial={{opacity:0, y:10}} animate={{opacity:1,y:0}}
                    className={`p-4 sm:p-6 rounded-xl shadow-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center overflow-hidden">
                            <FaFilePdf className={`w-8 h-8 mr-3 flex-shrink-0 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`} />
                            <div>
                                <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`} title={selectedFile.name}>{selectedFile.name}</p>
                                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                  Size: {formatFileSize(selectedFile.size)}
                                  {totalPages > 0 && ` (${totalPages} pages)`}
                                </p>
                            </div>
                        </div>
                        <button onClick={removeFile} aria-label="Remove file" className={`p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 ${isDarkMode ? 'text-slate-400 hover:text-red-400 hover:bg-slate-600 focus:ring-red-500' : 'text-slate-500 hover:text-red-500 hover:bg-slate-300 focus:ring-red-600'}`}><FiTrash2 className="w-5 h-5" /></button>
                    </div>
                    
                    {/* Options Section */}
                    <div className="mt-4 space-y-4">
                        <div>
                            <label htmlFor="imageFormat" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Image Format:</label>
                            <select id="imageFormat" value={imageFormat} onChange={(e) => setImageFormat(e.target.value)}
                                className={`w-full px-3 py-2 text-sm rounded-md shadow-sm transition-colors duration-150 border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-sky-500 focus:border-sky-500' : 'bg-white border-slate-300 text-slate-900 focus:ring-sky-600 focus:border-sky-600'}`}>
                                {imageFormats.map(format => <option key={format.id} value={format.id}>{format.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="dpi" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Resolution (DPI): {dpi}</label>
                            <input type="range" id="dpi" min="50" max="600" step="50" value={dpi} onChange={(e) => setDpi(parseInt(e.target.value))}
                                   className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-sky-500 dark:accent-sky-400"/>
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Pages to Convert:</label>
                            <div className="flex space-x-3">
                                {pageSelectionModes.map(mode => (
                                    <label key={mode.id} htmlFor={`psm-img-${mode.id}`} className={`flex-1 p-2.5 rounded-lg border cursor-pointer text-center text-xs sm:text-sm transition-all ${isDarkMode ? 'border-slate-600 hover:border-sky-500' : 'border-slate-300 hover:border-sky-600'} ${pageSelectionMode === mode.id ? (isDarkMode ? 'bg-sky-600/30 border-sky-500 ring-1 ring-sky-500' : 'bg-sky-100/70 border-sky-600 ring-1 ring-sky-600') : (isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50/50')}`}>
                                        <input type="radio" id={`psm-img-${mode.id}`} name="pageSelectionModeImg" value={mode.id} checked={pageSelectionMode === mode.id} onChange={(e) => { setPageSelectionMode(e.target.value); setPageRangeError(''); if (e.target.value === 'all') setPagesToConvert(''); }} className="sr-only"/>
                                        {mode.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                        {pageSelectionMode === 'specific' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                                <label htmlFor="pagesToConvertImg" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                    Specify Pages: {totalPages > 0 && <span className="text-xs text-slate-400">(Total: {totalPages} pages)</span>}
                                </label>
                                <input type="text" id="pagesToConvertImg" value={pagesToConvert}
                                    onChange={(e) => { setPagesToConvert(e.target.value); if (totalPages > 0) validatePageRanges(e.target.value, totalPages); else setPageRangeError(''); }}
                                    placeholder="e.g., 1-3, 5, 8-10"
                                    className={`w-full px-3 py-2 text-sm rounded-md shadow-sm transition-colors duration-150 border ${pageRangeError ? 'border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500' : (isDarkMode ? 'border-slate-600 bg-slate-700 text-slate-100 focus:ring-sky-500 focus:border-sky-500' : 'border-slate-300 bg-white text-slate-900 focus:ring-sky-600 focus:border-sky-600')} placeholder-slate-400 dark:placeholder-slate-500`} />
                                {pageRangeError && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{pageRangeError}</p>}
                            </motion.div>
                        )}
                    </div>
                  </motion.div>
                )}
                {currentCombinedError && !clientSideError && !pageRangeError && ( <div className="mt-6 text-center"> <motion.div initial={{opacity: 0,y: -10}} animate={{opacity:1,y: 0}} className={`mb-4 p-3 rounded-md text-sm flex items-center justify-center ${isDarkMode ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-700 border border-red-200'}`}><FiAlertTriangle className="w-5 h-5 mr-2"/> {currentCombinedError}</motion.div></div>)}
                {selectedFile && !isLoading && !processedFileUrl && ( <div className="mt-6 text-center"><button onClick={handleConvert} disabled={isLoading || !!pageRangeError} className={`px-8 py-3.5 text-base sm:text-lg font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 transform hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-sky-500 hover:bg-sky-400 text-white focus:ring-sky-500/50' : 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-600/50'} ${(isLoading || !!pageRangeError) ? 'opacity-50 cursor-not-allowed' : ''}`}><FaFileImage className="inline w-5 h-5 mr-2 -mt-0.5" /> Convert to Image(s)</button></div>)}
              </motion.div>
            ) : isLoading ? ( <motion.div key="loading-pdf2image" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="mt-8 text-center max-w-md mx-auto"><div className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>Converting to Image(s)...</div><div className={`w-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded-full h-2.5`}><motion.div className={`h-2.5 rounded-full ${isDarkMode ? 'bg-sky-500' : 'bg-sky-600'}`} initial={{ width: '0%' }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3, ease:"linear" }}/></div><p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{progress}%</p>{progress === 100 && !toolError && <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Finalizing...</p>}</motion.div>
            ) : processedFileUrl ? ( <motion.div key="results-pdf2image-area" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto text-center p-6 sm:p-8 rounded-xl shadow-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}"><FiCheckCircle className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} /><h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Conversion Successful!</h2><p className={`mb-4 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{displaySuccessMessage}</p><a href={processedFileUrl} download={processedFileName} className={`inline-flex items-center justify-center px-8 py-3.5 text-base sm:text-lg font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 ${isDarkMode ? 'bg-green-500 hover:bg-green-400 text-white focus:ring-green-500/50' : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-600/50'} transform hover:scale-105 active:scale-95`}><FiDownload className="mr-2 w-5 h-5" /> Download Image(s)</a><button onClick={resetAll} className={`mt-4 flex items-center justify-center w-full px-6 py-3 text-sm font-medium rounded-md transition-colors ${isDarkMode ? 'text-sky-400 hover:bg-slate-700 focus:bg-slate-700' : 'text-sky-600 hover:bg-slate-100 focus:bg-slate-100'} focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-sky-500' : 'focus:ring-sky-600'}`}><FiRotateCcw className="mr-2 w-4 h-4" /> Convert Another PDF</button></motion.div>
            ) : null}
            </AnimatePresence>
          </motion.div>
        </main>
        <Footer isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      </div>
    </div>
  );
};
export default PdfToImagePage;