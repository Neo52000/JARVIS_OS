"""Local Business Workflow — Marketing automation for local businesses."""
import json
from datetime import datetime
from pathlib import Path
from config import settings
from services.social_generator import (
    generate_social_post,
    generate_content_calendar,
    generate_client_profile,
    generate_campaign,
)
from core.memory import chroma_store as memory


async def create_post(
    business_name: str,
    business_type: str,
    topic: str,
    platform: str = "instagram",
) -> dict:
    """Generate a single social media post."""
    post = await generate_social_post(business_name, business_type, topic, platform)
    post["created_at"] = datetime.now().isoformat()
    post["business"] = business_name
    post["platform"] = platform

    memory.store(
        f"Post for {business_name}: {post.get('caption', '')[:100]}",
        metadata={"type": "social_post", "business": business_name, "platform": platform},
        collection="local_business",
    )
    return post


async def create_calendar(
    business_name: str,
    business_type: str,
    days: int = 7,
) -> dict:
    """Generate a full content calendar."""
    calendar = await generate_content_calendar(business_name, business_type, days)

    export_path = (
        settings.EXPORTS_DIR
        / f"calendar_{business_name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.json"
    )
    with open(export_path, "w", encoding="utf-8") as f:
        json.dump(calendar, f, ensure_ascii=False, indent=2)

    memory.store(
        f"Calendar {days}j for {business_name} \u2014 {len(calendar)} posts",
        metadata={"type": "content_calendar", "business": business_name, "days": days},
        collection="local_business",
    )
    return {"calendar": calendar, "export_file": str(export_path), "days": days}


async def add_client(
    name: str,
    business_type: str,
    location: str = "",
    notes: str = "",
) -> dict:
    """Create a new client profile."""
    profile = await generate_client_profile(name, business_type, location, notes)
    profile["created_at"] = datetime.now().isoformat()

    memory.store(
        f"Client: {name} \u2014 {business_type} \u2014 {location}",
        metadata={"type": "client_profile", "client": name, "business_type": business_type},
        collection="clients",
    )
    return profile


async def create_campaign_plan(
    business_name: str,
    objective: str,
    budget_eur: float = 0,
    duration_days: int = 30,
) -> dict:
    """Generate a complete marketing campaign."""
    campaign = await generate_campaign(business_name, objective, budget_eur, duration_days)

    export_path = (
        settings.EXPORTS_DIR
        / f"campaign_{business_name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.json"
    )
    with open(export_path, "w", encoding="utf-8") as f:
        json.dump(campaign, f, ensure_ascii=False, indent=2)

    memory.store(
        f"Campaign '{campaign.get('campaign_name', '')}' for {business_name}",
        metadata={"type": "campaign", "business": business_name, "objective": objective},
        collection="local_business",
    )
    return {"campaign": campaign, "export_file": str(export_path)}


async def list_clients(limit: int = 50) -> list[dict]:
    """List all client profiles."""
    return memory.get_all(collection="clients", limit=limit)


async def search_content(query: str, limit: int = 10) -> list[dict]:
    """Search generated content across all local business collections."""
    return memory.search(query, n_results=limit, collection="local_business")
