// src/pages/tools/ImagesToPdfPage.js
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FileUploadZone from '../../components/FileUploadZone';
import useDarkMode from '../../custom_hooks/useDarkMode';
import usePdfTool from '../../custom_hooks/usePdfTool'; // Corrected path
import { FiImage, FiTrash2, FiUploadCloud, FiDownload, FiRotateCcw, FiAlertTriangle, FiFilePlus, FiChevronDown } from 'react-icons/fi';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'framer-motion';

const ItemTypes = { IMAGE_FILE: 'image_file' };

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const pageOrientations = [
    { id: 'portrait', name: 'Portrait', value: 'portrait' },
    { id: 'landscape', name: 'Landscape', value: 'landscape' },
];

const pageSizes = [
    { id: 'auto', name: 'Auto (Fit Image)', value: 'AUTO'}, // Default
    { id: 'a4', name: 'A4', value: 'A4' },
    { id: 'letter', name: 'Letter', value: 'LETTER' },
    { id: 'a3', name: 'A3', value: 'A3' },
    { id: 'a5', name: 'A5', value: 'A5' },
    { id: 'legal', name: 'Legal', value: 'LEGAL' },
    { id: 'tabloid', name: 'Tabloid (11x17")', value: 'TABLOID' },
    { id: 'photo_4x6', name: '4x6 Photo', value: 'PHOTO_4X6'},
    { id: 'photo_5x7', name: '5x7 Photo', value: 'PHOTO_5X7'},
    { id: 'photo_8x10', name: '8x10 Photo', value: 'PHOTO_8X10'},
    { id: 'square_8x8', name: 'Square (8x8")', value: 'SQUARE_8X8'},
];

