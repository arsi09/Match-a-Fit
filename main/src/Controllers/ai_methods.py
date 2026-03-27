import google.generativeai as genai
import PIL.Image
import os
from dotenv import load_dotenv

# Load environment variables to ensure the API key is accessible
load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

class AIMethods:
    def __init__(self, model_name="gemini-3-flash"):
        self.model = genai.GenerativeModel(model_name)

    async def generate_text_response(self, prompt: str):
        try:
            response = await self.model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            return f"Error generating text: {str(e)}"

    async def analyze_outfit(self, image_paths: list[str], occasion: str):
        """
        Handles multiple images at once to suggest a full outfit.
        """
        try:
            # Load all provided images
            images = [PIL.Image.open(path) for path in image_paths]
            
            # Specialized styling prompt
            prompt = f"""
            Act as a professional fashion stylist. 
            The user needs an outfit for: {occasion}.
            Based on the attached photos, identify the items and suggest 
            the best combination. Explain why it works for the occasion.
            """
            
            # Pass the list of images + the text prompt
            response = await self.model.generate_content_async([prompt, *images])
            return response.text
        except FileNotFoundError as e:
            return f"Error: Image file not found - {e}"
        except Exception as e:
            return f"Error analyzing outfit: {str(e)}"

    def start_chat_session(self):
        return self.model.start_chat(history=[])
