// src/hooks/usePdfTool.js
import { useState, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

const usePdfTool = (operationName) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0); // 0-100
  const [processedFileUrl, setProcessedFileUrl] = useState(null);
  const [processedFileName, setProcessedFileName] = useState('download.pdf');
  const [successMessage, setSuccessMessage] = useState('');


  const processFiles = useCallback(async (files, options = {}) => { 
    if (!files || files.length === 0) {
      setError({ message: "No files selected. Please upload your files." });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    setProcessedFileUrl(null);
    setSuccessMessage('');
    setProgress(0);

    const formData = new FormData();
    formData.append('operation', operationName);
    // Append files in order
    files.forEach((file) => {
      formData.append('files', file, file.name); // file.name is important for the backend
    });

    // Append other options if any
    Object.keys(options).forEach(key => {
      formData.append(key, options[key]);
    });

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/process_pdf`, true);

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      };
      
      xhr.onload = () => {
        setIsLoading(false);
        setProgress(100); // Ensure it hits 100 on completion or error

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              // Construct full URL for download if backend provides relative
              const downloadUrl = response.download_url.startsWith('http') 
                ? response.download_url 
                : `${API_BASE_URL.replace('/api','')}${response.download_url}`; // Adjust base for download if needed
              
              setProcessedFileUrl(downloadUrl);
              setProcessedFileName(response.filename || 'processed_file.pdf');
              setSuccessMessage(response.message || 'Operation successful!');
              setError(null);
            } else {
              setError({ message: response.error || 'An unknown error occurred processing the file.' });
            }
          } catch (e) {
            setError({ message: 'Failed to parse server response. Please try again.' });
            console.error("JSON Parse Error:", e, "Response Text:", xhr.responseText);
          }
        } else {
          // Try to parse error from backend if possible
          let backendError = `Request failed with status: ${xhr.status}.`;
          try {
              const errorResponse = JSON.parse(xhr.responseText);
              if (errorResponse.error) {
                  backendError = errorResponse.error;
              }
          } catch (e) {
              // Keep default error message if parsing fails
              if(xhr.responseText) backendError += ` Server response: ${xhr.responseText.substring(0,100)}`;
          }
          setError({ message: backendError });
        }
      };

      xhr.onerror = () => {
        setIsLoading(false);
        setProgress(100); // Or 0 depending on desired UX for network errors
        setError({ message: 'A network error occurred. Please check your connection and try again.' });
      };
      
      xhr.send(formData);

    } catch (e) {
      setIsLoading(false);
      setError({ message: e.message || 'An unexpected error occurred during the request setup.' });
      console.error("Error in processFiles:", e);
    }
  }, [operationName]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetTool = useCallback(() => {
    // URL.revokeObjectURL might not be needed if it's a direct server link
    // if (processedFileUrl && processedFileUrl.startsWith('blob:')) {
    //   URL.revokeObjectURL(processedFileUrl);
    // }
    setProcessedFileUrl(null);
    setProcessedFileName('download.pdf');
    setProgress(0);
    setError(null);
    setIsLoading(false);
    setSuccessMessage('');
  }, []);

  return { processFiles, isLoading, error, progress, processedFileUrl, processedFileName, successMessage, clearError, resetTool };
};

export default usePdfTool;