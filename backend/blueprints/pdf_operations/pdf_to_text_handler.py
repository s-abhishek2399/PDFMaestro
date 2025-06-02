# backend/blueprints/pdf_operations/pdf_to_text_handler.py
import os
import uuid
import shutil
from flask import current_app
from werkzeug.utils import secure_filename
from pypdf import PdfReader # Using pypdf
from .utils import check_allowed_file, create_temp_folder, save_uploaded_file

ALLOWED_EXTENSIONS_PDF = {'pdf'}

def handle_pdf_to_text(request_files, request_form):
    if 'files' not in request_files:
        return {'success': False, 'error': 'No file part in the request'}, 400
    
    file_stream = request_files.getlist('files')[0]
    if not file_stream or not file_stream.filename:
        raise ValueError('No file selected for PDF to Text extraction.')
    
    original_filename = file_stream.filename
    if not check_allowed_file(original_filename, ALLOWED_EXTENSIONS_PDF):
        raise ValueError(f"Invalid file type: {original_filename}. Only PDF files are allowed.")

    original_filename_secure = secure_filename(original_filename)
    request_temp_folder = create_temp_folder("pdf2text_temp")
    
    try:
        temp_input_filepath = save_uploaded_file(file_stream, request_temp_folder)
        
        reader = PdfReader(temp_input_filepath)
        num_total_pages = len(reader.pages)
        if num_total_pages == 0:
            raise ValueError("The PDF file appears to be empty or corrupted.")

        extracted_text = ""
        for page_num in range(num_total_pages):
            page = reader.pages[page_num]
            try:
                extracted_text += page.extract_text() + "\n\n--- Page Break ---\n\n"
            except Exception as text_extract_error:
                current_app.logger.warning(f"Could not extract text from page {page_num + 1} of {original_filename_secure}: {text_extract_error}")
                extracted_text += f"[Error extracting text from page {page_num + 1}]\n\n--- Page Break ---\n\n"


        if not extracted_text.strip():
            # Check if it's an image-based PDF without OCR text layer
            is_image_based = True
            for page in reader.pages:
                if page.extract_text(extraction_mode="layout").strip(): # Try layout mode for text
                    is_image_based = False
                    break
                if page.images: # Check if there are images
                    continue 
            if is_image_based and any(page.images for page in reader.pages):
                 raise ValueError("No text layer found in the PDF. It might be an image-based PDF. OCR is required to extract text from images.")
            # Else, if no text and no images, it might truly be empty or have non-extractable vector text
            current_app.logger.info(f"No text could be extracted from {original_filename_secure}.")
            # Decide if an empty TXT for an empty PDF is desired.
            # For now, proceed, will create an empty text file.

        output_filename_base = os.path.splitext(original_filename_secure)[0]
        output_text_filename = f"{output_filename_base}_{uuid.uuid4().hex[:6]}.txt"
        output_text_filepath = os.path.join(current_app.config['CONVERTED_FILES_FOLDER'], output_text_filename)
        
        with open(output_text_filepath, "w", encoding="utf-8") as f_out:
            f_out.write(extracted_text)

        response_data = {
            'success': True, 
            'message': f"Successfully extracted text from '{original_filename_secure}'.",
            'download_url': f'/api/download/{output_text_filename}', 
            'filename': output_text_filename,
            'totalPages': num_total_pages
        }
        return response_data, 200
    finally:
        if request_temp_folder and os.path.exists(request_temp_folder):
            try:
                shutil.rmtree(request_temp_folder)
            except OSError as e_clean:
                current_app.logger.error(f"Error cleaning temp folder {request_temp_folder} for pdf_to_text: {e_clean}")