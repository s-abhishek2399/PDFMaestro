# backend/blueprints/pdf_operations/split_handler.py
import os
import uuid
import shutil
import zipfile
from flask import current_app
from werkzeug.utils import secure_filename
from pypdf import PdfReader, PdfWriter
from .utils import check_allowed_file, parse_page_ranges, create_temp_folder, save_uploaded_file

ALLOWED_EXTENSIONS_PDF = {'pdf'}

def handle_split(request_files, request_form):
    if 'files' not in request_files:
        return {'success': False, 'error': 'No file part in the request'}, 400
    
    file_stream = request_files.getlist('files')[0]
    if not file_stream or not file_stream.filename:
        raise ValueError('No file selected for split.')
    if not check_allowed_file(file_stream.filename, ALLOWED_EXTENSIONS_PDF):
        raise ValueError('Invalid file type for split. Only PDF allowed.')

    original_filename_secure = secure_filename(file_stream.filename)
    request_temp_folder = create_temp_folder("split_temp")

    try:
        temp_input_filepath = save_uploaded_file(file_stream, request_temp_folder)
        reader = PdfReader(temp_input_filepath)
        num_total_pages = len(reader.pages)
        if num_total_pages == 0:
            raise ValueError("The uploaded PDF for split appears to be empty or corrupted.")

        split_mode = request_form.get('splitMode', 'extract')
        page_ranges_str = request_form.get('pageRanges', '')
        output_filename_base = os.path.splitext(original_filename_secure)[0]
        message_text, output_filename = "", ""

        if split_mode == 'extract':
            selected_page_indices = parse_page_ranges(page_ranges_str, num_total_pages)
            if not selected_page_indices:
                # Attach totalPages to ValueError for better frontend context
                ve = ValueError(f"No valid pages selected for split. PDF has {num_total_pages} pages.")
                setattr(ve, 'totalPages', num_total_pages) # Add attribute
                raise ve
                
            writer = PdfWriter()
            for page_index in selected_page_indices:
                writer.add_page(reader.pages[page_index])
            output_filename = f"extracted_{output_filename_base}_{uuid.uuid4().hex[:6]}.pdf"
            output_filepath = os.path.join(current_app.config['CONVERTED_FILES_FOLDER'], output_filename)
            with open(output_filepath, "wb") as f_out:
                writer.write(f_out)
            message_text = f"Successfully extracted {len(selected_page_indices)} page(s)."

        elif split_mode == 'split_all':
            if num_total_pages == 1:
                writer = PdfWriter()
                writer.add_page(reader.pages[0])
                output_filename = f"page_1_of_{output_filename_base}_{uuid.uuid4().hex[:6]}.pdf"
                output_filepath = os.path.join(current_app.config['CONVERTED_FILES_FOLDER'], output_filename)
                with open(output_filepath, "wb") as f_out:
                    writer.write(f_out)
                message_text = "PDF has 1 page. Single page PDF created."
            else:
                zip_filename = f"split_all_{output_filename_base}_{uuid.uuid4().hex[:6]}.zip"
                zip_filepath = os.path.join(current_app.config['CONVERTED_FILES_FOLDER'], zip_filename)
                individual_pdfs_temp_dir = os.path.join(request_temp_folder, "individual_pages")
                os.makedirs(individual_pdfs_temp_dir, exist_ok=True)
                
                for i in range(num_total_pages):
                    writer = PdfWriter()
                    writer.add_page(reader.pages[i])
                    page_pdf_filename = f"page_{i+1}_of_{output_filename_base}.pdf"
                    page_pdf_filepath = os.path.join(individual_pdfs_temp_dir, page_pdf_filename)
                    with open(page_pdf_filepath, "wb") as f_page:
                        writer.write(f_page)
                
                with zipfile.ZipFile(zip_filepath, 'w', zipfile.ZIP_DEFLATED) as zipf:
                    for item in os.listdir(individual_pdfs_temp_dir):
                        zipf.write(os.path.join(individual_pdfs_temp_dir, item), arcname=item)
                output_filename = zip_filename
                message_text = f"Successfully split into {num_total_pages} pages and zipped."
        else:
            raise ValueError('Invalid split mode specified.')

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
                current_app.logger.error(f"Error cleaning temp folder {request_temp_folder} for split: {e_clean}")