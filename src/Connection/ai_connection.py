"""
ai_connection.py
made by: Pedro Jacobo
revised by Arsi 04/13/2026
Purpose:
- Connect to the Gemini API
- Send clothing images + metadata to Gemini
- Return outfit suggestions to the service layer
"""

# Import os so we can read environment variables
import os

# Import dotenv so .env values can be loaded
from dotenv import load_dotenv

# Import Gemini SDK
import google.generativeai as genai

# Load values from .env
load_dotenv()

# Configure Gemini with your API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


class GeminiClient:
    """
    Gemini client for Match-a-Fit.

    This class is responsible only for:
    - configuring the Gemini model
    - building the prompt
    - sending images + prompt to Gemini
    - returning the result
    """

    def __init__(self):
        """
        Create the Gemini model instance.

        We are using gemini-1.5-flash because it is cheaper
        and fast enough for outfit generation.
        """
        self.model = genai.GenerativeModel("models/gemini-1.5-flash")

    def build_prompt(self, clothing_items, occasion=None):
        """
        Build the text instructions sent to Gemini.

        Parameters:
        - clothing_items: list of clothing item dictionaries
        - occasion: optional occasion filter like Casual or Formal

        Returns:
        - prompt string
        """

        prompt = (
            "You are a fashion assistant for a mobile app called Match-a-Fit. "
            "You will receive clothing images and item metadata. "
            "Create outfit combinations using only the provided clothing items. "
            "Try to pair tops with bottoms, and include other matching pieces when appropriate. "
            "Do not invent clothing items that were not provided. "
        )

        if occasion:
            prompt += f"Focus on outfits suitable for this occasion: {occasion}. "

        prompt += (
            "Return your answer as plain JSON only. "
            "Use this format: "
            "["
            "{"
            "\"outfit_name\": \"string\", "
            "\"item_ids\": [1, 2], "
            "\"explanation\": \"string\""
            "}"
            "]"
        )

        prompt += "\n\nHere are the clothing items:\n"

        for item in clothing_items:
            prompt += (
                f"- ID: {item['id']}, "
                f"Type: {item['clothing_type']}, "
                f"Occasion: {item['occasion']}\n"
            )

        return prompt

    def generate_outfits(self, clothing_items, occasion=None):
        """
        Send clothing items to Gemini and return outfit suggestions.

        Parameters:
        - clothing_items: list of dicts containing:
            id
            image_bytes
            image_mime
            clothing_type
            occasion
        - occasion: optional occasion filter

        Returns:
        - dict with success flag and Gemini output
        """

        # Make sure we actually received items
        if not clothing_items:
            return {
                "success": False,
                "error": "No clothing items were provided to Gemini."
            }

        # Build the text prompt
        prompt = self.build_prompt(clothing_items, occasion)

        # Build the multimodal request
        # First element is the text prompt
        parts = [prompt]

        # Add each clothing image as an inline image part
        for item in clothing_items:
            image_bytes = item.get("image_bytes")
            image_mime = item.get("image_mime") or "image/jpeg"

            # Skip any item missing image bytes
            if not image_bytes:
                continue

            parts.append({
                "mime_type": image_mime,
                "data": image_bytes
            })

        try:
            # Send request to Gemini
            response = self.model.generate_content(parts)

            # Return Gemini text back to the service layer
            return {
                "success": True,
                "model": "models/gemini-1.5-flash",
                "response_text": response.text
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }