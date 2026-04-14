"""
ai_connection.py
made by: Pedro Jacobo
revised by Arsi 04/13/2026
updated to google.genai
Purpose:
- Connect to the Gemini API
- Send clothing images + metadata to Gemini
- Return outfit suggestions to the service layer
"""

# Import os so we can read environment variables
import os

# Import dotenv so .env values can be loaded
from dotenv import load_dotenv

# Import the current Gemini SDK
from google import genai
from google.genai import types

# Load values from .env
load_dotenv()


class GeminiClient:
    """
    Gemini client for Match-a-Fit.

    This class is responsible only for:
    - configuring the Gemini client
    - building the prompt
    - sending images + prompt to Gemini
    - returning the result
    """

    def __init__(self):
        """
        Create the Gemini client.

        The current google.genai SDK uses genai.Client(...)
        instead of genai.configure(...) + GenerativeModel(...).
        """
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError("GEMINI_API_KEY was not found in the environment.")

        self.client = genai.Client(api_key=api_key)
        self.model_name = "gemini-2.5-flash"

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
                f"Type: {item.get('clothing_type', 'Unknown')}, "
                f"Occasion: {item.get('occasion', 'Unknown')}\n"
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

        # Build the multimodal contents list
        contents = [prompt]

        # Add each clothing image as an inline image part
        for item in clothing_items:
            image_bytes = item.get("image_bytes")
            image_mime = item.get("image_mime") or "image/jpeg"

            # Skip any item missing image bytes
            if not image_bytes:
                continue

            contents.append(
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=image_mime
                )
            )

        try:
            # Send request to Gemini
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents
            )

            # Return Gemini text back to the service layer
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