from flask import Blueprint, jsonify
from datetime import datetime, timezone, timedelta
import traceback
from models import db, MissingPerson, PersonImage, Detection, ModelTraining
from utils import get_time_ago

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    try:
        total_persons = MissingPerson.query.count()
        total_detections = Detection.query.count()
        total_images = db.session.query(db.func.count(PersonImage.id)).scalar() or 0
        
        recent_detections = Detection.query.order_by(Detection.detected_at.desc()).limit(5).all()
        latest_training = ModelTraining.query.order_by(ModelTraining.trained_at.desc()).first()
        
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        recent_detection_count = Detection.query.filter(Detection.detected_at >= week_ago).count()
        
        recent_detection_list = []
        for d in recent_detections:
            person = MissingPerson.query.get(d.person_id)
            recent_detection_list.append({
                'id': str(d.id),
                'person_id': d.person_id,
                'person_name': person.name if person else "Unknown Person",
                'confidence': float(d.confidence) if d.confidence else 0.0,
                'type': d.detection_type if d.detection_type else 'unknown',
                'time_ago': get_time_ago(d.detected_at) if d.detected_at else "Just now"
            })
        
        return jsonify({
            'total_persons': total_persons,
            'total_detections': total_detections,
            'total_images': total_images,
            'recent_detections': recent_detection_list,
            'model_trained': latest_training is not None and latest_training.status == 'completed',
            'model_accuracy': float(latest_training.accuracy) if (latest_training and latest_training.accuracy) else 0.0,
            'last_training': latest_training.trained_at.isoformat() if (latest_training and latest_training.trained_at) else None,
            'detection_trend': recent_detection_count
        }), 200

    except Exception as e:
        print(f"❌ Dashboard API Error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Server Error', 'details': str(e)}), 500