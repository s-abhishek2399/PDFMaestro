// src/pages/tools/PdfToTextPage.jsx
import React, { useState, useCallback, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FileUploadZone from '../../components/FileUploadZone';
import useDarkMode from '../../custom_hooks/useDarkMode';
import usePdfTool from '../../custom_hooks/usePdfTool';
import { FaFilePdf } from 'react-icons/fa';
import { FiFileText } from 'react-icons/fi'; // For the output concept
import { 
    FiUploadCloud, FiDownload, FiAlertTriangle, 
    FiRotateCcw, FiCheckCircle, FiTrash2
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'; /* ... (same as other files) ... */
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const PdfToTextPage = () => {
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [selectedFile, setSelectedFile] = useState(null);
  const [clientSideError, setClientSideError] = useState('');
  const [totalPages, setTotalPages] = useState(0); // For displaying PDF page count

  const { 
    processFiles, isLoading, error: toolError, progress, 
    processedFileUrl, processedFileName, successMessage,
    clearError, resetTool: resetPdfToolHook 
  } = usePdfTool('pdf_to_text');

  const handleFileSelected = useCallback((files) => {
    clearError(); setClientSideError(''); setTotalPages(0);
    if (files && files.length > 0) setSelectedFile(files[0]);
    else setSelectedFile(null);
  }, [clearError]);

  const removeFile = useCallback(() => {
    setSelectedFile(null); resetPdfToolHook(); clearError(); setClientSideError(''); setTotalPages(0);
  }, [clearError, resetPdfToolHook]);

  const handleConvert = async () => {
    clearError(); setClientSideError('');
    if (!selectedFile) {
      setClientSideError("Please select a PDF file to extract text from."); return;
    }
    await processFiles([selectedFile]);
  };
  
  const resetAll = () => {
    setSelectedFile(null); resetPdfToolHook(); clearError(); setClientSideError(''); setTotalPages(0);
  };
  
  useEffect(() => {
    let pages = 0;
    if (successMessage && successMessage.totalPages) {
        pages = parseInt(successMessage.totalPages, 10);
    } else if (toolError && toolError.totalPages) {
        pages = parseInt(toolError.totalPages, 10);
    }
    if (pages > 0 && totalPages !== pages) {
        setTotalPages(pages);
    }
  }, [successMessage, toolError, totalPages]);


  const displayErrorMessage = clientSideError || (toolError ? toolError.message : '');
  const displaySuccessMessage = successMessage ? successMessage.message : "Text has been extracted from your PDF.";

  return (
    <div className={`${isDarkMode ? 'dark' : ''} font-sans`}>
      <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen transition-colors duration-300 flex flex-col">
        <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <motion.div initial={{ opacity: 0, y:20 }} animate={{ opacity: 1, y:0 }} transition={{ duration: 0.5 }}>
            <div className="text-center mb-8 sm:mb-12">
              <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                PDF to Text Extractor
              </h1>
              <p className={`mt-3 sm:mt-4 text-base sm:text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Extract all text content from your PDF document into a plain text (.txt) file.
              </p>
            </div>
            <AnimatePresence mode="wait">
            {!processedFileUrl && !isLoading ? (
              <motion.div key="upload-pdf2text-area" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-xl mx-auto">
                {!selectedFile ? (
                  <FileUploadZone
                      onFilesSelected={handleFileSelected} acceptedTypes="application/pdf"
                      multiple={false} isDarkMode={isDarkMode} disabled={isLoading} maxFileSizeMB={50}>
                      <FaFilePdf className={`w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`} />
                      <p className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Drag & Drop PDF File Here</p>
                      <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>or click to select a file</p>
                      <p className={`mt-2 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Max 50MB.</p>
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
                  </motion.div>
                )}
                {displayErrorMessage && ( <div className="mt-6 text-center"> <motion.div initial={{opacity: 0,y: -10}} animate={{opacity:1,y: 0}} className={`mb-4 p-3 rounded-md text-sm flex items-center justify-center ${isDarkMode ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-700 border border-red-200'}`}><FiAlertTriangle className="w-5 h-5 mr-2"/> {displayErrorMessage}</motion.div></div>)}
                {selectedFile && !isLoading && !processedFileUrl && ( <div className="mt-6 text-center"><button onClick={handleConvert} disabled={isLoading} className={`px-8 py-3.5 text-base sm:text-lg font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 transform hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-sky-500 hover:bg-sky-400 text-white focus:ring-sky-500/50' : 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-600/50'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}><FiFileText className="inline w-5 h-5 mr-2 -mt-0.5" /> Extract Text</button></div>)}
              </motion.div>
            ) : isLoading ? ( <motion.div key="loading-pdf2text" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="mt-8 text-center max-w-md mx-auto"><div className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>Extracting Text...</div><div className={`w-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded-full h-2.5`}><motion.div className={`h-2.5 rounded-full ${isDarkMode ? 'bg-sky-500' : 'bg-sky-600'}`} initial={{ width: '0%' }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3, ease:"linear" }}/></div><p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{progress}%</p>{progress === 100 && !toolError && <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Finalizing...</p>}</motion.div>
            ) : processedFileUrl ? ( <motion.div key="results-pdf2text-area" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto text-center p-6 sm:p-8 rounded-xl shadow-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}"><FiCheckCircle className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} /><h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Extraction Successful!</h2><p className={`mb-4 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{displaySuccessMessage} {totalPages > 0 && `(from ${totalPages} pages)`}</p><a href={processedFileUrl} download={processedFileName} className={`inline-flex items-center justify-center px-8 py-3.5 text-base sm:text-lg font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 ${isDarkMode ? 'bg-green-500 hover:bg-green-400 text-white focus:ring-green-500/50' : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-600/50'} transform hover:scale-105 active:scale-95`}><FiDownload className="mr-2 w-5 h-5" /> Download Text File</a><button onClick={resetAll} className={`mt-4 flex items-center justify-center w-full px-6 py-3 text-sm font-medium rounded-md transition-colors ${isDarkMode ? 'text-sky-400 hover:bg-slate-700 focus:bg-slate-700' : 'text-sky-600 hover:bg-slate-100 focus:bg-slate-100'} focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-sky-500' : 'focus:ring-sky-600'}`}><FiRotateCcw className="mr-2 w-4 h-4" /> Convert Another PDF</button></motion.div>
            ) : null}
            </AnimatePresence>
          </motion.div>
        </main>
        <Footer isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      </div>
    </div>
  );
};
export default PdfToTextPage;