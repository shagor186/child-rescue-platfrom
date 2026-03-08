import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'CHANGE_THIS_SECRET_KEY'
    
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(basedir, "face_recognition.db")}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    SQLALCHEMY_BINDS = {
        'auth': f'sqlite:///{os.path.join(basedir, "auth.db")}'
    }
    
    UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB max
    
    TARGET_SIZE = (160, 160)
    SAVED_MODEL_PATH = os.path.join(basedir, "models", "svm_face_model.pkl")
    
    ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'jfif', 'webp', 'bmp'}
    ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'flv'}
    
    @staticmethod
    def init_app(app):
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        os.makedirs(os.path.join(basedir, 'models'), exist_ok=True)
        os.makedirs(os.path.join(basedir, 'temp'), exist_ok=True)