// Draggable Image Item Component
const DraggableImageItem = ({ imageEntry, index, moveImage, removeImage, isDarkMode }) => {
  const ref = useRef(null);
  const nativeFile = imageEntry.nativeFile;
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    let objectUrl = null;
    if (nativeFile && nativeFile.type.startsWith('image/')) {
      objectUrl = URL.createObjectURL(nativeFile); // More direct way to get blob URL for preview
      setPreviewUrl(objectUrl);
    }
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [nativeFile]); // Only re-run if nativeFile changes

  const [, drop] = useDrop({
    accept: ItemTypes.IMAGE_FILE,
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
      moveImage(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.IMAGE_FILE,
    item: () => ({ id: imageEntry.id, index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  drag(drop(ref));

  return (
    <motion.li
      ref={ref} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
      className={`p-3 my-1.5 rounded-lg flex justify-between items-center shadow transition-all duration-150 ease-in-out
                  ${isDragging ? (isDarkMode ? 'bg-sky-700 shadow-sky-500/30' : 'bg-sky-200 shadow-sky-500/30') : (isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200')}
                  ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}
      style={{ cursor: isDragging ? 'grabbing' : 'grab', opacity: isDragging ? 0.7 : 1 }}
    >
      <div className="flex items-center overflow-hidden space-x-3">
        {previewUrl ? (
            <img src={previewUrl} alt={nativeFile.name} className="w-10 h-10 object-cover rounded flex-shrink-0 border border-slate-300 dark:border-slate-600" />
        ) : (
            <FiImage className={`w-8 h-8 flex-shrink-0 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`} />
        )}
        <div className="overflow-hidden">
            <span className="text-sm font-medium truncate block" title={nativeFile.name}>{nativeFile.name}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">({formatFileSize(nativeFile.size)})</span>
        </div>
      </div>
      <button
        onClick={() => removeImage(index)} aria-label="Remove image"
        className={`p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 ${isDarkMode ? 'text-slate-400 hover:text-red-400 hover:bg-slate-600 focus:ring-red-500' : 'text-slate-500 hover:text-red-500 hover:bg-slate-300 focus:ring-red-600'}`}
      ><FiTrash2 className="w-4 h-4" /></button>
    </motion.li>
  );
};


const ImagesToPdfPage = () => {
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [images, setImages] = useState([]);
  const [pageOrientation, setPageOrientation] = useState(pageOrientations[0].value);
  const [pageSize, setPageSize] = useState(pageSizes[0].value);

  const { 
    processFiles, isLoading, error: toolError, progress, 
    processedFileUrl, processedFileName, successMessage,
    clearError, resetTool: resetPdfToolHook 
  } = usePdfTool('images_to_pdf');
  
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!toolError) setLocalError('');
    else setLocalError(toolError.message || (toolError.error ? toolError.error.message : 'An unknown error occurred.'));
  }, [toolError]);

  const handleFilesSelected = useCallback((selectedNativeFiles) => {
    clearError(); setLocalError('');
    const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'];
    
    const newImageEntries = selectedNativeFiles
      .filter(nativeFile => acceptedImageTypes.includes(nativeFile.type))
      .map(nativeFile => ({
        id: `${nativeFile.name}-${nativeFile.lastModified}-${nativeFile.size}-${Math.random().toString(36).substring(2, 15)}`.replace(/[.\s]/g,'-'),
        nativeFile: nativeFile,
      }))
      .filter(entry => !images.some(img => img.nativeFile.name === entry.nativeFile.name && img.nativeFile.size === entry.nativeFile.size && img.nativeFile.lastModified === entry.nativeFile.lastModified));

    if (selectedNativeFiles.some(sf => !acceptedImageTypes.includes(sf.type))) {
        setLocalError("Some files were not supported image types and were ignored. Ensure you upload JPG, PNG, GIF, WEBP, BMP, or TIFF files.");
    } else if (selectedNativeFiles.length > 0 && newImageEntries.length === 0 && images.length > 0) {
        setLocalError("Selected image(s) are already in the list.");
    }
    
    setImages(prevImages => [...prevImages, ...newImageEntries]);
  }, [images, clearError]);

  const removeImage = useCallback((indexToRemove) => {
    setImages(prevImages => {
        const updatedImages = prevImages.filter((_, index) => index !== indexToRemove);
        if (updatedImages.length === 0) setLocalError('');
        return updatedImages;
    });
  }, []);

  const moveImage = useCallback((dragIndex, hoverIndex) => {
    setImages(prevImages => {
      const newImagesArray = [...prevImages];
      const [draggedItem] = newImagesArray.splice(dragIndex, 1);
      newImagesArray.splice(hoverIndex, 0, draggedItem);
      return newImagesArray;
    });
  }, []);

  const handleConvertToPdf = async () => {
    clearError(); setLocalError('');
    if (images.length === 0) {
      setLocalError("Please upload at least one image to convert."); return;
    }
    const filesToProcess = images.map(entry => entry.nativeFile); 
    await processFiles(filesToProcess, { pageOrientation, pageSize });
  };
  
  const resetAll = () => {
    setImages([]); resetPdfToolHook(); setLocalError(''); clearError();
    setPageOrientation(pageOrientations[0].value); setPageSize(pageSizes[0].value);
  };

  const currentError = localError || (toolError ? (toolError.message || (toolError.error ? toolError.error.message : 'An error occurred.')) : '');
  const MAX_IMAGES = 50;
  const MAX_IMAGE_SIZE_MB = 20;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`${isDarkMode ? 'dark' : ''} font-sans`}>
        <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen transition-colors duration-300 flex flex-col">
          <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
          
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <motion.div 
              initial={{ opacity: 0, y:20 }} animate={{ opacity: 1, y:0 }} transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8 sm:mb-12">
                <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  Convert Images to PDF
                </h1>
                <p className={`mt-3 sm:mt-4 text-base sm:text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Upload JPG, PNG, GIF, and other images to create a single PDF document. Reorder and set page options.
                </p>
              </div>

              <AnimatePresence mode="wait">
              {!processedFileUrl && !isLoading ? (
                <motion.div
                  key="upload-images-area" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start"
                >
                  <div className="md:col-span-7 lg:col-span-8">
                    <FileUploadZone
                        onFilesSelected={handleFilesSelected}
                        acceptedTypes="image/jpeg, image/png, image/gif, image/webp, image/bmp, image/tiff"
                        multiple={true} isDarkMode={isDarkMode} disabled={isLoading || images.length >= MAX_IMAGES}
                        maxFiles={MAX_IMAGES - images.length} maxFileSizeMB={MAX_IMAGE_SIZE_MB}
                    >
                        <FiUploadCloud className={`w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`} />
                        <p className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{images.length > 0 ? 'Add More Images' : 'Drag & Drop Images Here'}</p>
                        <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>or click to select files</p>
                        <p className={`mt-2 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Supports: JPG, PNG, GIF, WEBP, etc. Max {MAX_IMAGE_SIZE_MB}MB per image.</p>
                        {images.length > 0 && <p className={`mt-1 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Selected: {images.length} of {MAX_IMAGES} max images.</p>}
                    </FileUploadZone>

                    {images.length > 0 && (
                        <div className="mt-6 sm:mt-8">
                        <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Your Images (Drag to reorder):</h3>
                        <ul className="max-h-[32rem] overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence>
                            {images.map((imgEntry, index) => (
                                <DraggableImageItem key={imgEntry.id} imageEntry={imgEntry} index={index}
                                    moveImage={moveImage} removeImage={removeImage} isDarkMode={isDarkMode} />
                            ))}
                            </AnimatePresence>
                        </ul>
                        </div>
                    )}
                  </div>

                  <div className={`md:col-span-5 lg:col-span-4 p-4 sm:p-5 rounded-xl shadow-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} md:sticky md:top-24 self-start`}>
                    <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>PDF Options</h3>
                    <div className="space-y-5">
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Page Orientation:</label>
                            <div className="flex space-x-2">
                                {pageOrientations.map(opt => (
                                    <button key={opt.id} onClick={() => setPageOrientation(opt.value)}
                                        className={`flex-1 py-2 px-3 text-xs sm:text-sm rounded-md border transition-all ${pageOrientation === opt.value ? (isDarkMode ? 'bg-sky-500 text-white border-sky-400 ring-2 ring-sky-500' : 'bg-sky-600 text-white border-sky-500 ring-2 ring-sky-600') : (isDarkMode ? 'bg-slate-700 text-slate-300 border-slate-600 hover:border-sky-500' : 'bg-slate-100 text-slate-700 border-slate-300 hover:border-sky-600')}`}
                                    >{opt.name}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="pageSizeSelect" className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Page Size:</label>
                            <div className="relative">
                                <select
                                    id="pageSizeSelect" value={pageSize} onChange={(e) => setPageSize(e.target.value)}
                                    className={`w-full pl-3 pr-10 py-2 text-sm rounded-md shadow-sm appearance-none focus:outline-none transition-colors duration-150 border ${isDarkMode ? 'border-slate-600 bg-slate-700 text-slate-100 focus:ring-sky-500 focus:border-sky-500' : 'border-slate-300 bg-white text-slate-900 focus:ring-sky-600 focus:border-sky-600'}`}
                                >
                                    {pageSizes.map(opt => (<option key={opt.id} value={opt.value}>{opt.name}</option>))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 dark:text-slate-400"><FiChevronDown className="h-4 w-4" /></div>
                            </div>
                        </div>
                    </div>
                    {currentError && (<motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className={`mt-5 mb-4 p-3 rounded-md text-sm flex items-center justify-center ${isDarkMode ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-700 border border-red-200'}`}><FiAlertTriangle className="w-5 h-5 mr-2"/> {currentError}</motion.div>)}
                    <button onClick={handleConvertToPdf} disabled={images.length === 0}
                        className={`w-full mt-6 px-6 py-3 text-base font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 transform hover:scale-105 active:scale-95 ${images.length === 0 ? (isDarkMode ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-slate-300 text-slate-500 cursor-not-allowed') : (isDarkMode ? 'bg-sky-500 hover:bg-sky-400 text-white focus:ring-sky-500/50' : 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-600/50')} `}
                    ><FiFilePlus className="inline w-5 h-5 mr-2 -mt-0.5" /> Convert to PDF</button>
                  </div>
                </motion.div>
              ) : isLoading ? ( <motion.div key="loading-images" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="mt-8 text-center max-w-md mx-auto">
                <div className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>Converting Images to PDF...</div>
                <div className={`w-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded-full h-2.5`}><motion.div className={`h-2.5 rounded-full ${isDarkMode ? 'bg-sky-500' : 'bg-sky-600'}`} initial={{ width: '0%' }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3, ease:"linear" }}/></div>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{progress}%</p>
                {progress === 100 && !toolError && <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Finalizing...</p>}
              </motion.div>
              ) : processedFileUrl ? ( <motion.div key="results-images-area" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto text-center p-6 sm:p-8 rounded-xl shadow-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}">
                <FiDownload className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Conversion Successful!</h2>
                <p className={`mb-4 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{successMessage?.message || (successMessage?.imageCount ? `Your ${successMessage.imageCount} images have been converted to PDF.` : `Your images have been converted to PDF.`)}</p>
                <a href={processedFileUrl} download={processedFileName} className={`inline-flex items-center justify-center px-8 py-3.5 text-base sm:text-lg font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 ${isDarkMode ? 'bg-green-500 hover:bg-green-400 text-white focus:ring-green-500/50' : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-600/50'} transform hover:scale-105 active:scale-95`}
                ><FiDownload className="mr-2 w-5 h-5" /> Download PDF</a>
                <button onClick={resetAll} className={`mt-4 flex items-center justify-center w-full px-6 py-3 text-sm font-medium rounded-md transition-colors ${isDarkMode ? 'text-sky-400 hover:bg-slate-700 focus:bg-slate-700' : 'text-sky-600 hover:bg-slate-100 focus:bg-slate-100'} focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-sky-500' : 'focus:ring-sky-600'}`}
                ><FiRotateCcw className="mr-2 w-4 h-4" /> Convert More Images</button>
              </motion.div>
              ) : null}
              </AnimatePresence>
            </motion.div>
          </main>
          <Footer isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        </div>
      </div>
    </DndProvider>
  );
};

export default ImagesToPdfPage;