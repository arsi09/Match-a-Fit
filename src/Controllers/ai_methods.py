"""
ai_methods.py
made by: Pedro Jacobo
This file contains all the ai methods needed for the ai model.
"""
import PIL.Image
import io
import base64
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from Connection.ai_connection import GeminiClient
except ModuleNotFoundError:
    from src.Connection.ai_connection import GeminiClient

class AIMethods:

    @staticmethod
    async def verify_and_describe_clothing(image_path, user_category, user_occasion):
        """
        Uses Gemini 1.5 Flash Vision to verify if the uploaded image 
        matches the category the user selected in the Match-a-Fit-app
        """
        try:
            img = PIL.Image.open(image_path)
            
            # This prompt ensures the AI validates the user's manual input
            prompt = f"""
            The user uploaded this photo and labeled it as a '{user_category}' for a '{user_occasion}' occasion.
            1. Does this image actually contain a clothing item? (Yes/No)
            2. Is it actually a {user_category}? (Yes/No)
            3. Describe the primary color and pattern briefly.
            Return results in a clear format.
            """

            response = GeminiClient.model.generate_content([prompt, img])
            return {
                "status": "success",
                "ai_analysis": response.text,
                "verified": "Yes" in response.text[:50] # Simple logic check
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    @staticmethod
    async def generate_outfit_suggestion(closet_items, target_occasion):
        """
        Triggered by the 'Generate Outfit' card on your Home Screen.
        Passes the list of user clothes to Gemini to find a match.
        """
        # Formulate a list of clothes for the AI to "read"
        items_list = "\n".join([f"- {i['color']} {i['category']}" for i in closet_items])

        prompt = f"""
        Based on these items in the user's closet:
        {items_list}
        
        Suggest the best possible outfit for a {target_occasion} event.
        Explain why these items match well together.
        """

        response = GeminiClient.model.generate_content(prompt)
        return {"suggestion": response.text}

    @staticmethod
    def save_to_db(item_data):
        print(f"Saving {item_data['category']} to database...")
        return True
