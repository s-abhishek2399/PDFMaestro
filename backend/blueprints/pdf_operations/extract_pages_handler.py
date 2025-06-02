# backend/blueprints/pdf_operations/extract_pages_handler.py
import os
import uuid
import shutil
from flask import current_app
from werkzeug.utils import secure_filename
from pypdf import PdfReader, PdfWriter
from .utils import check_allowed_file, parse_page_ranges, create_temp_folder, save_uploaded_file

ALLOWED_EXTENSIONS_PDF = {'pdf'}

def handle_extract_pages(request_files, request_form):
    if 'files' not in request_files:
        return {'success': False, 'error': 'No file part in the request'}, 400
    
    file_stream = request_files.getlist('files')[0]
    if not file_stream or not file_stream.filename:
        raise ValueError('No file selected for extracting pages.')
    
    original_filename = file_stream.filename
    if not check_allowed_file(original_filename, ALLOWED_EXTENSIONS_PDF):
        raise ValueError(f"Invalid file type: {original_filename}. Only PDF files are allowed.")

    pages_to_extract_str = request_form.get('pagesToExtract', '')
    if not pages_to_extract_str:
        raise ValueError("Please specify which page numbers to extract.")

    original_filename_secure = secure_filename(original_filename)
    request_temp_folder = create_temp_folder("extract_pages_temp")
    
    try:
        temp_input_filepath = save_uploaded_file(file_stream, request_temp_folder)
        
        reader = PdfReader(temp_input_filepath)
        writer = PdfWriter()
        num_total_pages = len(reader.pages)

        if num_total_pages == 0:
            raise ValueError("The PDF file appears to be empty or corrupted.")

        try:
            pages_to_extract_indices = parse_page_ranges(pages_to_extract_str, num_total_pages)
        except ValueError as ve:
            setattr(ve, 'totalPages', num_total_pages)
            raise ve
            
        if not pages_to_extract_indices:
            raise ValueError("No valid pages selected for extraction.")
        
        for page_index in pages_to_extract_indices:
            writer.add_page(reader.pages[page_index])
        
        if len(writer.pages) == 0: # Should not happen if pages_to_extract_indices was valid
            raise ValueError("Extraction resulted in an empty PDF. Specified pages might not exist.")

        output_filename_base = os.path.splitext(original_filename_secure)[0]
        output_pdf_filename = f"{output_filename_base}_extracted_{uuid.uuid4().hex[:6]}.pdf"
        output_pdf_filepath = os.path.join(current_app.config['CONVERTED_FILES_FOLDER'], output_pdf_filename)
        
        with open(output_pdf_filepath, "wb") as f_out:
            writer.write(f_out)

        response_data = {
            'success': True, 
            'message': f"Successfully extracted {len(writer.pages)} page(s).",
            'download_url': f'/api/download/{output_pdf_filename}', 
            'filename': output_pdf_filename,
            'totalPages': num_total_pages, # Original total pages
            'extractedPageCount': len(writer.pages)
        }
        return response_data, 200
    finally:
        if request_temp_folder and os.path.exists(request_temp_folder):
            try:
                shutil.rmtree(request_temp_folder)
            except OSError as e_clean:
                current_app.logger.error(f"Error cleaning temp folder {request_temp_folder} for extract_pages: {e_clean}")