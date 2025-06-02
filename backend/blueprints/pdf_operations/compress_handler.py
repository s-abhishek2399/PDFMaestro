# backend/blueprints/pdf_operations/compress_handler.py
import os
import uuid
import shutil
from flask import current_app
from werkzeug.utils import secure_filename
from pypdf import PdfReader, PdfWriter
from .utils import check_allowed_file, format_file_size_py, create_temp_folder, save_uploaded_file

ALLOWED_EXTENSIONS_PDF = {'pdf'}

def handle_compress(request_files, request_form):
    if 'files' not in request_files:
        return {'success': False, 'error': 'No file part in the request'}, 400
    
    file_stream = request_files.getlist('files')[0]
    if not file_stream or not file_stream.filename:
        raise ValueError('No file selected for uploading.')
    if not check_allowed_file(file_stream.filename, ALLOWED_EXTENSIONS_PDF):
        raise ValueError('Invalid file type for compress. Only PDF files are allowed.')

    original_filename = secure_filename(file_stream.filename)
    request_temp_folder = create_temp_folder("compress_temp")
    
    try:
        temp_input_filepath = save_uploaded_file(file_stream, request_temp_folder)
        original_size_bytes = os.path.getsize(temp_input_filepath)

        reader = PdfReader(temp_input_filepath)
        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)
        
        # Note: PyPDF2's compression is primarily structural. 
        # compression_level from form could be used for more advanced logic if implemented (e.g. with Ghostscript)
        # For now, it just re-writes the PDF, which itself can optimize.
        # compression_level_form = request_form.get('compressionLevel', 'medium') 

        output_filename = f"compressed_{uuid.uuid4().hex[:8]}_{original_filename}"
        output_filepath = os.path.join(current_app.config['CONVERTED_FILES_FOLDER'], output_filename)
        with open(output_filepath, "wb") as f_out:
            writer.write(f_out)
        
        compressed_size_bytes = os.path.getsize(output_filepath)
        original_size_formatted = format_file_size_py(original_size_bytes)
        compressed_size_formatted = format_file_size_py(compressed_size_bytes)
        reduction_percent = round(((original_size_bytes - compressed_size_bytes) / original_size_bytes) * 100, 1) if original_size_bytes > 0 else 0

        response_data = {
            'success': True, 
            'message': f"Compression successful! Original: {original_size_formatted}, New: {compressed_size_formatted} (Reduced by {reduction_percent}%)",
            'download_url': f'/api/download/{output_filename}', 
            'filename': output_filename,
            'original_size': original_size_formatted, 
            'compressed_size': compressed_size_formatted,
            'reduction_percent': reduction_percent
        }
        return response_data, 200
    finally:
        if request_temp_folder and os.path.exists(request_temp_folder):
            try:
                shutil.rmtree(request_temp_folder)
            except OSError as e_clean:
                current_app.logger.error(f"Error cleaning temp folder {request_temp_folder} for compress: {e_clean}")