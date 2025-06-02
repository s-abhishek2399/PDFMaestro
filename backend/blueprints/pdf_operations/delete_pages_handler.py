# backend/blueprints/pdf_operations/delete_pages_handler.py
import os
import uuid
import shutil
from flask import current_app
from werkzeug.utils import secure_filename
from pypdf import PdfReader, PdfWriter
from .utils import check_allowed_file, parse_page_ranges, create_temp_folder, save_uploaded_file

ALLOWED_EXTENSIONS_PDF = {'pdf'}

def handle_delete_pages(request_files, request_form):
    if 'files' not in request_files:
        return {'success': False, 'error': 'No file part in the request'}, 400
    
    file_stream = request_files.getlist('files')[0]
    if not file_stream or not file_stream.filename:
        raise ValueError('No file selected for deleting pages.')
    
    original_filename = file_stream.filename
    if not check_allowed_file(original_filename, ALLOWED_EXTENSIONS_PDF):
        raise ValueError(f"Invalid file type: {original_filename}. Only PDF files are allowed.")

    pages_to_delete_str = request_form.get('pagesToDelete', '')
    if not pages_to_delete_str:
        raise ValueError("Please specify which page numbers to delete.")

    original_filename_secure = secure_filename(original_filename)
    request_temp_folder = create_temp_folder("delete_pages_temp")
    
    try:
        temp_input_filepath = save_uploaded_file(file_stream, request_temp_folder)
        
        reader = PdfReader(temp_input_filepath)
        writer = PdfWriter()
        num_total_pages = len(reader.pages)

        if num_total_pages == 0:
            raise ValueError("The PDF file appears to be empty or corrupted.")

        # Parse_page_ranges returns 0-based indices
        try:
            pages_to_delete_indices = parse_page_ranges(pages_to_delete_str, num_total_pages)
        except ValueError as ve:
            # Add totalPages to the error for better frontend context
            setattr(ve, 'totalPages', num_total_pages)
            raise ve


        if not pages_to_delete_indices:
            raise ValueError("No valid pages selected for deletion.")
        
        if len(pages_to_delete_indices) == num_total_pages:
            raise ValueError("Cannot delete all pages. To do this, just create an empty PDF or delete the file.")

        deleted_count = 0
        for i in range(num_total_pages):
            if i not in pages_to_delete_indices: # Add pages that are NOT in the delete list
                writer.add_page(reader.pages[i])
            else:
                deleted_count +=1
        
        if deleted_count == 0: # Should not happen if pages_to_delete_indices was valid and non-empty
             raise ValueError("Specified pages to delete were not found or already out of range.")


        output_filename_base = os.path.splitext(original_filename_secure)[0]
        output_pdf_filename = f"{output_filename_base}_pages_deleted_{uuid.uuid4().hex[:6]}.pdf"
        output_pdf_filepath = os.path.join(current_app.config['CONVERTED_FILES_FOLDER'], output_pdf_filename)
        
        with open(output_pdf_filepath, "wb") as f_out:
            writer.write(f_out)

        response_data = {
            'success': True, 
            'message': f"Successfully deleted {deleted_count} page(s). New PDF has {len(writer.pages)} pages.",
            'download_url': f'/api/download/{output_pdf_filename}', 
            'filename': output_pdf_filename,
            'totalPages': num_total_pages, # Original total pages
            'newTotalPages': len(writer.pages)
        }
        return response_data, 200
    finally:
        if request_temp_folder and os.path.exists(request_temp_folder):
            try:
                shutil.rmtree(request_temp_folder)
            except OSError as e_clean:
                current_app.logger.error(f"Error cleaning temp folder {request_temp_folder} for delete_pages: {e_clean}")