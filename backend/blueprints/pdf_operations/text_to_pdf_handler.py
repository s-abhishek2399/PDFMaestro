# backend/blueprints/pdf_operations/text_to_pdf_handler.py
import os
import uuid
import shutil
from flask import current_app
from werkzeug.utils import secure_filename
from fpdf import FPDF # Using fpdf2
from .utils import check_allowed_file, create_temp_folder, save_uploaded_file

ALLOWED_EXTENSIONS_TEXT = {'txt', 'text', 'md', 'rtf'} # Added md, rtf as common text formats

def handle_text_to_pdf(request_files, request_form):
    if 'files' not in request_files:
        return {'success': False, 'error': 'No file part in the request'}, 400
    
    file_stream = request_files.getlist('files')[0]
    if not file_stream or not file_stream.filename:
        raise ValueError('No file selected for Text to PDF.')
    
    original_filename = file_stream.filename
    if not check_allowed_file(original_filename, ALLOWED_EXTENSIONS_TEXT):
        raise ValueError(f"Invalid file type: {original_filename}. Supported: {', '.join(ALLOWED_EXTENSIONS_TEXT)}")

    original_filename_secure = secure_filename(original_filename)
    request_temp_folder = create_temp_folder("text2pdf_temp")
    
    try:
        temp_input_filepath = save_uploaded_file(file_stream, request_temp_folder)
        
        # Read the text content
        # Try common encodings; utf-8 is usually a good default
        text_content = ""
        encodings_to_try = ['utf-8', 'latin-1', 'windows-1252']
        for encoding in encodings_to_try:
            try:
                with open(temp_input_filepath, "r", encoding=encoding) as f:
                    text_content = f.read()
                break # Successfully read
            except UnicodeDecodeError:
                current_app.logger.warning(f"Failed to decode {original_filename_secure} with {encoding}")
                continue
        
        if not text_content and os.path.getsize(temp_input_filepath) > 0: # If content is empty but file wasn't, means all decodes failed
             raise ValueError("Could not decode the text file. It might be in an unsupported encoding or not a plain text file.")
        elif not text_content and os.path.getsize(temp_input_filepath) == 0:
             current_app.logger.info(f"Input text file {original_filename_secure} is empty.")
             # Decide if an empty PDF for an empty TXT is desired or an error
             # For now, let's proceed and it will create a PDF with no text content.

        pdf = FPDF()
        pdf.add_page()
        
        # Add a Unicode font that supports a wide range of characters
        # DejaVu is a good choice if available or bundled.
        # fpdf2 comes with some core fonts. For broader Unicode, you might need to add a .ttf font file.
        # Let's try 'Arial' which is a standard one, and then set a common size.
        try:
            pdf.set_font("Arial", size=12)
        except RuntimeError: # Font not found, fallback or error
            current_app.logger.warning("Arial font not found by FPDF, trying helvetica.")
            pdf.set_font("Helvetica", size=12) # Helvetica is a core PDF font

        # Add text to PDF. MultiCell handles line breaks.
        pdf.multi_cell(0, 10, text_content) # width=0 (to page width), height of lines=10

        output_filename_base = os.path.splitext(original_filename_secure)[0]
        output_pdf_filename = f"{output_filename_base}_{uuid.uuid4().hex[:6]}.pdf"
        output_pdf_filepath = os.path.join(current_app.config['CONVERTED_FILES_FOLDER'], output_pdf_filename)
        
        pdf.output(output_pdf_filepath, "F")

        response_data = {
            'success': True, 
            'message': f"Successfully converted '{original_filename_secure}' to PDF.",
            'download_url': f'/api/download/{output_pdf_filename}', 
            'filename': output_pdf_filename
        }
        return response_data, 200
    finally:
        if request_temp_folder and os.path.exists(request_temp_folder):
            try:
                shutil.rmtree(request_temp_folder)
            except OSError as e_clean:
                current_app.logger.error(f"Error cleaning temp folder {request_temp_folder} for text_to_pdf: {e_clean}")