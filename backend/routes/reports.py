import os
import cv2 as cv
import random
import string
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from datetime import datetime
import traceback
from models import db, MissingPerson, PersonImage, Detection
from utils import allowed_image_file, load_saved_model

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/api/reports', methods=['POST'])
def create_report():
    """Create a new missing person report"""
    try:
        if not request.form:
            return jsonify({'error': 'No form data received'}), 400
        
        data = request.form
        person_id = data.get('id', '').strip().upper()
        name = data.get('name', '').strip()
        age = data.get('age', '').strip()
        location = data.get('location', '').strip()
        description = data.get('description', '').strip()
        
        if not person_id:
            person_id = 'MP' + ''.join(random.choices(string.digits, k=6))
        
        if not name:
            return jsonify({'error': 'Name is required'}), 400
        if not age or not age.isdigit():
            return jsonify({'error': 'Valid age is required'}), 400
        if not location:
            return jsonify({'error': 'Location is required'}), 400
        
        age = int(age)
        
        existing_person = MissingPerson.query.filter_by(id=person_id).first()
        if existing_person:
            return jsonify({'error': f'Person ID {person_id} already exists'}), 400
        
        person_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], person_id)
        os.makedirs(person_folder, exist_ok=True)
        
        person = MissingPerson(
            id=person_id,
            name=name,
            age=age,
            location=location,
            description=description,
            image_count=0
        )
        
        db.session.add(person)
        db.session.flush()
        
        files = request.files.getlist('images')
        if not files:
            return jsonify({'error': 'At least one image is required'}), 400
        
        image_count = 0
        
        for idx, file in enumerate(files):
            if file and file.filename:
                if not allowed_image_file(file.filename):
                    continue
                
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = secure_filename(f"{person_id}_{timestamp}_{idx}.jpg")
                filepath = os.path.join(person_folder, filename)
                
                try:
                    file.save(filepath)
                    img = cv.imread(filepath)
                    if img is None:
                        os.remove(filepath)
                        continue
                    
                    person_image = PersonImage(
                        person_id=person_id,
                        image_path=filepath
                    )
                    db.session.add(person_image)
                    image_count += 1
                    print(f"✅ Saved image {filename} for person {person_id}")
                    
                except Exception as e:
                    print(f"❌ Error saving image {file.filename}: {e}")
                    if os.path.exists(filepath):
                        os.remove(filepath)
        
        if image_count == 0:
            db.session.rollback()
            if os.path.exists(person_folder):
                import shutil
                shutil.rmtree(person_folder)
            return jsonify({'error': 'No valid images uploaded.'}), 400
        
        person.image_count = image_count
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Report created successfully with {image_count} images',
            'person_id': person_id,
            'person': person.to_dict(),
            'images_uploaded': image_count
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating report: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/api/reports', methods=['GET'])
def get_all_reports():
    """Get all missing person reports"""
    try:
        persons = MissingPerson.query.order_by(MissingPerson.created_at.desc()).all()
        result = [p.to_dict() for p in persons]
        return jsonify(result)
    except Exception as e:
        print(f"❌ Error getting reports: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/api/reports/<person_id>', methods=['GET'])
def get_report(person_id):
    """Get specific report by ID"""
    try:
        person = MissingPerson.query.filter_by(id=person_id).first()
        if not person:
            return jsonify({'error': 'Person not found'}), 404
        
        images = [img.to_dict() for img in person.images]
        result = person.to_dict()
        result['images'] = images
        
        recent_detections = Detection.query.filter_by(person_id=person_id)\
            .order_by(Detection.detected_at.desc()).limit(10).all()
        
        result['recent_detections'] = [{
            'id': d.id,
            'type': d.detection_type,
            'confidence': float(d.confidence) if d.confidence else 0.0,
            'detected_at': d.detected_at.isoformat() if d.detected_at else None
        } for d in recent_detections]
        
        return jsonify(result)
    except Exception as e:
        print(f"❌ Error getting report: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/api/reports/<person_id>', methods=['DELETE'])
def delete_report(person_id):
    """Delete a report"""
    try:
        person = MissingPerson.query.filter_by(id=person_id).first()
        if not person:
            return jsonify({'error': 'Person not found'}), 404
        
        person_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], person_id)
        if os.path.exists(person_folder):
            import shutil
            try:
                shutil.rmtree(person_folder)
            except Exception as e:
                print(f"Warning: Could not delete folder {person_folder}: {e}")
        
        db.session.delete(person)
        db.session.commit()
        load_saved_model()
        
        return jsonify({
            'success': True,
            'message': f'Report {person_id} deleted successfully'
        })
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error deleting report: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/api/reports/<person_id>/images', methods=['GET'])
def get_person_images(person_id):
    """Get all images for a person"""
    try:
        person = MissingPerson.query.filter_by(id=person_id).first()
        if not person:
            return jsonify({'error': 'Person not found'}), 404
        
        images = PersonImage.query.filter_by(person_id=person_id).all()
        result = [img.to_dict() for img in images]
        return jsonify(result)
    except Exception as e:
        print(f"❌ Error getting images: {e}")
        return jsonify({'error': str(e)}), 500