"""Image generation service — generates prompts + mock product visuals for POD."""
import json
from services import mistral_client as llm


async def generate_pod_design(niche: str, style: str = "modern minimalist") -> dict:
    """Generate a complete POD product design (prompt + metadata)."""
    prompt = f"""Generate a print-on-demand product design brief.

Niche: {niche}
Style: {style}

Return ONLY valid JSON with these fields:
{{
    "design_prompt": "detailed image generation prompt (describe the visual)",
    "product_types": ["t-shirt", "mug", ...],
    "title": "product title for marketplace",
    "description": "SEO-optimized product description (150 words)",
    "tags": ["tag1", "tag2", ...],
    "target_audience": "who would buy this",
    "estimated_price_eur": 19.99,
    "color_palette": ["#hex1", "#hex2", "#hex3"]
}}"""
    return await llm.generate_json(prompt)


async def generate_batch_designs(niche: str, count: int = 5, style: str = "modern minimalist") -> list[dict]:
    """Generate multiple product designs for a niche."""
    prompt = f"""Generate {count} different print-on-demand product designs for the niche "{niche}".
Style: {style}

Return ONLY a JSON array of {count} objects, each with:
{{
    "design_prompt": "detailed visual description",
    "title": "marketplace title",
    "description": "SEO product description (100 words)",
    "tags": ["tag1", "tag2", ...],
    "product_types": ["t-shirt", "mug", ...],
    "estimated_price_eur": 19.99
}}

Make each design UNIQUE — different concepts, angles, visual approaches."""
    return await llm.generate_json(prompt)


async def generate_etsy_listing(design: dict) -> dict:
    """Transform a design brief into a complete Etsy-ready listing."""
    prompt = f"""Create a complete Etsy product listing from this design:
{json.dumps(design, ensure_ascii=False)}

Return ONLY valid JSON:
{{
    "title": "Etsy listing title (max 140 chars, keyword-rich)",
    "description": "Full Etsy description with sections (2000 chars max)",
    "tags": ["tag1", ..., "tag13"],
    "price_eur": 19.99,
    "shipping_profile": "standard",
    "category": "Etsy category path",
    "materials": ["material1", ...],
    "occasion": "appropriate occasion or null",
    "who_made": "i_did",
    "is_digital": false
}}"""
    return await llm.generate_json(prompt)
