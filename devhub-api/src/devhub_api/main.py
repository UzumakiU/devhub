"""
DevHub Backend - Main Application Entry Point
Clean, focused FastAPI application setup
"""
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
import logging

# Import from our organized structure
from .core import settings, get_db
from .api.v1 import auth, crm, admin, database, projects, invoices

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    """Application factory pattern"""
    
    app = FastAPI(
        title="DevHub API",
        description="Business Management Hub - Clean Architecture",
        version="1.0.0"
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API routers
    app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
    app.include_router(crm.router, prefix="/api/v1/crm", tags=["crm"])
    app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
    app.include_router(database.router, prefix="/api/v1/database", tags=["database"])
    app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
    app.include_router(invoices.router, prefix="/api/v1/invoices", tags=["invoices"])

    @app.get("/")
    async def root():
        """Health check endpoint"""
        return {
            "message": "DevHub API is running!",
            "tenant_id": settings.TENANT_ID,
            "environment": settings.ENVIRONMENT,
            "version": "1.0.0"
        }

    @app.get("/api/health")
    async def health_check(db: Session = Depends(get_db)):
        """Health check with database connectivity"""
        try:
            # Test database connection
            db.execute(text("SELECT 1"))
            db_status = "connected"
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            db_status = "disconnected"
            
        return {
            "status": "healthy",
            "service": "devhub-api",
            "database": db_status,
            "features": {
                "crm": settings.FEATURE_CRM,
                "projects": settings.FEATURE_PROJECTS,
                "invoices": settings.FEATURE_INVOICES
            }
        }

    return app

# Create the app instance
app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005, reload=True)
