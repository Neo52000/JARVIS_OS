"""Client Delivery Workflow — Generate and package content for client handoff."""
import json
import logging
from datetime import datetime
from config import settings
from services import client_manager as cm
from workflows.local_business_workflow import create_post

log = logging.getLogger("jarvis.delivery")


async def generate_weekly_delivery(client_id: str) -> dict:
    """Generate a full week of content for a specific client and package it."""
    client = cm.get_client(client_id)
    if not client:
        return {"error": "Client not found"}

    plan = cm.PLANS.get(client.get("plan", "starter"), cm.PLANS["starter"])
    posts_per_week = plan["posts_per_week"]
    platforms = plan["platforms"]

    log.info(f"Generating {posts_per_week} posts for {client['name']} ({client['plan']})")

    topics = [
        "nouveaut\u00e9 de la semaine", "conseil expert", "promotion sp\u00e9ciale",
        "coulisses / vie du commerce", "t\u00e9moignage client", "astuce du jour",
        "\u00e9v\u00e9nement local", "produit phare", "histoire du commerce",
        "question interactive", "avant/apr\u00e8s", "partenariat local",
        "actualit\u00e9 saisonni\u00e8re", "\u00e9quipe / humain",
    ]

    posts = []
    for i in range(min(posts_per_week, len(topics))):
        platform = platforms[i % len(platforms)]
        try:
            post = await create_post(
                client["name"], client["business_type"], topics[i], platform,
            )
            post["day"] = i + 1
            post["scheduled_platform"] = platform
            posts.append(post)
        except Exception as e:
            log.error(f"Failed to generate post {i+1}: {e}")
            posts.append({"day": i + 1, "error": str(e)})

    cm.record_content(client_id, "weekly_delivery", len(posts))

    delivery = {
        "client": {
            "name": client["name"],
            "business_type": client["business_type"],
            "plan": client["plan"],
        },
        "period": f"Semaine du {datetime.now().strftime('%d/%m/%Y')}",
        "generated_at": datetime.now().isoformat(),
        "posts_count": len(posts),
        "posts": posts,
    }

    safe_name = client["name"].replace(" ", "_").lower()
    export_path = (
        settings.EXPORTS_DIR
        / f"delivery_{safe_name}_{datetime.now().strftime('%Y%m%d')}.json"
    )
    with open(export_path, "w", encoding="utf-8") as f:
        json.dump(delivery, f, ensure_ascii=False, indent=2)

    log.info(f"Delivery for {client['name']}: {len(posts)} posts \u2192 {export_path}")
    return {"delivery": delivery, "export_file": str(export_path)}


async def generate_all_deliveries() -> dict:
    """Generate weekly deliveries for ALL active clients."""
    clients = cm.list_clients(status="active")
    results = []
    for client in clients:
        try:
            result = await generate_weekly_delivery(client["id"])
            results.append({
                "client": client["name"],
                "status": "ok",
                "posts_count": result.get("delivery", {}).get("posts_count", 0),
                "export": result.get("export_file", ""),
            })
        except Exception as e:
            results.append({"client": client["name"], "status": "error", "error": str(e)})

    return {
        "total_clients": len(clients),
        "deliveries": results,
        "generated_at": datetime.now().isoformat(),
    }


async def generate_monthly_invoice_batch() -> dict:
    """Generate invoices for all active clients for the current month."""
    clients = cm.list_clients(status="active")
    invoices = []
    for client in clients:
        price = client.get("monthly_price", 0)
        if price > 0:
            invoice = cm.create_invoice(
                client_id=client["id"],
                amount=price,
                description=f"Gestion contenu {client.get('plan', 'starter').title()} \u2014 {datetime.now().strftime('%B %Y')}",
            )
            invoices.append(invoice)

    return {
        "invoices_created": len(invoices),
        "total_amount": sum(i.get("amount", 0) for i in invoices),
        "invoices": invoices,
    }
