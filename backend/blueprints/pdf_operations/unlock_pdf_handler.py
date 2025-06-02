# backend/blueprints/pdf_operations/unlock_pdf_handler.py
import os
import uuid
import shutil
from flask import current_app
from werkzeug.utils import secure_filename
from pypdf import PdfReader, PdfWriter
from pypdf.errors import FileNotDecryptedError
from .utils import check_allowed_file, create_temp_folder, save_uploaded_file

ALLOWED_EXTENSIONS_PDF = {'pdf'}

def handle_unlock_pdf(request_files, request_form):
    if 'files' not in request_files:
        return {'success': False, 'error': 'No file part in the request'}, 400
    
    file_stream = request_files.getlist('files')[0]
    if not file_stream or not file_stream.filename:
        raise ValueError('No file selected for unlocking.')
    
    original_filename = file_stream.filename
    if not check_allowed_file(original_filename, ALLOWED_EXTENSIONS_PDF):
        raise ValueError(f"Invalid file type: {original_filename}. Only PDF files are allowed.")

    password = request_form.get('password', '')
    if not password:
        # Some PDFs might be encrypted with an empty user password (owner password still set).
        # pypdf's decrypt('') handles this.
        # However, usually a password is required if user password protection is set.
        # Let's assume for this tool, if it's user-password protected, a password must be supplied.
        # If only owner-password protected with restrictions, decrypt('') might remove restrictions.
        current_app.logger.info("Attempting to unlock PDF with an empty password (might work for owner-only protection).")


    original_filename_secure = secure_filename(original_filename)
    request_temp_folder = create_temp_folder("unlock_pdf_temp")
    
    try:
        temp_input_filepath = save_uploaded_file(file_stream, request_temp_folder)
        
        reader = PdfReader(temp_input_filepath)

        if not reader.is_encrypted:
            raise ValueError("The PDF file is not encrypted. No need to unlock.")

        # Attempt to decrypt
        if reader.decrypt(password) == 0: # 0 means decryption failed for pypdf
             # Try with common empty owner password if user provides empty and fails
            if password == "" and reader.decrypt("") == 0: # Still fails with empty string for user
                 raise ValueError("Incorrect password, or the PDF uses an unsupported encryption algorithm.")
            elif password != "":
                 raise ValueError("Incorrect password provided for unlocking the PDF.")
        
        # If decryption was successful (non-zero return, or no exception for pypdf)
        # For pypdf >= 3.0.0, decrypt returns an Enum: PasswordType.OWNER_PASSWORD, .USER_PASSWORD, or .NOT_DECRYPTED
        # We need to check if it's successfully decrypted for copying.
        # A simpler check: after decrypt, try accessing pages.
        try:
            _ = reader.pages[0] # Try accessing a page to confirm decryption
        except FileNotDecryptedError: # pypdf specific
            raise ValueError("Incorrect password. Unable to decrypt the PDF.")
        except IndexError: # Empty PDF
            raise ValueError("PDF is empty after attempted decryption.")


        writer = PdfWriter()
        # writer.clone_reader_document(reader) # This is a good way to copy everything
        for page in reader.pages:
            writer.add_page(page)
        
        metadata = reader.metadata
        if metadata:
            writer.add_metadata(metadata)
        # Note: writer.encrypt("") with an empty password is NOT how you remove encryption with pypdf.
        # Simply writing the decrypted content to a new writer without calling encrypt() saves it unencrypted.

        output_filename_base = os.path.splitext(original_filename_secure)[0]
        output_pdf_filename = f"{output_filename_base}_unlocked_{uuid.uuid4().hex[:6]}.pdf"
        output_pdf_filepath = os.path.join(current_app.config['CONVERTED_FILES_FOLDER'], output_pdf_filename)
        
        with open(output_pdf_filepath, "wb") as f_out:
            writer.write(f_out)

        response_data = {
            'success': True, 
            'message': f"Successfully unlocked '{original_filename_secure}'.",
            'download_url': f'/api/download/{output_pdf_filename}', 
            'filename': output_pdf_filename
        }
        return response_data, 200
    finally:
        if request_temp_folder and os.path.exists(request_temp_folder):
            try:
                shutil.rmtree(request_temp_folder)
            except OSError as e_clean:
                current_app.logger.error(f"Error cleaning temp folder {request_temp_folder} for unlock_pdf: {e_clean}")