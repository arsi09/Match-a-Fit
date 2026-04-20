"""
ai_connection.py

Purpose:
- Connect to the Gemini API
- Send clothing images + metadata to Gemini
- Return outfit suggestions to the service layer
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types


# Load values from .env
try:
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

    This class is responsible for:
    - configuring the Gemini client
    - preparing the multimodal request
    - sending prompt + images to Gemini
    - returning the result
    """

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError("GEMINI_API_KEY was not found in the environment.")

        self.client = genai.Client(api_key=api_key)

        # Use a valid Gemini model name
        self.model_name = "gemini-2.0-flash"

    def generate_outfits(self, clothing_items, prompt):
        """
        Sends clothing image bytes and a pre-built prompt to Gemini.
        """
        if not clothing_items:
            return {
                "success": False,
                "error": "No clothing items provided."
            }

        try:
            # Start the multimodal contents with the text prompt
            contents = [prompt]

            # Add each clothing image as a Gemini Part
            for item in clothing_items:
                image_bytes = item.get("image_bytes")

                if not image_bytes:
                    continue

                try:
                    contents.append(
                        types.Part.from_bytes(
                            data=image_bytes,
                            mime_type=item.get("image_mime", "image/jpeg")
                        )
                    )
                except Exception as image_error:
                    print(f"Error preparing image ID {item.get('id')}: {image_error}")
                    continue

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.7
                )
            )

            return {
                "success": True,
                "model": self.model_name,
                "response_text": response.text
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }