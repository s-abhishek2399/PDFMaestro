# backend/blueprints/pdf_operations/excel_to_pdf_handler.py
import os
import uuid
import subprocess
import shutil
from flask import current_app, jsonify
from werkzeug.utils import secure_filename
from .utils import check_allowed_file, create_temp_folder, save_uploaded_file # Import from local utils

ALLOWED_EXTENSIONS_EXCEL = {'xls', 'xlsx'} # Specific to this handler

def handle_excel_to_pdf(request_files, request_form):
    """
    Handles the Excel to PDF conversion.
    request_files: request.files from Flask
    request_form: request.form from Flask (if any options are needed)
    Returns: A tuple (dictionary_for_jsonify, status_code)
    """
    if 'files' not in request_files:
        return {'success': False, 'error': 'No file part in the request'}, 400
    
    file_stream = request_files.getlist('files')[0]

    if not file_stream or not file_stream.filename:
        raise ValueError('No file selected for Excel to PDF.')
    
    original_filename = file_stream.filename
    if not check_allowed_file(original_filename, ALLOWED_EXTENSIONS_EXCEL):
        raise ValueError(f"Invalid file type for Excel to PDF: {original_filename}. Only .xls or .xlsx allowed.")
    
    original_filename_secure = secure_filename(original_filename)
    
    request_temp_folder = create_temp_folder("excel2pdf_temp") # Use helper
    
    try:
        temp_input_filepath = save_uploaded_file(file_stream, request_temp_folder) # Use helper
        
        output_filename_base = os.path.splitext(original_filename_secure)[0]
        soffice_intermediate_pdf_name = f"{output_filename_base}.pdf" 
        soffice_intermediate_pdf_path = os.path.join(request_temp_folder, soffice_intermediate_pdf_name)
        final_output_pdf_filename = f"{output_filename_base}_{uuid.uuid4().hex[:6]}.pdf"
        final_output_pdf_filepath = os.path.join(current_app.config['CONVERTED_FILES_FOLDER'], final_output_pdf_filename)
        
        cmd = ['soffice', '--headless', '--convert-to', 'pdf', '--outdir', request_temp_folder, temp_input_filepath]
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate(timeout=90)

        if process.returncode != 0:
            error_detail = stderr.decode('utf-8', errors='ignore').strip()
            if "No such file or directory" in error_detail or "not found" in error_detail.lower() or process.returncode == 127:
                # This specific error should ideally be caught and re-raised by the main route if it's generic
                raise FileNotFoundError("LibreOffice (soffice) command not found. Ensure it's installed and in system PATH.")
            raise Exception(f"Excel to PDF conversion failed (LibreOffice error). Details: {error_detail or 'Unknown error'}")
        
        if not os.path.exists(soffice_intermediate_pdf_path):
            raise Exception(f"LibreOffice conversion product not found: {soffice_intermediate_pdf_path}")
        
        shutil.move(soffice_intermediate_pdf_path, final_output_pdf_filepath)
        
        response_data = {
            'success': True, 
            'message': f"Successfully converted '{original_filename_secure}' to PDF.",
            'download_url': f'/api/download/{final_output_pdf_filename}', 
            'filename': final_output_pdf_filename
        }
        return response_data, 200

    finally:
        if request_temp_folder and os.path.exists(request_temp_folder):
            try:
                shutil.rmtree(request_temp_folder)
            except OSError as e_clean:
                current_app.logger.error(f"Error cleaning temp folder {request_temp_folder} for excel_to_pdf: {e_clean}")