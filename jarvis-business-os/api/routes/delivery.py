"""API Routes — Content Delivery."""
from fastapi import APIRouter, HTTPException
from workflows.client_delivery import (
    generate_weekly_delivery,
    generate_all_deliveries,
    generate_monthly_invoice_batch,
)

router = APIRouter(prefix="/delivery", tags=["Content Delivery"])


@router.post("/client/{client_id}")
async def deliver_to_client(client_id: str):
    result = await generate_weekly_delivery(client_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return {"status": "ok", "delivery": result}


@router.post("/all")
async def deliver_to_all():
    result = await generate_all_deliveries()
    return {"status": "ok", "result": result}


@router.post("/invoices/batch")
async def batch_invoices():
    result = await generate_monthly_invoice_batch()
    return {"status": "ok", "result": result}
