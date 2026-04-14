"""Automated Tasks — Scheduled jobs for content generation and client management."""
import json
import logging
from datetime import datetime
from config import settings
from core.memory import chroma_store as memory

log = logging.getLogger("jarvis.tasks")


async def daily_pod_generation(niche: str = "trending", count: int = 3, style: str = "modern minimalist"):
    """Auto-generate POD products daily."""
    from workflows.pod_workflow import create_product_batch

    log.info(f"[CRON] Generating {count} POD products for niche: {niche}")
    try:
        result = await create_product_batch(niche, count, style)
        log.info(f"[CRON] POD batch complete: {result['count']} products \u2192 {result['export_file']}")
        memory.store(
            f"[AUTO] Daily POD: {count} products for '{niche}'",
            metadata={"type": "auto_pod", "niche": niche, "count": count},
        )
        return result
    except Exception as e:
        log.error(f"[CRON] POD generation failed: {e}")
        return None


async def daily_content_generation(clients: list[dict] | None = None):
    """Auto-generate social posts for all active clients."""
    from workflows.local_business_workflow import create_post

    if clients is None:
        stored = memory.get_all(collection="clients", limit=50)
        clients = []
        for c in stored:
            try:
                data = json.loads(c["text"]) if isinstance(c["text"], str) and c["text"].startswith("{") else {}
                if data.get("client_name"):
                    clients.append(data)
            except (json.JSONDecodeError, KeyError):
                continue

    log.info(f"[CRON] Generating daily content for {len(clients)} clients")
    results = []
    for client in clients:
        try:
            name = client.get("client_name", client.get("name", "Unknown"))
            btype = client.get("business_type", "commerce")
            post = await create_post(name, btype, "contenu du jour", "instagram")
            results.append({"client": name, "status": "ok", "post": post})
            log.info(f"[CRON] Post generated for {name}")
        except Exception as e:
            results.append({"client": client.get("client_name", "?"), "status": "error", "error": str(e)})
            log.error(f"[CRON] Failed for {client.get('client_name', '?')}: {e}")

    export_path = (
        settings.EXPORTS_DIR
        / f"daily_content_{datetime.now().strftime('%Y%m%d')}.json"
    )
    with open(export_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    log.info(f"[CRON] Daily content complete: {len(results)} posts \u2192 {export_path}")
    return {"posts": results, "export_file": str(export_path)}


async def weekly_report():
    """Generate a weekly activity report."""
    from core.orchestrator import orchestrator

    log.info("[CRON] Generating weekly report")
    execution_log = orchestrator.get_log(100)
    pod_products = memory.get_all(collection="pod_products", limit=100)
    business_content = memory.get_all(collection="local_business", limit=100)
    clients = memory.get_all(collection="clients", limit=100)

    report = {
        "period": f"Week of {datetime.now().strftime('%Y-%m-%d')}",
        "generated_at": datetime.now().isoformat(),
        "stats": {
            "total_executions": len(execution_log),
            "pod_products_created": len(pod_products),
            "marketing_content_created": len(business_content),
            "active_clients": len(clients),
        },
        "recent_executions": execution_log[-20:],
    }

    export_path = (
        settings.EXPORTS_DIR
        / f"weekly_report_{datetime.now().strftime('%Y%m%d')}.json"
    )
    with open(export_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    log.info(f"[CRON] Weekly report \u2192 {export_path}")
    return report
