# backend/blueprints/pdf_operations/pdf_to_word_handler.py
import os
import uuid
import shutil
from flask import current_app
from werkzeug.utils import secure_filename
from pdf2docx import Converter as ConvertDocx # Using the alias from your original code
from .utils import check_allowed_file, create_temp_folder, save_uploaded_file

ALLOWED_EXTENSIONS_PDF = {'pdf'}

def handle_pdf_to_word(request_files, request_form):
    if 'files' not in request_files:
        return {'success': False, 'error': 'No file part in the request'}, 400
    
    file_stream = request_files.getlist('files')[0]
    if not file_stream or not file_stream.filename:
        raise ValueError('No file selected for PDF to Word.')
    if not check_allowed_file(file_stream.filename, ALLOWED_EXTENSIONS_PDF):
        raise ValueError('Invalid file type for PDF to Word. Only PDF files are allowed.')

    original_filename_secure = secure_filename(file_stream.filename)
    request_temp_folder = create_temp_folder("pdf2word_temp")

    try:
        temp_input_filepath = save_uploaded_file(file_stream, request_temp_folder)
        
        output_docx_filename_base = os.path.splitext(original_filename_secure)[0]
        output_docx_filename = f"{output_docx_filename_base}_{uuid.uuid4().hex[:6]}.docx"
        output_docx_filepath = os.path.join(current_app.config['CONVERTED_FILES_FOLDER'], output_docx_filename)

        cv = ConvertDocx(temp_input_filepath)
        cv.convert(output_docx_filepath)
        cv.close()
        
        response_data = {
            'success': True, 
            'message': f"Successfully converted '{original_filename_secure}' to Word (DOCX).",
            'download_url': f'/api/download/{output_docx_filename}', 
            'filename': output_docx_filename
        }
        return response_data, 200
    except Exception as e:
        # pdf2docx can have specific errors, try to pass them on
        error_message = f'An error occurred during PDF to Word conversion: {str(e)}.'
        if "MultiPageError" in str(e) or "LayoutError" in str(e):
             error_message += " The PDF might have a very complex layout that could not be fully converted."
        # Instead of returning jsonify here, raise an exception that the main route can catch
        raise Exception(error_message) from e
    finally:
        if request_temp_folder and os.path.exists(request_temp_folder):
            try:
                shutil.rmtree(request_temp_folder)
            except OSError as e_clean:
                current_app.logger.error(f"Error cleaning temp folder {request_temp_folder} for pdf_to_word: {e_clean}")