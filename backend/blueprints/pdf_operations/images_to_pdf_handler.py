# backend/blueprints/pdf_operations/images_to_pdf_handler.py
import os
import uuid
import shutil
from flask import current_app
from PIL import Image
from io import BytesIO
from .utils import check_allowed_file, PAGE_SIZES, create_temp_folder # PAGE_SIZES from utils

ALLOWED_EXTENSIONS_IMAGE = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tiff'}

def handle_images_to_pdf(request_files, request_form):
    if 'files' not in request_files:
        return {'success': False, 'error': 'No files part in the request'}, 400
    
    image_files = request_files.getlist('files')
    if not image_files or not any(f.filename for f in image_files):
        raise ValueError('No images selected for conversion.')

    page_orientation = request_form.get('pageOrientation', 'portrait').lower()
    page_size_key = request_form.get('pageSize', 'A4').upper()
    
    valid_images_data = []
    for img_file_stream in image_files:
        if img_file_stream and check_allowed_file(img_file_stream.filename, ALLOWED_EXTENSIONS_IMAGE):
            try:
                img = Image.open(BytesIO(img_file_stream.read()))
                if img.mode in ['RGBA', 'LA'] or (img.mode == 'P' and 'transparency' in img.info):
                    img = img.convert('RGB')
                valid_images_data.append(img)
            except Exception as e:
                current_app.logger.warning(f"Could not open/process image {img_file_stream.filename}: {e}")
                # Optionally skip or raise an error for this specific file
        elif img_file_stream and img_file_stream.filename: # If a file was provided but was wrong type
            raise ValueError(f"Invalid image file type: {img_file_stream.filename}. Supported: {', '.join(ALLOWED_EXTENSIONS_IMAGE)}")

    if not valid_images_data:
        raise ValueError('No valid images found to convert after attempting to process.')

    output_filename = f"images_converted_{uuid.uuid4().hex[:8]}.pdf"
    output_filepath = os.path.join(current_app.config['CONVERTED_FILES_FOLDER'], output_filename)
    
    # Note: No request_temp_folder needed here as images are processed in memory by PIL
    # and directly saved to CONVERTED_FILES_FOLDER.

    images_to_save_to_pdf = []
    if page_size_key == 'AUTO':
        for pil_img in valid_images_data:
            img_w, img_h = pil_img.width, pil_img.height
            current_orientation_is_landscape = img_w > img_h
            
            needs_rotation = False
            if page_orientation == 'landscape' and not current_orientation_is_landscape:
                needs_rotation = True
            elif page_orientation == 'portrait' and current_orientation_is_landscape:
                needs_rotation = True
            
            if needs_rotation:
                pil_img = pil_img.rotate(90, expand=True)
            images_to_save_to_pdf.append(pil_img)
    else: 
        page_width_pt, page_height_pt = PAGE_SIZES.get(page_size_key, PAGE_SIZES['A4'])
        if page_orientation == 'landscape':
            page_width_pt, page_height_pt = page_height_pt, page_width_pt

        for pil_img in valid_images_data:
            img_w, img_h = pil_img.size
            scale = min(page_width_pt / img_w, page_height_pt / img_h) if img_w > 0 and img_h > 0 else 1
            new_w, new_h = int(img_w * scale), int(img_h * scale)
            
            if new_w == 0 or new_h == 0: # Skip zero-dimension images after scaling
                current_app.logger.warning(f"Skipping image due to zero dimension after scaling: original {img_w}x{img_h}")
                continue

            resized_img = pil_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            page_img = Image.new('RGB', (int(page_width_pt), int(page_height_pt)), (255, 255, 255))
            pos_x = (int(page_width_pt) - new_w) // 2
            pos_y = (int(page_height_pt) - new_h) // 2
            page_img.paste(resized_img, (pos_x, pos_y))
            images_to_save_to_pdf.append(page_img)

    if not images_to_save_to_pdf:
        raise ValueError("No images were processed successfully to save to PDF.")
    
    images_to_save_to_pdf[0].save(
        output_filepath, 
        save_all=True, 
        append_images=images_to_save_to_pdf[1:], # This is empty if only one image
        resolution=72.0
    )

    response_data = {
        'success': True, 
        'message': f"Successfully converted {len(images_to_save_to_pdf)} image(s) to PDF.", # Use len of actually saved images
        'imageCount': len(images_to_save_to_pdf),
        'download_url': f'/api/download/{output_filename}', 
        'filename': output_filename
    }
    return response_data, 200