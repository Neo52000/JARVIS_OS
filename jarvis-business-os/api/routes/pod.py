"""API Routes — Print-on-Demand."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from workflows import pod_workflow

router = APIRouter(prefix="/pod", tags=["Print-on-Demand"])


class ProductRequest(BaseModel):
    niche: str
    style: str = "modern minimalist"


class BatchRequest(BaseModel):
    niche: str
    count: int = 5
    style: str = "modern minimalist"


@router.post("/product")
async def create_product(req: ProductRequest):
    try:
        result = await pod_workflow.create_single_product(req.niche, req.style)
        return {"status": "ok", "product": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch")
async def create_batch(req: BatchRequest):
    try:
        result = await pod_workflow.create_product_batch(req.niche, req.count, req.style)
        return {"status": "ok", "batch": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/products")
async def list_products(limit: int = 20):
    products = await pod_workflow.list_products(limit)
    return {"status": "ok", "products": products, "count": len(products)}
