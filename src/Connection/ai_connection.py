"""
ai_connection.py
made by: Pedro Jacobo
Revised by: Arsi 04/13/2026
Purpose:
- Connect to Gemini API
- Send clothing images + metadata
- Receive outfit suggestions
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables (.env file)
load_dotenv()

# Configure Gemini with your API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


class GeminiClient:
    """Gemini 1.5 Flash client"""

    def __init__(self):
        # Initialize the model
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def generate_outfits(self, clothing_items, occasion=None):
        """
        Send clothing items to Gemini and get outfit suggestions.

        clothing_items format:
        [
            {
                "id": 1,
                "image_bytes": b"...",
                "image_mime": "image/jpeg",
                "clothing_type": "Shirt",
                "occasion": "Casual"
            }
        ]
        """

        if not clothing_items:
            return {
                "success": False,
                "error": "No clothing items provided"
            }

        # Build prompt
        prompt = (
            "You are a fashion assistant. "
            "Create outfit combinations using the provided clothing items. "
        )

        if occasion:
            prompt += f"Focus on outfits suitable for: {occasion}. "

        prompt += (
            "Return outfits with item IDs and explanations."
        )

        try:
            # Build multimodal input (text + images)
            parts = [prompt]

            for item in clothing_items:
                if item.get("image_bytes"):
                    parts.append({
                        "mime_type": item["image_mime"],
                        "data": item["image_bytes"]
                    })

            # Send request to Gemini
            response = self.model.generate_content(parts)

            return {
                "success": True,
                "response_text": response.text
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }