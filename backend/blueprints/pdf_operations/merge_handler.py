# backend/blueprints/pdf_operations/merge_handler.py
import os
import uuid
import shutil
from flask import current_app
from werkzeug.utils import secure_filename
from pypdf import PdfWriter
from .utils import check_allowed_file, create_temp_folder # Assuming create_temp_folder is in utils

ALLOWED_EXTENSIONS_PDF = {'pdf'}

def handle_merge(request_files, request_form):
    if 'files' not in request_files:
        return {'success': False, 'error': 'No files part in the request'}, 400
    
    files = request_files.getlist('files')
    if not files or len(files) < 2:
        return {'success': False, 'error': 'Please select at least two PDF files to merge'}, 400

    merger = PdfWriter()
    uploaded_file_paths_in_temp = [] # Store paths of files saved in temp_dir
    request_temp_folder = create_temp_folder("merge_temp")

    try:
        for i, file_stream in enumerate(files):
            if file_stream and check_allowed_file(file_stream.filename, ALLOWED_EXTENSIONS_PDF):
                original_filename = file_stream.filename
                # Save files into the request_temp_folder
                safe_filename = f"{i}_{secure_filename(original_filename)}"
                filepath = os.path.join(request_temp_folder, safe_filename)
                file_stream.save(filepath)
                uploaded_file_paths_in_temp.append(filepath)
            elif file_stream and file_stream.filename:
                raise ValueError(f"Invalid file type for merge: {file_stream.filename}. Only PDF files allowed.")
            else:
                raise ValueError("Empty or invalid file stream encountered during merge.")
        
        for pdf_path in uploaded_file_paths_in_temp:
            merger.append(pdf_path)

        output_filename = f"merged_{uuid.uuid4().hex[:8]}.pdf"
        output_filepath = os.path.join(current_app.config['CONVERTED_FILES_FOLDER'], output_filename)
        
        with open(output_filepath, "wb") as f_out:
            merger.write(f_out)
        merger.close()

        response_data = {
            'success': True, 
            'message':'Files merged successfully!',
            'download_url': f'/api/download/{output_filename}', 
            'filename': output_filename
        }
        return response_data, 200
    finally:
        if request_temp_folder and os.path.exists(request_temp_folder):
            try:
                shutil.rmtree(request_temp_folder)
            except OSError as e_clean:
                current_app.logger.error(f"Error cleaning temp folder {request_temp_folder} for merge: {e_clean}")