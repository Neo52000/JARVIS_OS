"""API Routes — Client Management + Billing."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services import client_manager as cm

router = APIRouter(prefix="/clients", tags=["Client Management"])


class NewClientRequest(BaseModel):
    name: str
    business_type: str
    email: str = ""
    phone: str = ""
    location: str = ""
    plan: str = "starter"
    monthly_price: float = 49.0
    notes: str = ""


class InvoiceRequest(BaseModel):
    client_id: str
    amount: float
    description: str = "Gestion contenu mensuelle"
    period: str = ""


class UpdateClientRequest(BaseModel):
    plan: str | None = None
    monthly_price: float | None = None
    notes: str | None = None
    email: str | None = None
    phone: str | None = None


@router.post("/")
async def create_client(req: NewClientRequest):
    client = cm.add_client(
        name=req.name, business_type=req.business_type, email=req.email,
        phone=req.phone, location=req.location, plan=req.plan,
        monthly_price=req.monthly_price, notes=req.notes,
    )
    return {"status": "ok", "client": client}


@router.get("/")
async def get_clients(status: str = "active"):
    clients = cm.list_clients(status)
    return {"status": "ok", "clients": clients, "count": len(clients)}


@router.get("/plans")
async def get_plans():
    return {"status": "ok", "plans": cm.get_plans()}


@router.get("/revenue")
async def get_revenue():
    stats = cm.get_revenue_stats()
    return {"status": "ok", "stats": stats}


@router.get("/{client_id}")
async def get_client(client_id: str):
    client = cm.get_client(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"status": "ok", "client": client}


@router.patch("/{client_id}")
async def update_client(client_id: str, req: UpdateClientRequest):
    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    client = cm.update_client(client_id, **updates)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"status": "ok", "client": client}


@router.delete("/{client_id}")
async def deactivate_client(client_id: str):
    success = cm.deactivate_client(client_id)
    if not success:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"status": "ok", "message": "Client deactivated"}


@router.post("/invoices")
async def create_invoice(req: InvoiceRequest):
    invoice = cm.create_invoice(req.client_id, req.amount, req.description, req.period)
    if "error" in invoice:
        raise HTTPException(status_code=404, detail=invoice["error"])
    return {"status": "ok", "invoice": invoice}


@router.get("/invoices/all")
async def list_invoices(client_id: str = "", status: str = ""):
    invoices = cm.list_invoices(client_id, status)
    return {"status": "ok", "invoices": invoices, "count": len(invoices)}


@router.post("/invoices/{invoice_id}/pay")
async def mark_paid(invoice_id: str):
    success = cm.mark_invoice_paid(invoice_id)
    if not success:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"status": "ok", "message": "Invoice marked as paid"}
