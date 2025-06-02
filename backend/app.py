# backend/app.py
import os
from flask import Flask
from flask_cors import CORS
from blueprints.pdf_tool_bp import pdf_tool_bp

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}}) # Adjust origins for production

    # --- Configuration for file paths ---
    # Assuming 'backend' is the root directory of your Flask app
    # and 'uploads' & 'converted_files' are inside 'backend'
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    app.config['CONVERTED_FILES_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'converted_files')
    
    # Ensure these directories exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['CONVERTED_FILES_FOLDER'], exist_ok=True)
    
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # Example: 50MB limit for total request size

    app.register_blueprint(pdf_tool_bp, url_prefix='/api')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000) # Port 5000 is often used for Flask dev