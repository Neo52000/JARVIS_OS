"""Print-on-Demand Workflow — Full pipeline from idea to listing."""
import json
from datetime import datetime
from pathlib import Path
from config import settings
from services.image_generator import generate_pod_design, generate_batch_designs, generate_etsy_listing
from core.memory import chroma_store as memory


async def create_single_product(niche: str, style: str = "modern minimalist") -> dict:
    """Generate one complete POD product with Etsy listing."""
    design = await generate_pod_design(niche, style)
    listing = await generate_etsy_listing(design)

    product = {
        "design": design,
        "listing": listing,
        "created_at": datetime.now().isoformat(),
        "status": "ready_to_publish",
    }

    memory.store(
        f"POD Product: {listing.get('title', niche)} \u2014 Niche: {niche}",
        metadata={"type": "pod_product", "niche": niche, "status": "ready"},
        collection="pod_products",
    )
    return product


async def create_product_batch(niche: str, count: int = 5, style: str = "modern minimalist") -> dict:
    """Generate a batch of POD products and export to JSON."""
    designs = await generate_batch_designs(niche, count, style)

    products = []
    for design in designs:
        listing = await generate_etsy_listing(design)
        products.append({
            "design": design,
            "listing": listing,
            "status": "ready_to_publish",
        })

    export_path = settings.EXPORTS_DIR / f"pod_batch_{niche.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(export_path, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    memory.store(
        f"POD Batch: {count} products for niche '{niche}' \u2014 exported to {export_path.name}",
        metadata={"type": "pod_batch", "niche": niche, "count": count},
        collection="pod_products",
    )

    return {
        "products": products,
        "count": len(products),
        "export_file": str(export_path),
        "niche": niche,
    }


async def list_products(limit: int = 20) -> list[dict]:
    """List all generated POD products from memory."""
    return memory.get_all(collection="pod_products", limit=limit)
