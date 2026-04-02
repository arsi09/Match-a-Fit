""" 
ai_connection.py
made by: Pedro Jacobo
This file introduces the ai model to the program.
"""
import os
import google.generativeai as genai
from dotenv import load_dotenv

#Load the API key
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

#Stop the program if the key is missing
if not GOOGLE_API_KEY:
    print ("Error: GOOGLE_API_KEY not found.")
else:
    genai.configure(api_key=GOOGLE_API_KEY)

# Centralized model identifier
MODEL_NAME = "gemini-1.5-flash"

def get_gemini_model():
    """Initializes and returns the Gemini model instance."""
    return genai.GenerativeModel(MODEL_NAME)
