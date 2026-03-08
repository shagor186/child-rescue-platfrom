import os
import cv2 as cv
import numpy as np
import base64
import pickle
from datetime import datetime, timezone, timedelta
from config import Config

# Global variables for face detection
detector = None
embedder = None
model = None
encoder = None

def init_detectors():
    """Initialize face detection models"""
    global detector, embedder
    try:
        from mtcnn.mtcnn import MTCNN
        print("Initializing MTCNN detector...")
        detector = MTCNN()
        print("✅ MTCNN initialized")
    except Exception as e:
        print(f"❌ Error initializing MTCNN: {e}")
        detector = None
    
    try:
        from keras_facenet import FaceNet
        print("Initializing FaceNet embedder...")
        embedder = FaceNet()
        print("✅ FaceNet initialized")
    except Exception as e:
        print(f"❌ Error initializing FaceNet: {e}")
        embedder = None

def load_saved_model():
    """Load saved model from disk"""
    global model, encoder
    if os.path.exists(Config.SAVED_MODEL_PATH):
        try:
            with open(Config.SAVED_MODEL_PATH, "rb") as f:
                data = pickle.load(f)
            model = data["model"]
            encoder = data["encoder"]
            print(f"✅ Model loaded successfully. Classes: {list(encoder.classes_)}")
            return True
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            model = None
            encoder = None
    return False

def allowed_image_file(filename):
    """Check if file is an allowed image type"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_IMAGE_EXTENSIONS

def allowed_video_file(filename):
    """Check if file is an allowed video type"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_VIDEO_EXTENSIONS

def get_embedding(face_img):
    """Generate face embedding using FaceNet"""
    try:
        if embedder is None:
            print("❌ FaceNet embedder not initialized")
            return None
        
        if face_img is None or face_img.size == 0:
            return None
            
        img = face_img.astype("float32")
        img = np.expand_dims(img, axis=0)
        embedding = embedder.embeddings(img)
        return embedding[0]
    except Exception as e:
        print(f"❌ Error generating embedding: {e}")
        return None

def extract_face(image_data):
    """Extract face from image data"""
    try:
        if detector is None:
            print("❌ MTCNN detector not initialized")
            return None
        
        if image_data is None:
            return None
            
        # Convert BGR to RGB for MTCNN
        if len(image_data.shape) == 3:
            if image_data.shape[2] == 3:
                img_rgb = cv.cvtColor(image_data, cv.COLOR_BGR2RGB)
            elif image_data.shape[2] == 4:
                img_rgb = cv.cvtColor(image_data, cv.COLOR_BGRA2RGB)
            else:
                img_rgb = image_data
        else:
            img_rgb = cv.cvtColor(image_data, cv.COLOR_GRAY2RGB)
        
        # Resize large images for faster detection
        height, width = img_rgb.shape[:2]
        if height > 1200 or width > 1200:
            scale = 1200 / max(height, width)
            new_size = (int(width * scale), int(height * scale))
            img_rgb = cv.resize(img_rgb, new_size)
        
        faces = detector.detect_faces(img_rgb)
        
        if not faces:
            return None
        
        # Get the largest face
        faces.sort(key=lambda x: x['box'][2] * x['box'][3], reverse=True)
        x, y, w, h = faces[0]["box"]
        x, y = max(0, x), max(0, y)
        
        # Add margin to face
        margin_w = int(w * 0.2)
        margin_h = int(h * 0.2)
        x = max(0, x - margin_w)
        y = max(0, y - margin_h)
        w = min(img_rgb.shape[1] - x, w + 2 * margin_w)
        h = min(img_rgb.shape[0] - y, h + 2 * margin_h)
        
        face = img_rgb[y:y+h, x:x+w]
        
        if face.size == 0:
            return None
        
        face_resized = cv.resize(face, Config.TARGET_SIZE)
        return face_resized
        
    except Exception as e:
        print(f"❌ Error extracting face: {e}")
        return None

def save_model_to_disk(model_obj, encoder_obj):
    """Save trained model and encoder to disk"""
    try:
        os.makedirs(os.path.dirname(Config.SAVED_MODEL_PATH), exist_ok=True)
        with open(Config.SAVED_MODEL_PATH, "wb") as f:
            pickle.dump({"model": model_obj, "encoder": encoder_obj}, f)
        print(f"✅ Model saved to {Config.SAVED_MODEL_PATH}")
        return True
    except Exception as e:
        print(f"❌ Error saving model: {e}")
        return False

def get_time_ago(dt):
    """Calculate time ago from datetime"""
    if dt is None:
        return "Unknown"
    
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    
    diff = now - dt
    
    if diff.days > 0:
        return f"{diff.days} days ago"
    elif diff.seconds >= 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif diff.seconds >= 60:
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    else:
        return "Just now"

def image_to_base64(image_array):
    """Convert numpy image array to base64 string"""
    try:
        if image_array is None:
            return None
        # Convert RGB to BGR for OpenCV encoding
        if len(image_array.shape) == 3 and image_array.shape[2] == 3:
            img_bgr = cv.cvtColor(image_array, cv.COLOR_RGB2BGR)
        else:
            img_bgr = image_array
            
        _, buffer = cv.imencode('.jpg', img_bgr, [cv.IMWRITE_JPEG_QUALITY, 85])
        return base64.b64encode(buffer).decode('utf-8')
    except Exception as e:
        print(f"Error converting image to base64: {e}")
        return None