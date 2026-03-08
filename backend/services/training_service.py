import os
import cv2 as cv
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import SVC
import traceback
from models import db, MissingPerson, PersonImage, ModelTraining
from utils import extract_face, get_embedding, save_model_to_disk
import utils

def train_model_thread(app_instance, training_id):
    """Background thread for model training"""
    with app_instance.app_context():
        try:
            training = ModelTraining.query.get(training_id)
            if not training:
                return
            
            persons = MissingPerson.query.all()
            if len(persons) == 0:
                training.status = 'failed'
                db.session.commit()
                return
            
            X_embeddings = []
            Y_labels = []
            total_images = 0
            processed_images = 0
            
            # Load all images and generate embeddings
            for person in persons:
                images = PersonImage.query.filter_by(person_id=person.id).all()
                for img_record in images:
                    try:
                        if not os.path.exists(img_record.image_path):
                            continue
                            
                        # Read image
                        img = cv.imread(img_record.image_path)
                        if img is None:
                            continue
                        
                        # Extract face
                        face = extract_face(img)
                        if face is not None:
                            embedding = get_embedding(face)
                            if embedding is not None:
                                X_embeddings.append(embedding)
                                Y_labels.append(person.id)
                                total_images += 1
                        
                        processed_images += 1
                        
                        # Update progress
                        if processed_images % 10 == 0:
                            print(f"Processed {processed_images} images...")
                            
                    except Exception as e:
                        print(f"Error processing image {img_record.image_path}: {e}")
                        continue
            
            if len(X_embeddings) < 2:
                training.status = 'failed'
                db.session.commit()
                return
            
            # Train SVM model
            X_embeddings = np.array(X_embeddings)
            label_encoder = LabelEncoder()
            Y_encoded = label_encoder.fit_transform(Y_labels)
            
            svm_model = SVC(kernel="linear", probability=True, C=1.0, random_state=42)
            svm_model.fit(X_embeddings, Y_encoded)
            
            # Calculate accuracy
            train_predictions = svm_model.predict(X_embeddings)
            accuracy = np.mean(train_predictions == Y_encoded)
            
            # Save model globally and to disk
            utils.model = svm_model
            utils.encoder = label_encoder
            
            if not save_model_to_disk(svm_model, label_encoder):
                training.status = 'failed'
                db.session.commit()
                return
            
            # Update training record
            training.status = 'completed'
            training.total_persons = len(persons)
            training.total_images = total_images
            training.accuracy = accuracy
            db.session.commit()
            
            print(f"✅ Training completed. Accuracy: {accuracy:.2%}")
            
        except Exception as e:
            print(f"❌ Training error: {e}")
            traceback.print_exc()
            training = ModelTraining.query.get(training_id)
            if training:
                training.status = 'failed'
                db.session.commit()