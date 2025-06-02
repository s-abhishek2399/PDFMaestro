# backend/blueprints/pdf_operations/pdf_to_image_handler.py
import os
import uuid
import shutil
import zipfile
from flask import current_app
from werkzeug.utils import secure_filename
from pdf2image import convert_from_path, exceptions as pdf2image_exceptions
from .utils import check_allowed_file, create_temp_folder, save_uploaded_file, parse_page_ranges

ALLOWED_EXTENSIONS_PDF = {'pdf'}

def handle_pdf_to_image(request_files, request_form):
    if 'files' not in request_files:
        return {'success': False, 'error': 'No file part in the request'}, 400
    
    file_stream = request_files.getlist('files')[0]
    if not file_stream or not file_stream.filename:
        raise ValueError('No file selected for PDF to Image conversion.')
    
    original_filename = file_stream.filename
    if not check_allowed_file(original_filename, ALLOWED_EXTENSIONS_PDF):
        raise ValueError(f"Invalid file type: {original_filename}. Only PDF files are allowed.")

    # Options from frontend
    image_format = request_form.get('imageFormat', 'png').lower() # png, jpeg, tiff, ppm
    if image_format not in ['png', 'jpeg', 'jpg', 'tiff', 'ppm']:
        raise ValueError("Invalid image format specified. Supported: png, jpeg, tiff, ppm.")
    if image_format == 'jpg': image_format = 'jpeg' # Common alias

    dpi = int(request_form.get('dpi', 200)) # Dots per inch for image quality
    if not 50 <= dpi <= 600:
        raise ValueError("DPI must be between 50 and 600.")

    page_selection_mode = request_form.get('pageSelectionMode', 'all')
    pages_to_convert_str = request_form.get('pagesToConvert', '') # e.g., "1-3, 5"

    original_filename_secure = secure_filename(original_filename)
    request_temp_folder = create_temp_folder("pdf2image_temp")
    
    try:
        temp_input_filepath = save_uploaded_file(file_stream, request_temp_folder)
        
        # Get total pages for validation if specific pages are requested
        # pdf2image can get this info, but let's use pypdf for consistency if needed before conversion
        from pypdf import PdfReader
        reader = PdfReader(temp_input_filepath)
        num_total_pages = len(reader.pages)

        first_page_to_convert = None
        last_page_to_convert = None
        selected_page_numbers = None # 1-based for pdf2image

        if page_selection_mode == 'specific' and pages_to_convert_str:
            selected_page_indices_0_based = parse_page_ranges(pages_to_convert_str, num_total_pages)
            if not selected_page_indices_0_based:
                raise ValueError("No valid pages selected for conversion.")
            # pdf2image's first_page and last_page are 1-based and define a continuous range.
            # If we want to support arbitrary pages (e.g., 1, 3, 5), we'd convert all and filter.
            # For simplicity here, let's assume if 'specific' is chosen, they provide a valid range
            # that can be mapped to first_page and last_page, or we convert all then select.
            # A simpler approach for `convert_from_path` is to convert all and then select the images.
            # Or, iterate and convert page by page (less efficient).
            
            # For now, let's use a simpler specific page selection: convert only the selected pages
            # This requires calling convert_from_path for each page or range, which is inefficient.
            # Better: convert all, then select. Or, if only a small subset is needed,
            # convert them one by one.
            # `convert_from_path` itself does not take a list of arbitrary pages.
            # It takes `first_page` and `last_page` for a continuous block.
            
            # Let's convert ALL pages and then save only the selected ones.
            # This is simpler than trying to manage first_page/last_page for discontinuous selections.
            selected_page_numbers = [p + 1 for p in selected_page_indices_0_based] # Convert to 1-based
            current_app.logger.info(f"Will convert and select pages: {selected_page_numbers}")


        output_filename_base = os.path.splitext(original_filename_secure)[0]
        images_output_dir = os.path.join(request_temp_folder, "output_images")
        os.makedirs(images_output_dir, exist_ok=True)
        
        try:
            # Convert PDF to list of PIL Image objects
            # poppler_path can be specified if not in PATH, e.g., poppler_path=r"C:\path\to\poppler\bin"
            images = convert_from_path(
                temp_input_filepath,
                dpi=dpi,
                fmt=image_format,
                # first_page=first_page_to_convert, # Use if converting a continuous block
                # last_page=last_page_to_convert,   # Use if converting a continuous block
                thread_count=4 # Use multiple threads for faster conversion
            )
        except pdf2image_exceptions.PDFInfoNotInstalledError:
            raise FileNotFoundError("Poppler 'pdfinfo' utility not found. Please install Poppler and add it to PATH.")
        except pdf2image_exceptions.PDFPageCountError:
            raise ValueError("Could not determine page count of the PDF. It might be corrupted.")
        except pdf2image_exceptions.PDFSyntaxError:
            raise ValueError("PDF syntax error. The PDF file is likely corrupted or malformed.")
        except Exception as e: # Catch other pdf2image errors
            raise Exception(f"PDF to Image conversion failed: {str(e)}")


        if not images:
            raise Exception("PDF to Image conversion resulted in no images.")

        saved_image_paths = []
        for i, image in enumerate(images):
            page_num_1_based = i + 1
            if selected_page_numbers and page_num_1_based not in selected_page_numbers:
                continue # Skip pages not in selection

            image_filename = f"{output_filename_base}_page_{page_num_1_based}.{image_format}"
            image_filepath = os.path.join(images_output_dir, image_filename)
            image.save(image_filepath, image_format.upper())
            saved_image_paths.append(image_filepath)

        if not saved_image_paths:
            raise ValueError("No pages matched the selection criteria, or no images were generated.")

        # If only one image, return it directly. If multiple, zip them.
        if len(saved_image_paths) == 1:
            final_output_filename = os.path.basename(saved_image_paths[0])
            final_output_filepath = os.path.join(current_app.config['CONVERTED_FILES_FOLDER'], final_output_filename)
            shutil.move(saved_image_paths[0], final_output_filepath)
        else:
            final_output_filename = f"{output_filename_base}_images_{uuid.uuid4().hex[:6]}.zip"
            final_output_filepath = os.path.join(current_app.config['CONVERTED_FILES_FOLDER'], final_output_filename)
            with zipfile.ZipFile(final_output_filepath, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for img_path in saved_image_paths:
                    zipf.write(img_path, arcname=os.path.basename(img_path))
        
        response_data = {
            'success': True, 
            'message': f"Successfully converted {len(saved_image_paths)} PDF page(s) to {image_format.upper()} images.",
            'download_url': f'/api/download/{final_output_filename}', 
            'filename': final_output_filename,
            'imageCount': len(saved_image_paths),
            'totalPages': num_total_pages
        }
        return response_data, 200
    finally:
        if request_temp_folder and os.path.exists(request_temp_folder):
            try:
                shutil.rmtree(request_temp_folder)
            except OSError as e_clean:
                current_app.logger.error(f"Error cleaning temp folder {request_temp_folder} for pdf_to_image: {e_clean}")