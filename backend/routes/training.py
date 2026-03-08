import threading
from flask import Blueprint, jsonify, current_app
import traceback
from models import db, MissingPerson, ModelTraining
from services.training_service import train_model_thread
import utils

training_bp = Blueprint('training', __name__)

@training_bp.route('/api/model/train', methods=['POST'])
def train_model():
    """Train the face recognition model"""
    try:
        if utils.detector is None or utils.embedder is None:
            return jsonify({
                'error': 'AI models not initialized properly.'
            }), 500
        
        persons = MissingPerson.query.all()
        
        if len(persons) == 0:
            return jsonify({'error': 'No missing persons found. Please add reports first.'}), 400
        
        total_images = sum(person.image_count for person in persons)
        
        if total_images < 2:
            return jsonify({
                'error': f'Not enough images for training. Found {total_images} images, need at least 2.'
            }), 400
        
        training = ModelTraining(
            total_persons=len(persons),
            total_images=total_images,
            accuracy=0.0,
            status='training'
        )
        db.session.add(training)
        db.session.commit()
        
        thread = threading.Thread(target=train_model_thread, args=(current_app._get_current_object(), training.id))
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'message': 'Model training started in background',
            'training_id': training.id,
            'total_persons': len(persons),
            'total_images': total_images
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error starting training: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@training_bp.route('/api/model/status', methods=['GET'])
def model_status():
    """Get model training status"""
    try:
        latest_training = ModelTraining.query.order_by(ModelTraining.trained_at.desc()).first()
        
        status_data = {
            'model_exists': utils.model is not None and utils.encoder is not None,
            'model_loaded': utils.model is not None,
            'encoder_loaded': utils.encoder is not None,
            'classes': list(utils.encoder.classes_) if utils.encoder is not None else [],
            'last_training': None,
            'training_status': None
        }
        
        if latest_training:
            status_data.update({
                'last_training': latest_training.trained_at.isoformat() if latest_training.trained_at else None,
                'training_status': latest_training.status,
                'total_persons': latest_training.total_persons,
                'total_images': latest_training.total_images,
                'accuracy': float(latest_training.accuracy) if latest_training.accuracy else 0.0
            })
        
        return jsonify(status_data)
    except Exception as e:
        print(f"❌ Error getting model status: {e}")
        return jsonify({'error': str(e)}), 500

@training_bp.route('/api/model/status/<int:training_id>', methods=['GET'])
def get_training_status(training_id):
    """Get specific training status"""
    try:
        training = ModelTraining.query.get(training_id)
        if not training:
            return jsonify({'error': 'Training not found'}), 404
        
        return jsonify({
            'id': training.id,
            'status': training.status,
            'total_persons': training.total_persons,
            'total_images': training.total_images,
            'accuracy': float(training.accuracy) if training.accuracy else 0.0,
            'trained_at': training.trained_at.isoformat() if training.trained_at else None
        })
    except Exception as e:
        print(f"❌ Error getting training status: {e}")
        return jsonify({'error': str(e)}), 500