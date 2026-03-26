import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

# Centralized model identifier
MODEL_NAME = "gemini-1.5-flash"

def get_gemini_model():
    """Initializes and returns the Gemini model instance."""
    return genai.GenerativeModel(model_name=MODEL_NAME)