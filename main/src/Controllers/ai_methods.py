import google.generativeai as genai
import PIL.Image
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class AIMethods:
    def __init__(self, model_name="gemini-3-flash"):
        """
        Initializes the model. Flash is recommended for 
        fast, low-cost multimodal tasks.
        """
        self.model = genai.GenerativeModel(model_name)

    async def generate_text_response(self, prompt: str):
        """
        Handles standard text-to-text queries.
        """
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating text: {str(e)}"

    async def analyze_image_and_text(self, image_path: str, prompt: str):
        """
        Processes an image with a text instruction. 
        Perfect for fashion analysis or outfit suggestions.
        """
        try:
            img = PIL.Image.open(image_path)
            # The model accepts a list containing both the prompt and the image
            response = self.model.generate_content([prompt, img])
            return response.text
        except FileNotFoundError:
            return "Error: Image file not found."
        except Exception as e:
            return f"Error analyzing image: {str(e)}"

    async def start_chat_session(self):
        """
        Returns an interactive chat session object for 
        maintaining context across multiple turns.
        """
        return self.model.start_chat(history=[])
