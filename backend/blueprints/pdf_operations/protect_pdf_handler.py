# backend/blueprints/pdf_operations/protect_pdf_handler.py
import os
import uuid
import shutil
from flask import current_app
from werkzeug.utils import secure_filename
from pypdf import PdfReader, PdfWriter
from .utils import check_allowed_file, create_temp_folder, save_uploaded_file

ALLOWED_EXTENSIONS_PDF = {'pdf'}

def handle_protect_pdf(request_files, request_form):
    if 'files' not in request_files:
        return {'success': False, 'error': 'No file part in the request'}, 400
    
    file_stream = request_files.getlist('files')[0]
    if not file_stream or not file_stream.filename:
        raise ValueError('No file selected for protection.')
    
    original_filename = file_stream.filename
    if not check_allowed_file(original_filename, ALLOWED_EXTENSIONS_PDF):
        raise ValueError(f"Invalid file type: {original_filename}. Only PDF files are allowed.")

    password = request_form.get('password', '')
    if not password:
        raise ValueError("Password is required to protect the PDF.")
    if len(password) < 4: # Example minimum length
        raise ValueError("Password must be at least 4 characters long.")
    
    # Optional: Add owner password and permissions if needed
    # owner_password = request_form.get('ownerPassword', None) # If you want separate owner/user passwords
    # permissions = request_form.getlist('permissions') # e.g. ['print', 'modify']
    # For simplicity, we'll use the same password for user and owner, allowing all by default once opened.

    original_filename_secure = secure_filename(original_filename)
    request_temp_folder = create_temp_folder("protect_pdf_temp")
    
    try:
        temp_input_filepath = save_uploaded_file(file_stream, request_temp_folder)
        
        reader = PdfReader(temp_input_filepath)
        if reader.is_encrypted:
            # Decide how to handle already encrypted PDFs.
            # Option 1: Error out. Option 2: Try to decrypt if old_password provided, then re-encrypt.
            # For simplicity, let's error out if it's already encrypted without an option to decrypt first.
            # Or, just overwrite the encryption. PyPDF's encrypt() will overwrite.
            current_app.logger.info(f"PDF '{original_filename_secure}' is already encrypted. Re-encrypting with new password.")


        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)
        
        # Add metadata if you want to preserve it
        # metadata = reader.metadata
        # if metadata:
        #     writer.add_metadata(metadata)

        writer.encrypt(user_password=password, owner_password=None) # Using None for owner_password makes user_password the master
                                                                    # Or set owner_password=password for same effect
                                                                    # To set specific permissions, use the `permissions_flag` argument.

        output_filename_base = os.path.splitext(original_filename_secure)[0]
        output_pdf_filename = f"{output_filename_base}_protected_{uuid.uuid4().hex[:6]}.pdf"
        output_pdf_filepath = os.path.join(current_app.config['CONVERTED_FILES_FOLDER'], output_pdf_filename)
        
        with open(output_pdf_filepath, "wb") as f_out:
            writer.write(f_out)

        response_data = {
            'success': True, 
            'message': f"Successfully protected '{original_filename_secure}' with a password.",
            'download_url': f'/api/download/{output_pdf_filename}', 
            'filename': output_pdf_filename
        }
        return response_data, 200
    finally:
        if request_temp_folder and os.path.exists(request_temp_folder):
            try:
                shutil.rmtree(request_temp_folder)
            except OSError as e_clean:
                current_app.logger.error(f"Error cleaning temp folder {request_temp_folder} for protect_pdf: {e_clean}")