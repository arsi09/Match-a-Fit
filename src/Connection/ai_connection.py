"""
ai_connection.py
made by: Pedro Jacobo
revised by Gemini 04/14/2026
updated to google.genai 3.1
Purpose:
- Connect to the Gemini API
- Send clothing images + metadata to Gemini
- Return outfit suggestions to the service layer with weather awareness
"""

import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pathlib import Path

# Load values from .env
try:
    # Walk up directories until .env is found (handles any nesting depth)
    env_path = Path(__file__).resolve().parent
    while env_path != env_path.parent:
        candidate = env_path / ".env"
        if candidate.exists():
            load_dotenv(candidate)
            break
        env_path = env_path.parent
except Exception:
    print("Warning: python-dotenv is not installed or .env file not found.")


class GeminiClient:
    """
    Gemini client for Match-a-Fit.
    """

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY was not found in the environment.")

        # Initialize the new Google GenAI Client
        self.client = genai.Client(api_key=api_key)
        
        # Using Gemini 3.1 Flash for best-in-class image reasoning
        self.model_name = "gemini-3.1-flash"

    def build_prompt(self, clothing_items, occasion=None, weather=None):
        """
        Build the text instructions sent to Gemini.
        """
        prompt = (
            "You are a professional fashion assistant for Match-a-Fit. "
            "Analyze the provided clothing images and metadata to create a cohesive outfit. "
            "Rule 1: Use ONLY the provided items. "
            "Rule 2: You must pair at least one top and one bottom. "
        )

        if occasion:
            prompt += f"Target Occasion: {occasion}. "
        
        if weather:
            prompt += f"Current Weather: {weather}. Ensure the outfit is functionally appropriate. "

        prompt += (
            "\nOutput Requirements:\n"
            "Return a JSON array of objects. Each object must include:\n"
            "- 'outfit_name': A creative name for the look.\n"
            "- 'item_ids': An array of integers corresponding to the IDs provided.\n"
            "- 'explanation': Why these items work together for the occasion/weather.\n"
        )

        prompt += "\nInventory List:\n"
        for item in clothing_items:
            prompt += (
                f"- ID: {item['id']}, "
                f"Type: {item.get('clothing_type', 'Unknown')}, "
                f"Occasion: {item.get('occasion', 'Unknown')}\n"
            )

        return prompt

    def generate_outfits(self, clothing_items, occasion=None, weather=None):
        """
        Send clothing items to Gemini and return structured outfit suggestions.
        """
        if not clothing_items:
            return {"success": False, "error": "No clothing items provided."}

        prompt = self.build_prompt(clothing_items, occasion, weather)
        
        # Multimodal content list: Starts with the text prompt
        contents = [prompt]

        # Add image parts from the bitstrings
        for item in clothing_items:
            image_bytes = item.get("image_bytes")
            if image_bytes:
                contents.append(
                    types.Part.from_bytes(
                        data=image_bytes,
                        mime_type=item.get("image_mime", "image/jpeg")
                    )
                )

        try:
            # Generate content with JSON enforcement
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.7 # Slight creativity for fashion advice
                )
            )

            return {
                "success": True,
                "model": self.model_name,
                "response_text": response.text
            }

        except Exception as e:
            return {"success": False, "error": str(e)}