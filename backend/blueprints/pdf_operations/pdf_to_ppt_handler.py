# backend/blueprints/pdf_operations/pdf_to_ppt_handler.py
import os
import uuid
import subprocess
import shutil
from flask import current_app
from werkzeug.utils import secure_filename
from .utils import check_allowed_file, create_temp_folder, save_uploaded_file

ALLOWED_EXTENSIONS_PDF = {'pdf'}

def handle_pdf_to_ppt(request_files, request_form):
    if 'files' not in request_files:
        return {'success': False, 'error': 'No file part in the request'}, 400
    
    file_stream = request_files.getlist('files')[0]
    if not file_stream or not file_stream.filename:
        raise ValueError('No file selected for PDF to PPT.')
    
    original_filename = file_stream.filename
    if not check_allowed_file(original_filename, ALLOWED_EXTENSIONS_PDF):
        raise ValueError(f"Invalid file type: {original_filename}. Only PDF files are allowed.")

    original_filename_secure = secure_filename(original_filename)
    request_temp_folder = create_temp_folder("pdf2ppt_temp")
    
    try:
        temp_input_filepath = save_uploaded_file(file_stream, request_temp_folder)
        
        output_filename_base = os.path.splitext(original_filename_secure)[0]
        # LibreOffice will create a PPTX with the same base name in the --outdir
        soffice_intermediate_pptx_name = f"{output_filename_base}.pptx" 
        soffice_intermediate_pptx_path = os.path.join(request_temp_folder, soffice_intermediate_pptx_name)

        final_output_pptx_filename = f"{output_filename_base}_{uuid.uuid4().hex[:6]}.pptx"
        final_output_pptx_filepath = os.path.join(current_app.config['CONVERTED_FILES_FOLDER'], final_output_pptx_filename)
        
        cmd = [
            'soffice', 
            '--headless',
            '--infilter=impress_pdf_import', # Specific filter for PDF import to Impress
            '--convert-to', 'pptx', # Convert to pptx format
            '--outdir', request_temp_folder,
            temp_input_filepath
        ]
        
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate(timeout=120) # Timeout for potentially complex PDFs

        if process.returncode != 0:
            error_detail = stderr.decode('utf-8', errors='ignore').strip()
            if "No such file or directory" in error_detail or "not found" in error_detail.lower() or process.returncode == 127:
                raise FileNotFoundError("LibreOffice (soffice) command not found. Ensure it's installed and in system PATH.")
            raise Exception(f"PDF to PPT conversion failed (LibreOffice error). Details: {error_detail or 'Unknown error'}")
        
        if not os.path.exists(soffice_intermediate_pptx_path):
            raise Exception(f"LibreOffice conversion product (PPTX) not found: {soffice_intermediate_pptx_path}. The PDF might be unsuitable for PPT conversion or an issue occurred.")
        
        shutil.move(soffice_intermediate_pptx_path, final_output_pptx_filepath)
        
        response_data = {
            'success': True, 
            'message': f"Successfully converted '{original_filename_secure}' to PowerPoint (PPTX).",
            'download_url': f'/api/download/{final_output_pptx_filename}', 
            'filename': final_output_pptx_filename
        }
        return response_data, 200
    finally:
        if request_temp_folder and os.path.exists(request_temp_folder):
            try:
                shutil.rmtree(request_temp_folder)
            except OSError as e_clean:
                current_app.logger.error(f"Error cleaning temp folder {request_temp_folder} for pdf_to_ppt: {e_clean}")