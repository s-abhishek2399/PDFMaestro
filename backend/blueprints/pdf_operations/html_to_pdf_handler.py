# backend/blueprints/pdf_operations/html_to_pdf_handler.py
import os
import uuid
import shutil
from flask import current_app
from werkzeug.utils import secure_filename
from weasyprint import HTML, CSS # Using WeasyPrint
# from weasyprint.fonts import FontConfiguration # If you need custom font configs
from .utils import check_allowed_file, create_temp_folder, save_uploaded_file

ALLOWED_EXTENSIONS_HTML = {'html', 'htm'}

def handle_html_to_pdf(request_files, request_form):
    if 'files' not in request_files:
        return {'success': False, 'error': 'No file part in the request'}, 400
    
    file_stream = request_files.getlist('files')[0]
    if not file_stream or not file_stream.filename:
        raise ValueError('No file selected for HTML to PDF.')
    
    original_filename = file_stream.filename
    if not check_allowed_file(original_filename, ALLOWED_EXTENSIONS_HTML):
        raise ValueError(f"Invalid file type: {original_filename}. Supported: {', '.join(ALLOWED_EXTENSIONS_HTML)}")

    original_filename_secure = secure_filename(original_filename)
    request_temp_folder = create_temp_folder("html2pdf_temp")
    
    try:
        temp_input_filepath = save_uploaded_file(file_stream, request_temp_folder)
        
        # WeasyPrint can take a filepath directly
        # For more complex scenarios with linked CSS/images within the HTML,
        # you might need to provide a base_url or handle them.
        # For a single HTML file upload, this should generally work.
        
        # Optional: Add a default stylesheet or allow user CSS
        # default_css = CSS(string='@page { size: A4; margin: 1in; } body { font-family: sans-serif; }')
        # html = HTML(filename=temp_input_filepath, base_url=request_temp_folder) # base_url can help resolve relative paths in HTML
        
        html_doc = HTML(filename=temp_input_filepath)

        output_filename_base = os.path.splitext(original_filename_secure)[0]
        output_pdf_filename = f"{output_filename_base}_{uuid.uuid4().hex[:6]}.pdf"
        output_pdf_filepath = os.path.join(current_app.config['CONVERTED_FILES_FOLDER'], output_pdf_filename)
        
        # html_doc.write_pdf(output_pdf_filepath, stylesheets=[default_css])
        html_doc.write_pdf(output_pdf_filepath)


        response_data = {
            'success': True, 
            'message': f"Successfully converted '{original_filename_secure}' to PDF.",
            'download_url': f'/api/download/{output_pdf_filename}', 
            'filename': output_pdf_filename
        }
        return response_data, 200
    except Exception as e:
        # WeasyPrint can raise various errors
        current_app.logger.error(f"WeasyPrint conversion error for {original_filename_secure}: {str(e)}")
        raise Exception(f"HTML to PDF conversion failed. Error: {str(e)}") from e
    finally:
        if request_temp_folder and os.path.exists(request_temp_folder):
            try:
                shutil.rmtree(request_temp_folder)
            except OSError as e_clean:
                current_app.logger.error(f"Error cleaning temp folder {request_temp_folder} for html_to_pdf: {e_clean}")