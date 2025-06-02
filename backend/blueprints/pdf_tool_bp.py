# backend/blueprints/pdf_tool_bp.py
import os
import subprocess # Keep for general subprocess exceptions if needed
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename

# Import handlers from the pdf_operations package
from .pdf_operations.merge_handler import handle_merge
from .pdf_operations.compress_handler import handle_compress
from .pdf_operations.split_handler import handle_split
from .pdf_operations.rotate_handler import handle_rotate
from .pdf_operations.pdf_to_word_handler import handle_pdf_to_word
from .pdf_operations.images_to_pdf_handler import handle_images_to_pdf
from .pdf_operations.word_to_pdf_handler import handle_word_to_pdf
from .pdf_operations.excel_to_pdf_handler import handle_excel_to_pdf
from .pdf_operations.ppt_to_pdf_handler import handle_ppt_to_pdf
from .pdf_operations.text_to_pdf_handler import handle_text_to_pdf
from .pdf_operations.html_to_pdf_handler import handle_html_to_pdf
from .pdf_operations.pdf_to_excel_handler import handle_pdf_to_excel
from .pdf_operations.pdf_to_ppt_handler import handle_pdf_to_ppt
from .pdf_operations.pdf_to_image_handler import handle_pdf_to_image
from .pdf_operations.pdf_to_text_handler import handle_pdf_to_text
from .pdf_operations.delete_pages_handler import handle_delete_pages
from .pdf_operations.add_page_numbers_handler import handle_add_page_numbers
from .pdf_operations.extract_pages_handler import handle_extract_pages
from .pdf_operations.protect_pdf_handler import handle_protect_pdf
from .pdf_operations.unlock_pdf_handler import handle_unlock_pdf
# Import other handlers as you create them

pdf_tool_bp = Blueprint('pdf_tool_bp', __name__)

# Global allowed extensions can be defined here if truly global,
# or each handler can define its own if they are very specific.
# For now, handlers manage their own.

OPERATION_HANDLERS = {
    'merge': handle_merge,
    'compress': handle_compress,
    'split': handle_split,
    'rotate': handle_rotate,
    'pdf_to_word': handle_pdf_to_word,
    'images_to_pdf': handle_images_to_pdf,
    'word_to_pdf': handle_word_to_pdf,
    'excel_to_pdf': handle_excel_to_pdf,
    'ppt_to_pdf': handle_ppt_to_pdf,
    'text_to_pdf': handle_text_to_pdf,   
    'html_to_pdf': handle_html_to_pdf, 
    'pdf_to_excel': handle_pdf_to_excel,
    'pdf_to_ppt': handle_pdf_to_ppt,
     'pdf_to_image': handle_pdf_to_image,
    'pdf_to_text': handle_pdf_to_text,
    'delete_pages': handle_delete_pages,
    'add_page_numbers': handle_add_page_numbers,
    'extract_pages': handle_extract_pages,
    'protect_pdf': handle_protect_pdf,
    'unlock_pdf': handle_unlock_pdf,

    # Add other operations here
}

@pdf_tool_bp.route('/process_pdf', methods=['POST'])
def process_pdf_route():
    if 'operation' not in request.form:
        return jsonify({'success': False, 'error': 'No operation specified'}), 400

    operation = request.form.get('operation')
    
    original_filename_for_logging = "unknown_file"
    if 'files' in request.files:
        files_list = request.files.getlist('files')
        if files_list and files_list[0] and files_list[0].filename:
            original_filename_for_logging = secure_filename(files_list[0].filename)

    if operation not in OPERATION_HANDLERS:
        return jsonify({'success': False, 'error': 'Invalid operation specified'}), 400

    handler = OPERATION_HANDLERS[operation]

    try:
        # Pass request.files and request.form to the handler
        # The handler is responsible for its own temp file management and specific logic
        response_data, status_code = handler(request.files, request.form)
        return jsonify(response_data), status_code
    
    except ValueError as ve: # Catch validation errors raised by handlers
        current_app.logger.warning(f"Validation Error during '{operation}' for file '{original_filename_for_logging}': {str(ve)}")
        # Pass totalPages if the ValueError instance has it (set by parse_page_ranges for example)
        return jsonify({'success': False, 'error': str(ve), 'totalPages': getattr(ve, 'totalPages', 0)}), 400
    except FileNotFoundError as fnfe: # Catch if a required tool (like soffice) is not found
        current_app.logger.error(f"Tool Not Found Error during '{operation}' for file '{original_filename_for_logging}': {str(fnfe)}")
        return jsonify({'success': False, 'error': str(fnfe)}), 500 # Let handler's message be used
    except subprocess.TimeoutExpired:
        current_app.logger.error(f"Process timed out during '{operation}' for file '{original_filename_for_logging}'")
        return jsonify({'success': False, 'error': f'{operation.replace("_", " ").title()} conversion timed out. File might be too large/complex.'}), 500
    except Exception as e: # Catch all other unexpected errors from handlers
        current_app.logger.error(f"Unexpected Error during '{operation}' for file '{original_filename_for_logging}': {str(e)}", exc_info=True)
        # Consider if handlers should return totalPages for generic errors or if it's too broad
        return jsonify({'success': False, 'error': f'An unexpected error occurred in {operation}: {str(e)}'}), 500

@pdf_tool_bp.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    try:
        safe_filename = secure_filename(filename)
        if ".." in safe_filename or safe_filename.startswith("/"):
            current_app.logger.warning(f"Attempt to download potentially unsafe file: {filename}")
            return jsonify({'success': False, 'error': 'Invalid filename'}), 400
        return send_from_directory(
            current_app.config['CONVERTED_FILES_FOLDER'], safe_filename, as_attachment=True
        )
    except FileNotFoundError:
        current_app.logger.info(f"Download failed: File not found - {filename}")
        return jsonify({'success': False, 'error': 'File not found.'}), 404
    except Exception as e:
        current_app.logger.error(f"Error during download of {filename}: {str(e)}")
        return jsonify({'success': False, 'error': 'An error occurred while downloading the file.'}), 500