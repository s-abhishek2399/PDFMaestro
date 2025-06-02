// src/pages/tools/AddPageNumbersPage.jsx
import React, { useState, useCallback, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FileUploadZone from '../../components/FileUploadZone';
import useDarkMode from '../../custom_hooks/useDarkMode';
import usePdfTool from '../../custom_hooks/usePdfTool';
import { FaFilePdf, FaHashtag } from 'react-icons/fa';
import { 
    FiUploadCloud, FiDownload, FiAlertTriangle, 
    FiRotateCcw, FiCheckCircle, FiTrash2 
} from 'react-icons/fi'; // Removed FiSettings as we are not using a separate panel
import { motion, AnimatePresence } from 'framer-motion';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const numberPositions = [
    { id: 'bottom_right', name: 'Bottom Right' }, { id: 'bottom_center', name: 'Bottom Center' }, { id: 'bottom_left', name: 'Bottom Left' },
    { id: 'top_right', name: 'Top Right' }, { id: 'top_center', name: 'Top Center' }, { id: 'top_left', name: 'Top Left' },
];
const fontNames = ['Helvetica', 'Times-Roman', 'Courier']; // Basic PDF fonts (ReportLab defaults)
const numberFormats = [
    { id: '{current_page}', name: '1, 2, 3...' },
    { id: 'Page {current_page}', name: 'Page 1, Page 2...' },
    { id: '{current_page} / {total_pages}', name: '1 / N, 2 / N...' },
    { id: 'Page {current_page} of {total_pages}', name: 'Page 1 of N...' },
];

// Common Tailwind classes for form elements
const labelClass = "block text-sm font-medium mb-1";
const selectInputClass = "w-full px-3 py-2 text-sm rounded-md shadow-sm transition-colors duration-150 border focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500";
const numberInputClass = "w-full px-3 py-2 text-sm rounded-md shadow-sm transition-colors duration-150 border focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500";
const rangeInputClass = "w-full h-2 rounded-lg appearance-none cursor-pointer accent-sky-500 dark:accent-sky-400";


const AddPageNumbersPage = () => {
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [selectedFile, setSelectedFile] = useState(null);
  const [clientSideError, setClientSideError] = useState('');
  const [totalPages, setTotalPages] = useState(0);

  const [position, setPosition] = useState(numberPositions[0].id);
  const [startPage, setStartPage] = useState(1);
  const [numberFormat, setNumberFormat] = useState(numberFormats[3].id);
  const [fontName, setFontName] = useState(fontNames[0]);
  const [fontSize, setFontSize] = useState(10);
  const [margin, setMargin] = useState('0.5');

  const { 
    processFiles, isLoading, error: toolError, progress, 
    processedFileUrl, processedFileName, successMessage,
    clearError, resetTool: resetPdfToolHook 
  } = usePdfTool('add_page_numbers');

  const handleFileSelected = useCallback((files) => {
    clearError(); setClientSideError(''); setTotalPages(0);
    if (files && files.length > 0) {
        setSelectedFile(files[0]);
        // Fetch totalPages from backend on file selection (optional, but good for UI)
        // This would require a separate backend endpoint or enhancing usePdfTool
        // For now, totalPages is updated from the processFiles response.
    } else {
        setSelectedFile(null);
    }
  }, [clearError]);

  const removeFile = useCallback(() => {
    setSelectedFile(null); resetPdfToolHook(); clearError(); setClientSideError(''); setTotalPages(0);
  }, [clearError, resetPdfToolHook]);

  const handleAction = async () => {
    clearError(); setClientSideError('');
    if (!selectedFile) { setClientSideError("Please select a PDF file."); return; }
    
    const numStartPage = parseInt(startPage, 10);
    if (isNaN(numStartPage) || numStartPage < 1 || (totalPages > 0 && numStartPage > totalPages)) {
        setClientSideError(`Start page must be a number between 1 and ${totalPages || 'the last page'}.`); return;
    }
    const marginValue = parseFloat(margin);
    if (isNaN(marginValue) || marginValue < 0.1 || marginValue > 3) { // Increased max margin slightly
        setClientSideError("Margin must be a number between 0.1 and 3 inches."); return;
    }

    const options = { position, startPage: numStartPage, numberFormat, fontName, fontSize, margin };
    await processFiles([selectedFile], options);
  };
  
  const resetAll = () => {
    setSelectedFile(null); resetPdfToolHook(); clearError(); setClientSideError(''); setTotalPages(0);
    setPosition(numberPositions[0].id); setStartPage(1); setNumberFormat(numberFormats[3].id);
    setFontName(fontNames[0]); setFontSize(10); setMargin('0.5');
  };

  useEffect(() => {
    let pages = 0;
    const messageSource = successMessage || toolError;
    if (messageSource && typeof messageSource.totalPages !== 'undefined') {
      pages = parseInt(messageSource.totalPages, 10);
    }
    if (!isNaN(pages) && pages >= 0 && totalPages !== pages) {
      setTotalPages(pages);
      if (startPage > pages) setStartPage(pages); // Adjust startPage if it's out of new bounds
    }
  }, [successMessage, toolError, totalPages, startPage]);

  const displayErrorMessage = clientSideError || (toolError ? toolError.message : '');
  const displaySuccessMessage = successMessage ? successMessage.message : (processedFileUrl ? "Page numbers added successfully." : "");

  const dynamicLabelClass = isDarkMode ? 'text-slate-300' : 'text-slate-700';
  const dynamicSelectInputClass = `${selectInputClass} ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`;
  const dynamicNumberInputClass = `${numberInputClass} ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`;
  const dynamicRangeInputClass = `${rangeInputClass} ${isDarkMode ? 'bg-slate-700' : 'bg-slate-600'}`;


  return (
    <div className={`${isDarkMode ? 'dark' : ''} font-sans`}>
      <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen transition-colors duration-300 flex flex-col">
        <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <motion.div initial={{ opacity: 0, y:20 }} animate={{ opacity: 1, y:0 }} transition={{ duration: 0.5 }}>
            <div className="text-center mb-8 sm:mb-12">
              <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                Add Page Numbers to PDF
              </h1>
              <p className={`mt-3 sm:mt-4 text-base sm:text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Easily insert page numbers into your PDF documents with custom formatting and positioning.
              </p>
            </div>
            <AnimatePresence mode="wait">
            {!processedFileUrl && !isLoading ? (
              <motion.div key="upload-addnumbers-area" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-xl mx-auto">
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
                    
                    <div className={`mt-6 border-t pt-6 space-y-6 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div>
                                <label htmlFor="position" className={`${labelClass} ${dynamicLabelClass}`}>Position:</label>
                                <select id="position" value={position} onChange={(e) => setPosition(e.target.value)} className={dynamicSelectInputClass}>
                                    {numberPositions.map(pos => <option key={pos.id} value={pos.id}>{pos.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="numberFormat" className={`${labelClass} ${dynamicLabelClass}`}>Format:</label>
                                <select id="numberFormat" value={numberFormat} onChange={(e) => setNumberFormat(e.target.value)} className={dynamicSelectInputClass}>
                                    {numberFormats.map(fmt => <option key={fmt.id} value={fmt.id}>{fmt.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="fontName" className={`${labelClass} ${dynamicLabelClass}`}>Font:</label>
                                <select id="fontName" value={fontName} onChange={(e) => setFontName(e.target.value)} className={dynamicSelectInputClass}>
                                    {fontNames.map(name => <option key={name} value={name}>{name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="fontSize" className={`${labelClass} ${dynamicLabelClass}`}>Font Size: {fontSize}pt</label>
                                <input type="range" id="fontSize" min="6" max="24" step="1" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className={dynamicRangeInputClass}/>
                            </div>
                            <div>
                                <label htmlFor="startPage" className={`${labelClass} ${dynamicLabelClass}`}>Start at Page:</label>
                                <input type="number" id="startPage" min="1" max={totalPages > 0 ? totalPages : undefined} value={startPage} onChange={(e) => setStartPage(Math.max(1, parseInt(e.target.value) || 1))} className={dynamicNumberInputClass}/>
                            </div>
                            <div>
                                <label htmlFor="margin" className={`${labelClass} ${dynamicLabelClass}`}>Margin (inches):</label>
                                <input type="number" id="margin" min="0.1" max="3" step="0.1" value={margin} onChange={(e) => setMargin(e.target.value)} className={dynamicNumberInputClass}/>
                            </div>
                        </div>
                    </div>
                  </motion.div>
                )}
                {displayErrorMessage && ( <div className="mt-6 text-center"> <motion.div initial={{opacity: 0,y: -10}} animate={{opacity:1,y: 0}} className={`mb-4 p-3 rounded-md text-sm flex items-center justify-center ${isDarkMode ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-700 border border-red-200'}`}><FiAlertTriangle className="w-5 h-5 mr-2"/> {displayErrorMessage}</motion.div></div>)}
                {selectedFile && !isLoading && !processedFileUrl && ( <div className="mt-6 text-center"><button onClick={handleAction} disabled={isLoading} className={`px-8 py-3.5 text-base sm:text-lg font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 transform hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-sky-500 hover:bg-sky-400 text-white focus:ring-sky-500/50' : 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-600/50'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}><FaHashtag className="inline w-4 h-4 mr-2 -mt-0.5" /> Add Page Numbers</button></div>)}
              </motion.div>
            ) : isLoading ? ( 
              <motion.div key="loading-addnumbers" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="mt-8 text-center max-w-md mx-auto">
                <div className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>Adding Page Numbers...</div>
                <div className={`w-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded-full h-2.5`}><motion.div className={`h-2.5 rounded-full ${isDarkMode ? 'bg-sky-500' : 'bg-sky-600'}`} initial={{ width: '0%' }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3, ease:"linear" }}/></div>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{progress}%</p>
                {progress === 100 && !toolError && <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Finalizing...</p>}
              </motion.div>
            ) : processedFileUrl ? ( 
              <motion.div key="results-addnumbers-area" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`max-w-md mx-auto text-center p-6 sm:p-8 rounded-xl shadow-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <FiCheckCircle className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Page Numbers Added!</h2>
                <p className={`mb-4 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{displaySuccessMessage}</p>
                <a href={processedFileUrl} download={processedFileName} className={`inline-flex items-center justify-center px-8 py-3.5 text-base sm:text-lg font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 ${isDarkMode ? 'bg-green-500 hover:bg-green-400 text-white focus:ring-green-500/50' : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-600/50'} transform hover:scale-105 active:scale-95`}><FiDownload className="mr-2 w-5 h-5" /> Download Numbered PDF</a>
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
export default AddPageNumbersPage;