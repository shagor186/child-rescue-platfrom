from flask import Blueprint, request, jsonify
import traceback
from models import db, MissingPerson, Detection
from utils import get_time_ago

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/api/notifications', methods=['GET'])
def get_notifications():
    """Get all detection notifications"""
    try:
        limit = request.args.get('limit', default=50, type=int)
        detections = Detection.query.order_by(Detection.detected_at.desc()).limit(limit).all()
        
        result = []
        for d in detections:
            person = MissingPerson.query.get(d.person_id)
            if person:
                result.append({
                    'id': d.id,
                    'person_id': d.person_id,
                    'person_name': person.name,
                    'person_location': person.location,
                    'type': d.detection_type or 'unknown',
                    'confidence': float(d.confidence) if d.confidence else 0.0,
                    'detected_at': d.detected_at.isoformat() if d.detected_at else None,
                    'time_ago': get_time_ago(d.detected_at)
                })
        
        return jsonify(result)
    except Exception as e:
        print(f"❌ Error getting notifications: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/api/notifications/<int:notification_id>', methods=['DELETE'])
def delete_notification(notification_id):
    """Delete a notification"""
    try:
        detection = Detection.query.get(notification_id)
        if not detection:
            return jsonify({'error': 'Notification not found'}), 404
        
        db.session.delete(detection)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Notification deleted'})
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error deleting notification: {e}")
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/api/notifications/clear', methods=['DELETE'])
def clear_all_notifications():
    """Clear all notifications"""
    try:
        deleted_count = Detection.query.delete()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Cleared {deleted_count} notifications'
        })
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error clearing notifications: {e}")
        return jsonify({'error': str(e)}), 500