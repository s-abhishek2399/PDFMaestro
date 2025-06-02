# backend/blueprints/pdf_operations/rotate_handler.py
import os
import uuid
import shutil
from flask import current_app
from werkzeug.utils import secure_filename
from pypdf import PdfReader, PdfWriter
from .utils import check_allowed_file, parse_page_ranges, create_temp_folder, save_uploaded_file

ALLOWED_EXTENSIONS_PDF = {'pdf'}

def handle_rotate(request_files, request_form):
    if 'files' not in request_files:
        return {'success': False, 'error': 'No file part in the request'}, 400
    
    file_stream = request_files.getlist('files')[0]
    if not file_stream or not file_stream.filename:
        raise ValueError('No file selected for rotate.')
    if not check_allowed_file(file_stream.filename, ALLOWED_EXTENSIONS_PDF):
        raise ValueError('Invalid file type for rotate. Only PDF allowed.')

    angle_str = request_form.get('angle', '90')
    try:
        angle = int(angle_str)
    except ValueError:
        raise ValueError('Invalid angle value provided.')
    
    if angle == 270: angle = -90 # Normalize 270 to -90 for pypdf
    if angle not in [90, -90, 180]:
        raise ValueError("Invalid rotation angle. Must be 90, -90 (or 270), or 180.")

    original_filename_secure = secure_filename(file_stream.filename)
    request_temp_folder = create_temp_folder("rotate_temp")

    try:
        temp_input_filepath = save_uploaded_file(file_stream, request_temp_folder)
        reader = PdfReader(temp_input_filepath) # This is where PdfStreamError might happen if file is bad
        writer = PdfWriter()
        num_total_pages = len(reader.pages)
        if num_total_pages == 0:
            raise ValueError("The uploaded PDF for rotate appears to be empty or corrupted.")

        page_selection_mode = request_form.get('pageSelectionMode', 'all')
        pages_to_rotate_str = request_form.get('pagesToRotate', '')
        
        pages_to_actually_rotate_indices = []
        if page_selection_mode == 'all':
            pages_to_actually_rotate_indices = list(range(num_total_pages))
        elif page_selection_mode == 'specific':
            pages_to_actually_rotate_indices = parse_page_ranges(pages_to_rotate_str, num_total_pages)
            if not pages_to_actually_rotate_indices:
                 ve = ValueError("No valid pages selected for rotation.")
                 setattr(ve, 'totalPages', num_total_pages)
                 raise ve
        else:
            raise ValueError("Invalid page selection mode.")

        for i, page in enumerate(reader.pages):
            if i in pages_to_actually_rotate_indices:
                writer.add_page(page.rotate(angle))
            else:
                writer.add_page(page)
        
        output_filename_base = os.path.splitext(original_filename_secure)[0]
        output_filename = f"rotated_{output_filename_base}_{uuid.uuid4().hex[:6]}.pdf"
        output_filepath = os.path.join(current_app.config['CONVERTED_FILES_FOLDER'], output_filename)
        with open(output_filepath, "wb") as f_out:
            writer.write(f_out)
        
        message_text = (f"Successfully rotated {len(pages_to_actually_rotate_indices)} page(s) by {angle_str}°."
                        if page_selection_mode == 'specific' else f"Successfully rotated all pages by {angle_str}°.")
        
        response_data = {
            'success': True, 
            'message': message_text, 
            'totalPages': num_total_pages,
            'download_url': f'/api/download/{output_filename}', 
            'filename': output_filename
        }
        return response_data, 200
    finally:
        if request_temp_folder and os.path.exists(request_temp_folder):
            try:
                shutil.rmtree(request_temp_folder)
            except OSError as e_clean:
                current_app.logger.error(f"Error cleaning temp folder {request_temp_folder} for rotate: {e_clean}")