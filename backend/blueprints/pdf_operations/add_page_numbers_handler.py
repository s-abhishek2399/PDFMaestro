# backend/blueprints/pdf_operations/add_page_numbers_handler.py
import os
import uuid
import shutil
from io import BytesIO
from flask import current_app
from werkzeug.utils import secure_filename
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.pagesizes import letter # or other default
from reportlab.lib.colors import black, gray # Example colors
from .utils import check_allowed_file, create_temp_folder, save_uploaded_file

ALLOWED_EXTENSIONS_PDF = {'pdf'}

def handle_add_page_numbers(request_files, request_form):
    if 'files' not in request_files:
        return {'success': False, 'error': 'No file part in the request'}, 400
    
    file_stream = request_files.getlist('files')[0]
    if not file_stream or not file_stream.filename:
        raise ValueError('No file selected for adding page numbers.')
    
    original_filename = file_stream.filename
    if not check_allowed_file(original_filename, ALLOWED_EXTENSIONS_PDF):
        raise ValueError(f"Invalid file type: {original_filename}. Only PDF files are allowed.")

    # Options from frontend (examples)
    position = request_form.get('position', 'bottom_right') # e.g., bottom_center, top_left
    start_page = int(request_form.get('startPage', 1)) # 1-based page to start numbering from
    number_format = request_form.get('numberFormat', '{current_page} of {total_pages}') # e.g., Page {current_page}
    font_name = request_form.get('fontName', 'Helvetica')
    font_size = int(request_form.get('fontSize', 10))
    margin_str = request_form.get('margin', '0.5') # Margin from edge in inches
    try:
        margin = float(margin_str) * inch
    except ValueError:
        raise ValueError("Invalid margin value. Must be a number.")


    original_filename_secure = secure_filename(original_filename)
    request_temp_folder = create_temp_folder("add_numbers_temp")
    
    try:
        temp_input_filepath = save_uploaded_file(file_stream, request_temp_folder)
        
        reader = PdfReader(temp_input_filepath)
        writer = PdfWriter()
        num_total_pages = len(reader.pages)

        if num_total_pages == 0:
            raise ValueError("The PDF file appears to be empty or corrupted.")
        
        if start_page < 1 or start_page > num_total_pages:
            raise ValueError(f"Start page ({start_page}) is out of range (1-{num_total_pages}).")

        for i in range(num_total_pages):
            page = reader.pages[i]
            
            # Only add number if current page is >= start_page
            if (i + 1) >= start_page:
                packet = BytesIO()
                # Create a new PDF with Reportlab
                media_box = page.mediabox
                can = canvas.Canvas(packet, pagesize=(media_box.width, media_box.height))
                
                # Format the page number string
                current_page_display = i + 1 # Or could be (i + 1) - start_page + 1 if numbering should reset
                page_number_text = number_format.replace('{current_page}', str(current_page_display)).replace('{total_pages}', str(num_total_pages))
                
                can.setFont(font_name, font_size)
                # can.setFillColor(gray) # Example color

                text_width = can.stringWidth(page_number_text, font_name, font_size)
                
                # Position calculation
                x, y = 0, 0
                if position == 'bottom_right':
                    x = media_box.width - margin - text_width
                    y = margin
                elif position == 'bottom_center':
                    x = (media_box.width - text_width) / 2
                    y = margin
                elif position == 'bottom_left':
                    x = margin
                    y = margin
                elif position == 'top_right':
                    x = media_box.width - margin - text_width
                    y = media_box.height - margin - font_size # Adjust for font ascent
                elif position == 'top_center':
                    x = (media_box.width - text_width) / 2
                    y = media_box.height - margin - font_size
                elif position == 'top_left':
                    x = margin
                    y = media_box.height - margin - font_size
                else: # Default to bottom_right
                    x = media_box.width - margin - text_width
                    y = margin

                can.drawString(x, y, page_number_text)
                can.save()

                # Move to the beginning of the StringIO buffer
                packet.seek(0)
                new_pdf_page = PdfReader(packet).pages[0]
                
                # Merge the new page (with number) onto the original page
                page.merge_page(new_pdf_page)
            
            writer.add_page(page)

        output_filename_base = os.path.splitext(original_filename_secure)[0]
        output_pdf_filename = f"{output_filename_base}_numbered_{uuid.uuid4().hex[:6]}.pdf"
        output_pdf_filepath = os.path.join(current_app.config['CONVERTED_FILES_FOLDER'], output_pdf_filename)
        
        with open(output_pdf_filepath, "wb") as f_out:
            writer.write(f_out)

        response_data = {
            'success': True, 
            'message': f"Successfully added page numbers to the PDF.",
            'download_url': f'/api/download/{output_pdf_filename}', 
            'filename': output_pdf_filename,
            'totalPages': num_total_pages
        }
        return response_data, 200
    finally:
        if request_temp_folder and os.path.exists(request_temp_folder):
            try:
                shutil.rmtree(request_temp_folder)
            except OSError as e_clean:
                current_app.logger.error(f"Error cleaning temp folder {request_temp_folder} for add_page_numbers: {e_clean}")