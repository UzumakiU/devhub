"""
Database API endpoints
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def database_health():
    """Database module health check"""
    return {"status": "healthy", "module": "database"}
