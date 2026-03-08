from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class MissingPerson(db.Model):
    __tablename__ = 'missing_persons'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    location = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    image_count = db.Column(db.Integer, default=0)
    
    images = db.relationship('PersonImage', backref='person', lazy=True, cascade='all, delete-orphan')
    detections = db.relationship('Detection', backref='person', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'age': self.age,
            'location': self.location,
            'description': self.description or '',
            'image_count': self.image_count,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class PersonImage(db.Model):
    __tablename__ = 'person_images'
    
    id = db.Column(db.Integer, primary_key=True)
    person_id = db.Column(db.String(50), db.ForeignKey('missing_persons.id'), nullable=False)
    image_path = db.Column(db.String(500), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'person_id': self.person_id,
            'image_path': self.image_path,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }

class Detection(db.Model):
    __tablename__ = 'detections'
    
    id = db.Column(db.Integer, primary_key=True)
    person_id = db.Column(db.String(50), db.ForeignKey('missing_persons.id'), nullable=False)
    detection_type = db.Column(db.String(50))  # image, webcam, video
    confidence = db.Column(db.Float)
    image_path = db.Column(db.String(500))
    detected_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    detection_metadata = db.Column(db.Text)

class ModelTraining(db.Model):
    __tablename__ = 'model_training'
    
    id = db.Column(db.Integer, primary_key=True)
    total_persons = db.Column(db.Integer)
    total_images = db.Column(db.Integer)
    accuracy = db.Column(db.Float)
    trained_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    status = db.Column(db.String(50))  # training, completed, failed