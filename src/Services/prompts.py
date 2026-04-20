"""
prompts.py

This file contains the "brain" of the AI Stylist.
Keep all text instructions here to keep the service layer clean.
"""

# Core Identity (System Instruction)
SYSTEM_IDENTITY = (
    "You are the Match-a-Fit AI Stylist, a high-end fashion consultant. "
    "Your goal is to build cohesive outfits from a user's digital closet. "
    "You prioritize color theory, seasonal appropriateness, and occasion-specific etiquette."
)

# Occasion Specific Rules
OCCASION_RULES = {
    "casual": (
        "Focus on comfort and effortless style. Layering is encouraged. "
        "Prioritize items like t-shirts, jeans, and sneakers."
    ),
    "business casual": (
        "Balance professional and relaxed. Focus on chinos, polos, "
        "button-downs, and loafers. Avoid overly distressed items."
    ),
    "formal": (
        "Focus on elegance and sharp silhouettes. Ensure colors are sophisticated "
        "(monochromatic or classic pairings). Prioritize dress shirts, slacks, and blazers."
    )
}

# Output Format Instructions
OUTPUT_FORMAT_INSTRUCTIONS = (
    "Return the data strictly as a JSON array of objects. "
    "Each object must follow this structure:\n"
    "{\n"
    "  \"outfit_name\": \"A catchy name for the look\",\n"
    "  \"item_ids\": [list of integers],\n"
    "  \"explanation\": \"Why this works for the occasion and weather\",\n"
    "  \"style_tip\": \"A quick tip on how to wear it\"\n"
    "}"
)


def assemble_styling_prompt(occasion, weather=None):
    """
    Build the final prompt sent to the AI model.
    Weather is passed in as plain text and is NOT saved to a file.
    """
    rule = OCCASION_RULES.get(
        (occasion or "").lower(),
        "Create a stylish, balanced look."
    )

    prompt = f"{SYSTEM_IDENTITY}\n\n"
    prompt += f"USER REQUEST: I need an outfit for a {occasion} occasion.\n"

    if weather:
        prompt += f"CURRENT WEATHER: {weather}. Adjust the layers accordingly.\n"

    prompt += f"STYLE GUIDE: {rule}\n\n"
    prompt += f"FORMATTING RULES:\n{OUTPUT_FORMAT_INSTRUCTIONS}"

    return prompt