# backend/blueprints/pdf_operations/utils.py
import os
import re
import uuid
from werkzeug.utils import secure_filename
from flask import current_app # Added to access config for temp folders if needed directly here

# Define allowed extensions sets here if they are truly general,
# or keep them in the main blueprint/pass them to handlers.
# For now, let's assume handlers will know their specific allowed types.

PAGE_SIZES = { # Keeping it here for now if images_to_pdf_handler needs it
    'A4': (595.276, 841.89), 'LETTER': (612, 792),
    'A0': (2383.937, 3370.394), 'A1': (1683.78, 2383.937), 'A2': (1190.551, 1683.78),
    'A3': (841.89, 1190.551), 'A5': (419.528, 595.276), 'A6': (297.638, 419.528),
    'A7': (209.764, 297.638), 'A8': (147.402, 209.764), 'A9': (104.882, 147.402),
    'A10': (73.701, 104.882), 'B0': (2834.646, 4008.189), 'B1': (2004.094, 2834.646),
    'B2': (1417.323, 2004.094), 'B3': (1000.63, 1417.323), 'B4': (708.661, 1000.63),
    'B5': (498.898, 708.661), 'LEGAL': (612, 1008), 'TABLOID': (792, 1224),
    'LEDGER': (1224, 792), 'EXECUTIVE': (522, 756), 'STATEMENT': (396, 612),
    'FOLIO': (612, 936), 'PHOTO_4X6': (288, 432), 'PHOTO_5X7': (360, 504),
    'PHOTO_8X10': (576, 720), 'SQUARE_8X8': (576, 576),
}


def check_allowed_file(filename, allowed_extensions_set):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions_set

def format_file_size_py(num_bytes):
    if num_bytes == 0: return "0 Bytes"
    suffixes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
    i = 0
    while num_bytes >= 1024 and i < len(suffixes)-1: num_bytes /= 1024.; i += 1
    return f"{num_bytes:.2f} {suffixes[i]}"

def parse_page_ranges(page_ranges_str, max_pages):
    if not page_ranges_str.strip(): raise ValueError("Page ranges cannot be empty.")
    if not re.match(r'^\s*(\d+\s*-\s*\d+|\d+)(\s*,\s*(\d+\s*-\s*\d+|\d+))*\s*$', page_ranges_str):
        raise ValueError("Invalid page range format. Use numbers or ranges (e.g., 1-3, 5, 8).")
    selected_pages = set()
    parts = page_ranges_str.split(',')
    for part in parts:
        part = part.strip()
        if not part: continue
        if '-' in part:
            start_str, end_str = part.split('-', 1)
            try: start, end = int(start_str.strip()), int(end_str.strip())
            except ValueError: raise ValueError(f"Invalid number in range '{part}'.")
            if not (1 <= start <= end <= max_pages):
                raise ValueError(f"Invalid page range '{part}'. Pages must be between 1 and {max_pages}, and start <= end.")
            for i in range(start, end + 1): selected_pages.add(i - 1)
        else:
            try: page = int(part)
            except ValueError: raise ValueError(f"Invalid page number '{part}'.")
            if not (1 <= page <= max_pages):
                raise ValueError(f"Page number '{page}' out of range (1-{max_pages}).")
            selected_pages.add(page - 1)
    if not selected_pages: raise ValueError("No valid pages selected from the input ranges.")
    return sorted(list(selected_pages))

def create_temp_folder(base_folder_name="temp"):
    """Creates a unique temporary folder within the app's UPLOAD_FOLDER."""
    folder_name = f"{base_folder_name}_{uuid.uuid4().hex[:10]}"
    temp_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], folder_name)
    os.makedirs(temp_dir, exist_ok=True)
    return temp_dir

def save_uploaded_file(file_stream, temp_dir):
    """Saves an uploaded file stream to a temporary directory with a secure name."""
    if not file_stream or not file_stream.filename:
        raise ValueError("Invalid file stream or filename.")
    filename = secure_filename(file_stream.filename)
    filepath = os.path.join(temp_dir, filename)
    file_stream.seek(0) # Ensure reading from the start
    file_stream.save(filepath)
    return filepath