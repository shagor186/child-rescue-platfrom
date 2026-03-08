import os
from flask import Blueprint, jsonify, current_app
from models import MissingPerson, PersonImage, Detection
from config import Config
import utils

system_bp = Blueprint('system', __name__)

@system_bp.route('/api/system/info', methods=['GET'])
def system_info():
    """Get system information"""
    try:
        total_persons = MissingPerson.query.count()
        total_images = PersonImage.query.count()
        total_detections = Detection.query.count()
        
        upload_dir = current_app.config['UPLOAD_FOLDER']
        total_size = 0
        if os.path.exists(upload_dir):
            for dirpath, dirnames, filenames in os.walk(upload_dir):
                for f in filenames:
                    fp = os.path.join(dirpath, f)
                    if os.path.exists(fp):
                        total_size += os.path.getsize(fp)
        
        total_size_mb = total_size / (1024 * 1024)
        
        model_exists = os.path.exists(Config.SAVED_MODEL_PATH)
        model_size = 0
        if model_exists:
            model_size = os.path.getsize(Config.SAVED_MODEL_PATH) / (1024 * 1024)
        
        return jsonify({
            'database': {
                'missing_persons': total_persons,
                'images': total_images,
                'detections': total_detections
            },
            'storage': {
                'upload_folder': upload_dir,
                'total_size_mb': round(total_size_mb, 2),
                'model_size_mb': round(model_size, 2) if model_exists else 0
            },
            'ai_models': {
                'mtcnn_loaded': utils.detector is not None,
                'facenet_loaded': utils.embedder is not None,
                'svm_loaded': utils.model is not None,
                'model_file_exists': model_exists
            }
        })
    except Exception as e:
        print(f"❌ Error getting system info: {e}")
        return jsonify({'error': str(e)}), 500