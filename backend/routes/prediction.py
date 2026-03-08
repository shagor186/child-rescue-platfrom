import os
import cv2 as cv
import numpy as np
import base64
import json
from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import traceback
from models import db, MissingPerson, Detection
from utils import allowed_image_file, allowed_video_file, extract_face, get_embedding, image_to_base64
import utils
import uuid

prediction_bp = Blueprint('prediction', __name__)

# শনাক্তকৃত ছবি সেভ করার জন্য ফোল্ডার
UPLOAD_FOLDER = 'static/detections'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --- ১. Image Prediction ---
@prediction_bp.route('/api/predict/image', methods=['POST'])
def predict_image():
    try:
        if utils.model is None or utils.encoder is None:
            return jsonify({'error': 'Model not trained yet.'}), 400
        
        file = request.files.get('image')
        if not file: return jsonify({'error': 'No image provided'}), 400
        
        img = cv.imdecode(np.frombuffer(file.read(), np.uint8), cv.IMREAD_COLOR)
        face = extract_face(img)
        if face is None: return jsonify({'error': 'No face detected'}), 400
        
        embedding = get_embedding(face).reshape(1, -1)
        prediction = utils.model.predict(embedding)
        confidence = np.max(utils.model.predict_proba(embedding))
        person_id = utils.encoder.inverse_transform(prediction)[0]
        
        person = MissingPerson.query.get(person_id)
        if not person: return jsonify({'error': 'Person not found'}), 404

        detection = Detection(
            person_id=person_id,
            detection_type='image',
            confidence=float(confidence),
            detection_metadata=json.dumps({'source': 'image_upload'})
        )
        db.session.add(detection)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'prediction': {
                'person_id': person_id,
                'name': person.name,
                'age': person.age,
                'location': person.location,
                'confidence': float(confidence),
                'description': person.description or '',
                'image': image_to_base64(face)
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- ২. Video Prediction ---
@prediction_bp.route('/api/predict/video', methods=['POST'])
def predict_video():
    try:
        if utils.model is None or utils.encoder is None:
            return jsonify({'error': 'Model not trained yet'}), 400
        
        file = request.files.get('video')
        if not file: return jsonify({'error': 'No video provided'}), 400

        # টেম্পোরারি সেভ
        temp_path = os.path.join('temp', file.filename)
        os.makedirs('temp', exist_ok=True)
        file.save(temp_path)
        
        cap = cv.VideoCapture(temp_path)
        detections_found = []
        frame_count = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            
            # প্রতি ৩০ ফ্রেম পর পর চেক (পারফরম্যান্সের জন্য)
            if frame_count % 30 == 0:
                face = extract_face(frame)
                if face is not None:
                    embedding = get_embedding(face).reshape(1, -1)
                    proba = utils.model.predict_proba(embedding)
                    confidence = np.max(proba)

                    if confidence > 0.6: # থ্রেশহোল্ড
                        pid = utils.encoder.inverse_transform(utils.model.predict(embedding))[0]
                        person = MissingPerson.query.get(pid)
                        if person:
                            detections_found.append({
                                'person_id': pid,
                                'name': person.name,
                                'age': person.age,
                                'location': person.location,
                                'confidence': float(confidence),
                                'image': image_to_base64(face)
                            })
                            # ডাটাবেসে সেভ
                            new_det = Detection(person_id=pid, detection_type='video', confidence=float(confidence))
                            db.session.add(new_det)
            frame_count += 1

        cap.release()
        os.remove(temp_path) # ফাইল ডিলিট
        db.session.commit()

        return jsonify({'success': True, 'predictions': detections_found, 'total_detections': len(detections_found)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- ৩. Webcam Prediction ---
# --- ৩. Webcam Prediction (Auto-Save Logic সহ) ---
@prediction_bp.route('/api/predict/webcam', methods=['POST'])
def predict_webcam():
    try:
        if utils.model is None or utils.encoder is None:
            return jsonify({'error': 'Model not trained'}), 400
        
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'Invalid request'}), 400

        encoded_data = data['image'].split(",")[1] if "," in data['image'] else data['image']
        img = cv.imdecode(np.frombuffer(base64.b64decode(encoded_data), np.uint8), cv.IMREAD_COLOR)
        
        face = extract_face(img)
        if face is None: return jsonify({'error': 'No face'}), 404
        
        embedding = get_embedding(face).reshape(1, -1)
        proba = utils.model.predict_proba(embedding)
        confidence = np.max(proba)
        
        # লাইভ ক্যামেরার জন্য থ্রেশহোল্ড একটু ফ্লেক্সিবল রাখা হয়েছে
        if confidence < 0.55: 
            return jsonify({'error': 'Matching confidence too low'}), 404
            
        pid = int(utils.encoder.inverse_transform(utils.model.predict(embedding))[0])
        person = MissingPerson.query.get(pid)
        
        if person:
            # ছবি সার্ভারে সেভ করা (অডিট ট্রেইল বা প্রমাণের জন্য)
            filename = f"webcam_{pid}_{uuid.uuid4().hex[:8]}.jpg"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            cv.imwrite(filepath, face)

            # ডাটাবেসে অটো সেভ
            new_det = Detection(
                person_id=pid,
                detection_type='webcam',
                confidence=float(confidence),
                detection_metadata=json.dumps({'saved_path': filepath})
            )
            db.session.add(new_det)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'person_id': pid,
                'name': person.name,
                'age': person.age,
                'location': person.location,
                'confidence': float(confidence),
                'image': image_to_base64(face) # ফ্রন্টএন্ডে দেখানোর জন্য
            })
        
        return jsonify({'error': 'Unknown identity'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500