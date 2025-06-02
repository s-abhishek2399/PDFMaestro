// src/pages/tools/MergePdfPage.js
import React, { useState, useCallback, useEffect, useRef } from 'react'; // Added useRef
import { Link } from 'react-router-dom'; // Assuming you might add links later
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FileUploadZone from '../../components/FileUploadZone';
import useDarkMode from '../../custom_hooks/useDarkMode';
import usePdfTool from '../../custom_hooks/usePdfTool';
import { 
    FiFileText, FiTrash2, FiUploadCloud, FiDownload, 
    FiRotateCcw, FiAlertTriangle 
} from 'react-icons/fi'; // Removed unused icons
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'framer-motion';

const ItemTypes = { FILE: 'file' };

// Draggable File Item Component
const DraggableFileItem = ({ fileEntry, index, moveFile, removeFile, isDarkMode }) => {
  const ref = useRef(null); // Changed React.useRef to useRef
  const nativeFile = fileEntry.nativeFile;

  const [, drop] = useDrop({
    accept: ItemTypes.FILE,
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      
      moveFile(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.FILE,
    item: () => ({ id: fileEntry.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <motion.li
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
      className={`p-3 my-1.5 rounded-lg flex justify-between items-center shadow
                  transition-all duration-150 ease-in-out
                  ${isDragging ? (isDarkMode ? 'bg-sky-700 shadow-sky-500/30' : 'bg-sky-200 shadow-sky-500/30') : (isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200')}
                  ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}
      style={{ cursor: isDragging ? 'grabbing' : 'grab', opacity: isDragging ? 0.7 : 1 }}
    >
      <div className="flex items-center overflow-hidden">
        <FiFileText className={`w-5 h-5 mr-3 flex-shrink-0 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`} />
        <span className="text-sm truncate" title={nativeFile.name}>{nativeFile.name}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 flex-shrink-0">
          ({(nativeFile.size / (1024 * 1024)).toFixed(2)} MB) {/* Changed to MB for larger files */}
        </span>
      </div>
      <button
        onClick={() => removeFile(index)}
        className={`p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 ${isDarkMode ? 'text-slate-400 hover:text-red-400 hover:bg-slate-600 focus:ring-red-500' : 'text-slate-500 hover:text-red-500 hover:bg-slate-300 focus:ring-red-600'}`}
        aria-label="Remove file"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </motion.li>
  );
};


const MergePdfPage = () => {
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [files, setFiles] = useState([]); // Array of objects: { id: string, nativeFile: File }
  const { 
    processFiles, 
    isLoading, 
    error: toolError, 
    progress, 
    processedFileUrl, 
    processedFileName, 
    successMessage, // Added successMessage here
    clearError, 
    resetTool: resetPdfToolHook 
  } = usePdfTool('merge');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!toolError) setLocalError('');
    else setLocalError(toolError.message);
  }, [toolError]);

  const handleFilesSelected = useCallback((selectedNativeFiles) => {
    clearError();
    setLocalError('');
    
    const newFileEntries = selectedNativeFiles
      .filter(nativeFile => nativeFile.type === 'application/pdf')
      .map(nativeFile => ({
        id: `${nativeFile.name}-${nativeFile.lastModified}-${nativeFile.size}-${Math.random().toString(36).substring(2, 15)}`.replace(/[.\s]/g,'-'), // More robust ID
        nativeFile: nativeFile,
      }))
      .filter(entry => !files.some(f => f.nativeFile.name === entry.nativeFile.name && f.nativeFile.size === entry.nativeFile.size && f.nativeFile.lastModified === entry.nativeFile.lastModified)); // Stricter duplicate check

    if (newFileEntries.length !== selectedNativeFiles.filter(sf => sf.type === 'application/pdf').length) {
        if (selectedNativeFiles.filter(sf => sf.type !== 'application/pdf').length > 0) {
             setLocalError("Some files were not PDFs and were ignored. Only PDF files are accepted.");
        }
    } else if (selectedNativeFiles.length > 0 && newFileEntries.length === 0 && files.length > 0) {
        // All selected files were duplicates of already added files
        setLocalError("Selected file(s) are already in the list.");
    }
    
    setFiles(prevFiles => [...prevFiles, ...newFileEntries]);
  }, [files, clearError]);

  const removeFile = useCallback((indexToRemove) => {
    setFiles(prevFiles => {
        const updatedFiles = prevFiles.filter((_, index) => index !== indexToRemove);
        if (updatedFiles.length < 2 && updatedFiles.length > 0) {
            setLocalError('You need at least two PDF files to merge.');
        } else {
            setLocalError('');
        }
        return updatedFiles;
    });
  }, []);

  const moveFile = useCallback((dragIndex, hoverIndex) => {
    setFiles(prevFiles => {
      const newFilesArray = [...prevFiles];
      const [draggedItem] = newFilesArray.splice(dragIndex, 1);
      newFilesArray.splice(hoverIndex, 0, draggedItem);
      return newFilesArray;
    });
  }, []);

  const handleMerge = async () => {
    clearError();
    setLocalError('');
    if (files.length < 2) {
      setLocalError("Please upload at least two PDF files to merge.");
      return;
    }
    const filesToProcess = files.map(entry => entry.nativeFile); 
    await processFiles(filesToProcess);
  };
  
  const resetAll = () => {
    setFiles([]);
    resetPdfToolHook();
    setLocalError('');
    clearError();
  };

  const currentError = localError || (toolError ? toolError.message : '');
  const MAX_FILES = 20; // Define max files constant
  const MAX_FILE_SIZE_MB = 50; // Define max file size constant


  return (
    <DndProvider backend={HTML5Backend}>
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
                  Merge PDF Files
                </h1>
                <p className={`mt-3 sm:mt-4 text-base sm:text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Combine multiple PDF documents into a single, organized file. Drag & drop your files, reorder them as needed, and merge!
                </p>
              </div>

              <AnimatePresence mode="wait">
              {!processedFileUrl && !isLoading ? ( // Show upload/file list if not processed and not loading
                <motion.div
                  key="upload-area"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-2xl mx-auto"
                >
                    <FileUploadZone
                        onFilesSelected={handleFilesSelected}
                        acceptedTypes="application/pdf"
                        multiple={true}
                        isDarkMode={isDarkMode}
                        disabled={isLoading || files.length >= MAX_FILES}
                        maxFiles={MAX_FILES - files.length} 
                        maxFileSizeMB={MAX_FILE_SIZE_MB}
                    >
                        <FiUploadCloud className={`w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`} />
                        <p className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                            {files.length > 0 ? 'Add More PDF Files' : 'Drag & Drop PDFs Here'}
                        </p>
                        <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>
                            or click to select files
                        </p>
                        <p className={`mt-2 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Supports: .pdf files only. Max {MAX_FILE_SIZE_MB}MB per file.</p>
                         {files.length > 0 && <p className={`mt-1 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Selected: {files.length} of {MAX_FILES} max files.</p>}
                    </FileUploadZone>

                  {files.length > 0 && (
                    <div className="mt-6 sm:mt-8">
                      <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        Your Files (Drag to reorder):
                      </h3>
                      <ul className="max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence>
                          {files.map((fileEntry, index) => (
                            <DraggableFileItem
                              key={fileEntry.id}
                              fileEntry={fileEntry}
                              index={index}
                              moveFile={moveFile}
                              removeFile={removeFile}
                              isDarkMode={isDarkMode}
                            />
                          ))}
                        </AnimatePresence>
                      </ul>
                    </div>
                  )}

                  {(files.length > 0 || currentError) && (
                     <div className="mt-6 sm:mt-8 text-center">
                        {currentError && (
                            <motion.div 
                                initial={{opacity: 0, y: -10}}
                                animate={{opacity:1, y: 0}}
                                className={`mb-4 p-3 rounded-md text-sm flex items-center justify-center ${isDarkMode ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-700 border border-red-200'}`}
                            >
                                <FiAlertTriangle className="w-5 h-5 mr-2"/> {currentError}
                            </motion.div>
                        )}
                        {files.length > 0 && (
                            <button
                            onClick={handleMerge}
                            disabled={files.length < 2} // isLoading check removed as it's handled by parent AnimatePresence
                            className={`px-8 py-3.5 text-base sm:text-lg font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out
                                        focus:outline-none focus:ring-4
                                        ${files.length < 2
                                        ? (isDarkMode ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-slate-300 text-slate-500 cursor-not-allowed')
                                        : (isDarkMode ? 'bg-sky-500 hover:bg-sky-400 text-white focus:ring-sky-500/50' : 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-600/50')}
                                        transform hover:scale-105 active:scale-95
                                        `}
                            >
                            {`Merge ${files.length} PDFs`}
                            </button>
                        )}
                     </div>
                  )}
                </motion.div>
              ) : isLoading ? ( // Show loading indicator if isLoading is true
                <motion.div 
                    key="loading"
                    initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                    className="mt-8 text-center max-w-md mx-auto"
                >
                  <div className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>
                    Processing your files...
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
              ) : processedFileUrl ? ( // Show results if processedFileUrl exists
                <motion.div
                  key="results-area"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-md mx-auto text-center p-6 sm:p-8 rounded-xl shadow-xl 
                             border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}"
                >
                  <FiDownload className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <h2 className={`text-2xl font-semibold mb-3 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                    {successMessage || "Merge Successful!"}
                  </h2>
                  <p className={`mb-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Your PDF files have been merged. Download your new document.
                  </p>
                  <a
                    href={processedFileUrl}
                    download={processedFileName}
                    className={`inline-flex items-center justify-center px-8 py-3.5 text-base sm:text-lg font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out
                                focus:outline-none focus:ring-4
                                ${isDarkMode ? 'bg-green-500 hover:bg-green-400 text-white focus:ring-green-500/50' : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-600/50'}
                                transform hover:scale-105 active:scale-95
                                `}
                  >
                    <FiDownload className="mr-2 w-5 h-5" /> Download Merged PDF
                  </a>
                  <button
                    onClick={resetAll}
                    className={`mt-4 flex items-center justify-center w-full px-6 py-3 text-sm font-medium rounded-md transition-colors
                                ${isDarkMode ? 'text-sky-400 hover:bg-slate-700 focus:bg-slate-700' : 'text-sky-600 hover:bg-slate-100 focus:bg-slate-100'}
                                focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-sky-500' : 'focus:ring-sky-600'}`}
                  >
                    <FiRotateCcw className="mr-2 w-4 h-4" /> Merge More PDFs
                  </button>
                </motion.div>
              ) : null // Fallback, should ideally not be reached if logic is correct
            }
              </AnimatePresence>

            </motion.div>
          </main>
          <Footer isDarkMode={isDarkMode} />
        </div>
      </div>
    </DndProvider>
  );
};

export default MergePdfPage;