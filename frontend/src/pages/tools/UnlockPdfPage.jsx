// src/pages/tools/UnlockPdfPage.jsx
import React, { useState, useCallback, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FileUploadZone from '../../components/FileUploadZone';
import useDarkMode from '../../custom_hooks/useDarkMode';
import usePdfTool from '../../custom_hooks/usePdfTool';
import { FaFilePdf, FaLockOpen } from 'react-icons/fa';
import { 
    FiUploadCloud, FiDownload, FiAlertTriangle, 
    FiRotateCcw, FiCheckCircle, FiTrash2, FiEye, FiEyeOff
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const UnlockPdfPage = () => {
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [selectedFile, setSelectedFile] = useState(null);
  const [clientSideError, setClientSideError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [totalPages, setTotalPages] = useState(0); // To show page count

  const { 
    processFiles, isLoading, error: toolError, progress, 
    processedFileUrl, processedFileName, successMessage,
    clearError, resetTool: resetPdfToolHook 
  } = usePdfTool('unlock_pdf');

  const handleFileSelected = useCallback((files) => {
    clearError(); setClientSideError(''); setTotalPages(0);
    if (files && files.length > 0) setSelectedFile(files[0]);
    else setSelectedFile(null);
  }, [clearError]);

  const removeFile = useCallback(() => {
    setSelectedFile(null); resetPdfToolHook(); clearError(); setClientSideError(''); setPassword(''); setTotalPages(0);
  }, [clearError, resetPdfToolHook]);

  const handleAction = async () => {
    clearError(); setClientSideError('');
    if (!selectedFile) { setClientSideError("Please select a PDF file."); return; }
    // Password can be empty if PDF has only owner protection without user password
    // if (!password) { setClientSideError("Please enter the password to unlock."); return; } 
    await processFiles([selectedFile], { password });
  };
  
  const resetAll = () => {
    setSelectedFile(null); resetPdfToolHook(); clearError(); setClientSideError(''); setPassword(''); setTotalPages(0);
  };
  
  useEffect(() => {
    let pages = 0;
    const messageSource = successMessage || toolError;
    if (messageSource && typeof messageSource.totalPages !== 'undefined') {
      pages = parseInt(messageSource.totalPages, 10);
    }
    if (!isNaN(pages) && pages >= 0 && totalPages !== pages) {
      setTotalPages(pages);
    }
  }, [successMessage, toolError, totalPages]);

  const displayErrorMessage = clientSideError || (toolError ? toolError.message : '');
  const displaySuccessMessage = successMessage ? successMessage.message : (processedFileUrl ? "PDF unlocked successfully." : "");

  return (
    <div className={`${isDarkMode ? 'dark' : ''} font-sans`}>
      <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen transition-colors duration-300 flex flex-col">
        <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <motion.div initial={{ opacity: 0, y:20 }} animate={{ opacity: 1, y:0 }} transition={{ duration: 0.5 }}>
            <div className="text-center mb-8 sm:mb-12">
              <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                Unlock PDF
              </h1>
              <p className={`mt-3 sm:mt-4 text-base sm:text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Remove password protection from your PDF file (current password may be required).
              </p>
            </div>
            <AnimatePresence mode="wait">
            {!processedFileUrl && !isLoading ? (
              <motion.div key="upload-unlockpdf-area" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-xl mx-auto">
                {!selectedFile ? (
                  <FileUploadZone
                      onFilesSelected={handleFileSelected} acceptedTypes="application/pdf"
                      multiple={false} isDarkMode={isDarkMode} disabled={isLoading} maxFileSizeMB={100}>
                      <FaFilePdf className={`w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`} />
                      <p className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Drag & Drop Protected PDF File Here</p>
                      <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>or click to select a file</p>
                      <p className={`mt-2 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Max 100MB.</p>
                  </FileUploadZone>
                ) : (
                  <motion.div initial={{opacity:0, y:10}} animate={{opacity:1,y:0}}
                    className={`p-4 sm:p-6 rounded-xl shadow-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-6">
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
                    <div>
                        <label htmlFor="password-unlock" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>PDF Password (if any):</label>
                        <div className="mt-1 relative">
                            <input type={showPassword ? "text" : "password"} id="password-unlock" value={password} onChange={(e) => setPassword(e.target.value)}
                                className={`block w-full px-3 py-2 pr-10 sm:text-sm border rounded-md focus:outline-none shadow-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-sky-500 focus:border-sky-500' : 'border-slate-300 text-slate-900 focus:ring-sky-600 focus:border-sky-600'}`}
                                placeholder="Enter current PDF password (if any)" />
                             <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className={`p-1 rounded-full ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`} aria-label={showPassword ? "Hide password" : "Show password"}>
                                    {showPassword ? <FiEyeOff className="h-5 w-5"/> : <FiEye className="h-5 w-5"/>}
                                </button>
                            </div>
                        </div>
                         <p className={`mt-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Enter password if the PDF requires one to open. Leave blank if it opens without a password but has restrictions (owner password).</p>
                    </div>
                  </motion.div>
                )}
                {displayErrorMessage && ( <div className="mt-6 text-center"> <motion.div initial={{opacity:0,y: -10}} animate={{opacity:1,y:0}} className={`mb-4 p-3 rounded-md text-sm flex items-center justify-center ${isDarkMode ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-700 border border-red-200'}`}><FiAlertTriangle className="w-5 h-5 mr-2"/> {displayErrorMessage}</motion.div></div>)}
                {selectedFile && !isLoading && !processedFileUrl && ( <div className="mt-6 text-center"><button onClick={handleAction} disabled={isLoading} className={`px-8 py-3.5 text-base sm:text-lg font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 transform hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-sky-500 hover:bg-sky-400 text-white focus:ring-sky-500/50' : 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-600/50'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}><FaLockOpen className="inline w-4 h-4 mr-2 -mt-0.5" /> Unlock PDF</button></div>)}
              </motion.div>
            ) : isLoading ? ( 
              <motion.div key="loading-unlockpdf" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="mt-8 text-center max-w-md mx-auto">
                <div className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>Unlocking PDF...</div>
                <div className={`w-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded-full h-2.5`}><motion.div className={`h-2.5 rounded-full ${isDarkMode ? 'bg-sky-500' : 'bg-sky-600'}`} initial={{ width: '0%' }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3, ease:"linear" }}/></div>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{progress}%</p>
                {progress === 100 && !toolError && <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Finalizing...</p>}
              </motion.div>
            ) : processedFileUrl ? ( 
              <motion.div key="results-unlockpdf-area" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`max-w-md mx-auto text-center p-6 sm:p-8 rounded-xl shadow-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <FiCheckCircle className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>PDF Unlocked!</h2>
                <p className={`mb-4 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{displaySuccessMessage}</p>
                <a href={processedFileUrl} download={processedFileName} className={`inline-flex items-center justify-center px-8 py-3.5 text-base sm:text-lg font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 ${isDarkMode ? 'bg-green-500 hover:bg-green-400 text-white focus:ring-green-500/50' : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-600/50'} transform hover:scale-105 active:scale-95`}><FiDownload className="mr-2 w-5 h-5" /> Download Unlocked PDF</a>
                <button onClick={resetAll} className={`mt-4 flex items-center justify-center w-full px-6 py-3 text-sm font-medium rounded-md transition-colors ${isDarkMode ? 'text-sky-400 hover:bg-slate-700 focus:bg-slate-700' : 'text-sky-600 hover:bg-slate-100 focus:bg-slate-100'} focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-sky-500' : 'focus:ring-sky-600'}`}><FiRotateCcw className="mr-2 w-4 h-4" /> Process Another PDF</button>
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
export default UnlockPdfPage;