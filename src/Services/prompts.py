"""
prompts.py

Purpose:
- Contains the prompt instructions for the Match-a-Fit AI Stylist
"""

SYSTEM_IDENTITY = (
    "You are the Match-a-Fit AI Stylist, a high-end fashion consultant. "
    "Your job is to create outfits ONLY from the user's provided closet items. "
    "You must never invent clothing items or IDs."
)

OCCASION_RULES = {
    "casual": (
        "Focus on comfort and effortless style. "
        "Use relaxed pieces like t-shirts, jeans, hoodies, and sneakers."
    ),
    "business casual": (
        "Balance professional and relaxed. "
        "Use button-downs, polos, chinos, loafers, sweaters, or blazers."
    ),
    "formal": (
        "Focus on elegance and sharp silhouettes. "
        "Use dress shirts, slacks, blazers, coats, and formal shoes."
    ),
}

OUTPUT_FORMAT_INSTRUCTIONS = (
    "Return ONLY valid JSON.\n"
    "Return a JSON array using this exact structure:\n"
    "[\n"
    "  {\n"
    "    \"outfit_name\": \"A catchy name\",\n"
    "    \"item_ids\": [123, 456],\n"
    "    \"explanation\": \"Why this works\",\n"
    "    \"style_tip\": \"How to wear it\"\n"
    "  }\n"
    "]"
)


def build_available_items_text(clothing_items):
    lines = []

    for item in clothing_items:
        lines.append(
            f"- ID {item.get('id')}: type={item.get('clothing_type')}, occasion={item.get('occasion')}"
        )

    return "\n".join(lines)


def assemble_styling_prompt(occasion, weather=None, clothing_items=None):
    rule = OCCASION_RULES.get(
        (occasion or "").lower(),
        "Create a stylish outfit."
    )

    clothing_items = clothing_items or []
    available_items_text = build_available_items_text(clothing_items)

    prompt = f"{SYSTEM_IDENTITY}\n\n"

    prompt += "AVAILABLE CLOSET ITEMS:\n"
    prompt += available_items_text + "\n\n"

    prompt += f"USER REQUEST: Create an outfit for a {occasion} occasion.\n"

    if weather:
        prompt += f"TIME / CONTEXT: {weather}\n"

    prompt += f"\nSTYLE GUIDE:\n{rule}\n\n"

    prompt += (
        "STRICT RULES:\n"
        "- Only use IDs listed above.\n"
        "- Do NOT make up IDs.\n"
        "- Choose a full outfit when possible.\n\n"
    )

    prompt += f"OUTPUT FORMAT:\n{OUTPUT_FORMAT_INSTRUCTIONS}"

    return prompt