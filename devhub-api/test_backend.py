#!/usr/bin/env python3
"""
Quick test script to verify backend implementation
"""
import sys
import os

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

try:
    # Test imports
    print("Testing imports...")
    
    # Test models
    from devhub_api.models import (
        Project, ProjectStatus,
        Invoice, InvoiceItem, InvoiceStatus,
        Customer, Tenant
    )
    print("✓ Models imported successfully")
    
    # Test schemas  
    from devhub_api.schemas import (
        ProjectCreate, ProjectResponse,
        InvoiceCreate, InvoiceResponse
    )
    print("✓ Schemas imported successfully")
    
    # Test API routers
    from devhub_api.api.v1 import projects, invoices
    print("✓ API routers imported successfully")
    
    # Test app creation
    from devhub_api.main import create_app
    app = create_app()
    print("✓ FastAPI app created successfully")
    
    print("\n🎉 Backend implementation is ready!")
    print("\nNext steps:")
    print("1. Run database migrations to create new tables")
    print("2. Start the development server")
    print("3. Test the API endpoints")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
