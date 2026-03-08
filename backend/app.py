from flask import Flask
from flask_cors import CORS
import traceback

from config import Config
from models import db
from utils import init_detectors, load_saved_model

from routes.auth import auth_bp
from routes.dashboard import dashboard_bp
from routes.reports import reports_bp
from routes.training import training_bp
from routes.prediction import prediction_bp
from routes.notifications import notifications_bp
from routes.system import system_bp

def create_app():
    """Application factory"""
    app = Flask(__name__)
    
    app.config.from_object(Config)
    Config.init_app(app)
    
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    db.init_app(app)
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(training_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(system_bp)
    
    return app

if __name__ == '__main__':
    init_detectors()
    load_saved_model()
    
    app = create_app()
    
    with app.app_context():
        try:
            db.create_all()
            print("✅ Database initialized successfully!")
            
            from utils import detector, embedder, model
            if detector is None:
                print("⚠️ Warning: MTCNN detector not loaded.")
            if embedder is None:
                print("⚠️ Warning: FaceNet embedder not loaded.")
            
            print("\n" + "="*60)
            print("Face Recognition System with Authentication")
            print("="*60)
            print(f"Auth Database: sqlite:///auth.db")
            print(f"Face Database: {app.config['SQLALCHEMY_DATABASE_URI']}")
            print(f"Upload folder: {app.config['UPLOAD_FOLDER']}")
            print(f"Model path: {Config.SAVED_MODEL_PATH}")
            print(f"MTCNN loaded: {detector is not None}")
            print(f"FaceNet loaded: {embedder is not None}")
            print(f"Model loaded: {model is not None}")
            print("="*60)
            print("Authentication Endpoints:")
            print("  POST /api/signup")
            print("  POST /api/signin")
            print("  POST /api/forgot-password")
            print("  POST /api/reset-password")
            print("  GET  /api/profile (Protected)")
            print("="*60)
            print("Face Recognition Endpoints:")
            print("  GET  /api/health")
            print("  GET  /api/dashboard/stats")
            print("  POST /api/reports")
            print("  GET  /api/reports")
            print("  POST /api/model/train")
            print("  POST /api/predict/image")
            print("  POST /api/predict/video")
            print("  POST /api/predict/webcam")
            print("  GET  /api/notifications")
            print("="*60)
            print("Starting server on http://localhost:5000")
            print("Press Ctrl+C to stop")
            print("="*60)
            
        except Exception as e:
            print(f"❌ Error initializing database: {e}")
            traceback.print_exc()
            exit(1)
    
    app.run(debug=True, port=5000, host='0.0.0.0')