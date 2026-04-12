""" 
ai_connection.py
made by: Pedro Jacobo
This file introduces the ai model to the program.
"""
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure the Gemini SDK
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class GeminiClient:
    """Configuration for Gemini 1.5 Flash"""
    
    # Using 1.5 Flash for speed and lower cost/latency
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    generation_config = {
        "temperature": 0.4,
        "top_p": 1,
        "top_k": 32,
        "max_output_tokens": 1024,
    }
