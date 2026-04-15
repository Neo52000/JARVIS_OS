"""Social content generator — posts, campaigns, client management."""
import json
from services import mistral_client as llm


async def generate_social_post(
    business_name: str,
    business_type: str,
    topic: str,
    platform: str = "instagram",
    language: str = "fr",
) -> dict:
    """Generate a single social media post."""
    prompt = f"""Create a {platform} post for a local business.

Business: {business_name}
Type: {business_type}
Topic: {topic}
Language: {language}

Return ONLY valid JSON:
{{
    "caption": "the full post caption",
    "hashtags": ["hashtag1", "hashtag2", ...],
    "visual_suggestion": "what the photo/image should show",
    "best_time_to_post": "suggested posting time",
    "call_to_action": "the CTA",
    "engagement_hook": "opening line designed to stop scrolling"
}}

Style: conversational, authentic, local-friendly. NOT corporate."""
    return await llm.generate_json(prompt)


async def generate_content_calendar(
    business_name: str,
    business_type: str,
    days: int = 7,
    language: str = "fr",
) -> list[dict]:
    """Generate a multi-day content calendar."""
    prompt = f"""Create a {days}-day social media content calendar for:
Business: {business_name}
Type: {business_type}
Language: {language}

Return ONLY a JSON array of {days} objects:
{{
    "day": 1,
    "theme": "daily theme",
    "platform": "instagram or facebook",
    "caption": "full post text",
    "hashtags": ["tag1", ...],
    "visual_type": "photo / carousel / reel / story",
    "visual_description": "what to show",
    "objective": "awareness / engagement / conversion"
}}

Mix content types: tips, behind-the-scenes, promotions, customer stories, seasonal."""
    return await llm.generate_json(prompt)


async def generate_client_profile(
    name: str,
    business_type: str,
    location: str = "",
    notes: str = "",
) -> dict:
    """Generate a structured client profile for CRM."""
    prompt = f"""Create a structured business client profile:
Name: {name}
Business type: {business_type}
Location: {location}
Notes: {notes}

Return ONLY valid JSON:
{{
    "client_name": "{name}",
    "business_type": "{business_type}",
    "location": "{location}",
    "needs_assessment": ["need1", "need2", ...],
    "recommended_services": ["service1", "service2", ...],
    "content_strategy": "brief content strategy",
    "estimated_monthly_budget_eur": 0,
    "priority_score": 0,
    "next_actions": ["action1", "action2", ...]
}}"""
    return await llm.generate_json(prompt)


async def generate_campaign(
    business_name: str,
    objective: str,
    budget_eur: float = 0,
    duration_days: int = 30,
) -> dict:
    """Generate a complete marketing campaign plan."""
    prompt = f"""Design a marketing campaign:
Business: {business_name}
Objective: {objective}
Budget: {budget_eur}\u20ac
Duration: {duration_days} days

Return ONLY valid JSON:
{{
    "campaign_name": "catchy campaign name",
    "objective": "{objective}",
    "strategy": "overall approach",
    "channels": ["channel1", ...],
    "phases": [
        {{
            "phase": 1,
            "name": "phase name",
            "duration_days": 7,
            "actions": ["action1", ...],
            "content_pieces": 5,
            "kpis": ["kpi1", ...]
        }}
    ],
    "total_content_pieces": 20,
    "expected_results": "realistic expected outcomes",
    "budget_breakdown": {{}}
}}"""
    return await llm.generate_json(prompt)
