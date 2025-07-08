import os
from typing import Dict, Any
from google.cloud import aiplatform
from google.auth.exceptions import DefaultCredentialsError
import json

class VertexAIService:
    def __init__(self):
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT_ID")
        self.location = "us-central1"
        
        try:
            aiplatform.init(project=self.project_id, location=self.location)
            self.client = aiplatform.gapic.PredictionServiceClient()
        except DefaultCredentialsError:
            print("Google Cloud credentials not found. Vertex AI service disabled.")
            self.client = None
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of text using Vertex AI"""
        if not self.client:
            # Return mock data if no credentials
            return {
                "sentiment_score": 0.0,
                "confidence": 0.8,
                "emotions": {
                    "joy": 0.2,
                    "sadness": 0.3,
                    "anger": 0.1,
                    "fear": 0.2,
                    "surprise": 0.1,
                    "disgust": 0.1
                }
            }
        
        try:
            # Use a text classification model for sentiment analysis
            endpoint = f"projects/{self.project_id}/locations/{self.location}/endpoints/YOUR_ENDPOINT_ID"
            
            # Prepare the request
            instance = {"content": text}
            instances = [instance]
            
            # Make prediction request
            response = self.client.predict(
                endpoint=endpoint,
                instances=instances
            )
            
            # Process response
            predictions = response.predictions
            if predictions:
                prediction = predictions[0]
                return {
                    "sentiment_score": prediction.get("sentiment_score", 0.0),
                    "confidence": prediction.get("confidence", 0.0),
                    "emotions": prediction.get("emotions", {})
                }
            
            return {"sentiment_score": 0.0, "confidence": 0.0, "emotions": {}}
            
        except Exception as e:
            print(f"Error analyzing sentiment: {str(e)}")
            # Return neutral sentiment on error
            return {
                "sentiment_score": 0.0,
                "confidence": 0.5,
                "emotions": {
                    "joy": 0.2,
                    "sadness": 0.2,
                    "anger": 0.2,
                    "fear": 0.2,
                    "surprise": 0.1,
                    "disgust": 0.1
                }
            }
    
    def analyze_stress_indicators(self, text: str) -> Dict[str, Any]:
        """Analyze stress indicators in text"""
        if not self.client:
            # Return mock data if no credentials
            return {
                "stress_level": 0.4,
                "indicators": {
                    "urgency_keywords": ["urgent", "asap", "immediately"],
                    "negative_emotions": ["frustrated", "overwhelmed", "stressed"],
                    "time_pressure": ["deadline", "rush", "hurry"]
                }
            }
        
        try:
            # Use custom model for stress detection
            # This would be implemented with a custom trained model
            stress_keywords = [
                "urgent", "asap", "immediately", "deadline", "rush", "hurry",
                "stressed", "overwhelmed", "frustrated", "exhausted", "burned out"
            ]
            
            text_lower = text.lower()
            found_keywords = [keyword for keyword in stress_keywords if keyword in text_lower]
            
            # Simple stress level calculation
            stress_level = min(len(found_keywords) / 5, 1.0)
            
            return {
                "stress_level": stress_level,
                "indicators": {
                    "found_keywords": found_keywords,
                    "keyword_count": len(found_keywords),
                    "text_length": len(text)
                }
            }
            
        except Exception as e:
            print(f"Error analyzing stress indicators: {str(e)}")
            return {"stress_level": 0.0, "indicators": {}}

vertex_ai_service = VertexAIService()