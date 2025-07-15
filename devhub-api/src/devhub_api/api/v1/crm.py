"""
CRM API endpoints
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def crm_health():
    """CRM module health check"""
    return {"status": "healthy", "module": "crm"}
