"""
Admin API endpoints
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def admin_health():
    """Admin module health check"""
    return {"status": "healthy", "module": "admin"}
