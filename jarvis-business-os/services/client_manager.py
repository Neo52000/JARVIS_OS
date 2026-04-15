"""Client Management — Billing, tracking, onboarding for the agency model."""
import json
import uuid
import logging
from datetime import datetime
from pathlib import Path
from config import settings
from core.memory import chroma_store as memory

log = logging.getLogger("jarvis.clients")

CLIENTS_DB = settings.DATA_DIR / "clients.json"


def _load_db() -> dict:
    if CLIENTS_DB.exists():
        with open(CLIENTS_DB, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"clients": {}, "invoices": []}


def _save_db(db: dict):
    with open(CLIENTS_DB, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)


def add_client(
    name: str,
    business_type: str,
    email: str = "",
    phone: str = "",
    location: str = "",
    plan: str = "starter",
    monthly_price: float = 49.0,
    notes: str = "",
) -> dict:
    """Register a new client."""
    db = _load_db()
    client_id = str(uuid.uuid4())[:8]

    client = {
        "id": client_id,
        "name": name,
        "business_type": business_type,
        "email": email,
        "phone": phone,
        "location": location,
        "plan": plan,
        "monthly_price": monthly_price,
        "notes": notes,
        "status": "active",
        "created_at": datetime.now().isoformat(),
        "content_generated": 0,
        "last_content_date": None,
    }
    db["clients"][client_id] = client
    _save_db(db)

    memory.store(
        f"Client {name} ({business_type}) \u2014 Plan: {plan} \u2014 {monthly_price}\u20ac/mois",
        metadata={"type": "client", "client_id": client_id, "plan": plan},
        collection="clients",
    )
    log.info(f"New client: {name} ({client_id}) \u2014 {plan} @ {monthly_price}\u20ac")
    return client


def get_client(client_id: str) -> dict | None:
    db = _load_db()
    return db["clients"].get(client_id)


def list_clients(status: str = "active") -> list[dict]:
    db = _load_db()
    clients = list(db["clients"].values())
    if status:
        clients = [c for c in clients if c.get("status") == status]
    return sorted(clients, key=lambda c: c.get("created_at", ""), reverse=True)


def update_client(client_id: str, **updates) -> dict | None:
    db = _load_db()
    if client_id not in db["clients"]:
        return None
    db["clients"][client_id].update(updates)
    db["clients"][client_id]["updated_at"] = datetime.now().isoformat()
    _save_db(db)
    return db["clients"][client_id]


def deactivate_client(client_id: str) -> bool:
    return update_client(client_id, status="inactive") is not None


def record_content(client_id: str, content_type: str, count: int = 1):
    """Track content generated for a client."""
    db = _load_db()
    if client_id in db["clients"]:
        db["clients"][client_id]["content_generated"] = (
            db["clients"][client_id].get("content_generated", 0) + count
        )
        db["clients"][client_id]["last_content_date"] = datetime.now().isoformat()
        _save_db(db)


def create_invoice(
    client_id: str,
    amount: float,
    description: str = "Gestion contenu mensuelle",
    period: str = "",
) -> dict:
    """Create an invoice for a client."""
    db = _load_db()
    client = db["clients"].get(client_id)
    if not client:
        return {"error": "Client not found"}

    invoice_id = f"INV-{datetime.now().strftime('%Y%m')}-{str(uuid.uuid4())[:4].upper()}"
    invoice = {
        "id": invoice_id,
        "client_id": client_id,
        "client_name": client["name"],
        "amount": amount,
        "description": description,
        "period": period or datetime.now().strftime("%Y-%m"),
        "status": "pending",
        "created_at": datetime.now().isoformat(),
    }
    db["invoices"].append(invoice)
    _save_db(db)
    log.info(f"Invoice {invoice_id}: {amount}\u20ac for {client['name']}")
    return invoice


def list_invoices(client_id: str = "", status: str = "") -> list[dict]:
    db = _load_db()
    invoices = db["invoices"]
    if client_id:
        invoices = [i for i in invoices if i["client_id"] == client_id]
    if status:
        invoices = [i for i in invoices if i["status"] == status]
    return sorted(invoices, key=lambda i: i.get("created_at", ""), reverse=True)


def mark_invoice_paid(invoice_id: str) -> bool:
    db = _load_db()
    for inv in db["invoices"]:
        if inv["id"] == invoice_id:
            inv["status"] = "paid"
            inv["paid_at"] = datetime.now().isoformat()
            _save_db(db)
            return True
    return False


def get_revenue_stats() -> dict:
    """Calculate revenue statistics."""
    db = _load_db()
    active_clients = [c for c in db["clients"].values() if c["status"] == "active"]
    paid_invoices = [i for i in db["invoices"] if i["status"] == "paid"]
    pending_invoices = [i for i in db["invoices"] if i["status"] == "pending"]

    mrr = sum(c.get("monthly_price", 0) for c in active_clients)
    total_paid = sum(i["amount"] for i in paid_invoices)
    total_pending = sum(i["amount"] for i in pending_invoices)
    total_content = sum(c.get("content_generated", 0) for c in active_clients)

    return {
        "active_clients": len(active_clients),
        "mrr": mrr,
        "arr": mrr * 12,
        "total_revenue_collected": total_paid,
        "total_pending": total_pending,
        "total_content_generated": total_content,
        "avg_price_per_client": round(mrr / len(active_clients), 2) if active_clients else 0,
    }


PLANS = {
    "starter": {
        "name": "Starter",
        "price": 49,
        "posts_per_week": 3,
        "platforms": ["instagram"],
        "calendar": False,
        "campaigns": False,
        "description": "3 posts Instagram / semaine",
    },
    "pro": {
        "name": "Pro",
        "price": 99,
        "posts_per_week": 7,
        "platforms": ["instagram", "facebook"],
        "calendar": True,
        "campaigns": False,
        "description": "1 post/jour Instagram + Facebook + calendrier",
    },
    "business": {
        "name": "Business",
        "price": 199,
        "posts_per_week": 14,
        "platforms": ["instagram", "facebook"],
        "calendar": True,
        "campaigns": True,
        "description": "2 posts/jour + calendrier + campagnes mensuelles",
    },
}


def get_plans() -> dict:
    return PLANS
