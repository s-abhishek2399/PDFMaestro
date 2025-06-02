# backend/blueprints/pdf_operations/word_to_pdf_handler.py
import os
import uuid
import shutil
from flask import current_app
from werkzeug.utils import secure_filename
from docx2pdf import convert as convert_docx_to_pdf
from .utils import check_allowed_file, create_temp_folder, save_uploaded_file

ALLOWED_EXTENSIONS_WORD = {'doc', 'docx'}

def handle_word_to_pdf(request_files, request_form):
    if 'files' not in request_files:
        return {'success': False, 'error': 'No file part in the request'}, 400
    
    file_stream = request_files.getlist('files')[0]
    if not file_stream or not file_stream.filename:
        raise ValueError('No file selected for Word to PDF.')
    
    original_filename = file_stream.filename
    if not check_allowed_file(original_filename, ALLOWED_EXTENSIONS_WORD):
        raise ValueError(f"Invalid file type for Word to PDF: {original_filename}. Only .doc or .docx allowed.")

    original_filename_secure = secure_filename(original_filename)
    request_temp_folder = create_temp_folder("word2pdf_temp")
    
    try:
        temp_input_filepath = save_uploaded_file(file_stream, request_temp_folder)
        
        output_filename_base = os.path.splitext(original_filename_secure)[0]
        output_pdf_filename = f"{output_filename_base}_{uuid.uuid4().hex[:6]}.pdf"
        output_pdf_filepath = os.path.join(current_app.config['CONVERTED_FILES_FOLDER'], output_pdf_filename)

        convert_docx_to_pdf(temp_input_filepath, output_pdf_filepath)
        
        if not os.path.exists(output_pdf_filepath):
            # This error might indicate docx2pdf failed, possibly due to LibreOffice/MS Office issues
            raise Exception("Word to PDF conversion failed, output file not created. This might be due to LibreOffice or MS Office not being installed or accessible.")

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
                current_app.logger.error(f"Error cleaning temp folder {request_temp_folder} for word_to_pdf: {e_clean}")