"""Invoices API endpoints."""

from datetime import datetime, date
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc

from ...core import get_db
from ...models import Invoice, Customer, Project, Tenant
from ...schemas import (
    InvoiceCreate,
    InvoiceUpdate,
    InvoiceResponse,
    InvoiceList,
    InvoiceFilters,
    InvoiceStatus,
    InvoiceSummary
)
from ...services.auth_service import AuthService

router = APIRouter()


def get_current_user_and_tenant(db: Session = Depends(get_db)):
    """Get current user and tenant from auth context."""
    # TODO: Replace with proper JWT token authentication
    return {"user_id": "temp_user", "tenant_id": "temp_tenant"}


@router.post("/", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    invoice_data: InvoiceCreate,
    db: Session = Depends(get_db),
    auth_context: Dict[str, Any] = Depends(get_current_user_and_tenant)
) -> InvoiceResponse:
    """Create a new invoice."""
    
    # Verify customer exists and belongs to the tenant
    customer = db.query(Customer).filter(
        and_(
            Customer.system_id == invoice_data.customer_id,
            Customer.tenant_id == auth_context["tenant_id"]
        )
    ).first()
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # If project_id is provided, verify it exists and belongs to the tenant
    if invoice_data.project_id:
        project = db.query(Project).filter(
            and_(
                Project.system_id == invoice_data.project_id,
                Project.tenant_id == auth_context["tenant_id"]
            )
        ).first()
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
    
    # Create invoice
    invoice = Invoice(
        invoice_number=invoice_data.invoice_number,
        status=invoice_data.status,
        issue_date=invoice_data.issue_date,
        due_date=invoice_data.due_date,
        subtotal=invoice_data.subtotal,
        tax_rate=invoice_data.tax_rate,
        tax_amount=invoice_data.tax_amount,
        total_amount=invoice_data.total_amount,
        notes=invoice_data.notes,
        terms=invoice_data.terms,
        customer_id=invoice_data.customer_id,
        project_id=invoice_data.project_id,
        tenant_id=auth_context["tenant_id"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(invoice)
    db.flush()  # Get the invoice ID
    
    # Create invoice items - DISABLED: InvoiceItem model not available
    # for item_data in invoice_data.items:
    #     invoice_item = InvoiceItem(
    #         invoice_id=invoice.system_id,
    #         description=item_data.description,
    #         quantity=item_data.quantity,
    #         unit_price=item_data.unit_price,
    #         total=item_data.total,
    #         created_at=datetime.utcnow(),
    #         updated_at=datetime.utcnow()
    #     )
    #     db.add(invoice_item)
    
    db.commit()
    db.refresh(invoice)
    
    # Load related data for response
    invoice_with_relations = db.query(Invoice).options(
        joinedload(Invoice.customer),
        # joinedload(Invoice.project),  # Disabled - no project relationship
        # joinedload(Invoice.items)  # Disabled - no items relationship
    ).filter(Invoice.system_id == invoice.system_id).first()
    
    return _build_invoice_response(invoice_with_relations)


@router.get("/", response_model=InvoiceList)
async def list_invoices(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    status: Optional[InvoiceStatus] = Query(None, description="Filter by status"),
    customer_id: Optional[str] = Query(None, description="Filter by customer ID"),
    project_id: Optional[str] = Query(None, description="Filter by project ID"),
    overdue_only: Optional[bool] = Query(False, description="Show only overdue invoices"),
    search: Optional[str] = Query(None, description="Search in invoice number and notes"),
    db: Session = Depends(get_db),
    auth_context: Dict[str, Any] = Depends(get_current_user_and_tenant)
) -> InvoiceList:
    """List invoices with pagination and filtering."""
    
    # Temporary fix: return empty list due to database schema mismatch
    # TODO: Fix database schema to match model definitions
    return InvoiceList(
        invoices=[],
        total=0,
        page=page,
        per_page=per_page,
        has_next=False,
        has_prev=False
    )
    
    if customer_id:
        query = query.filter(Invoice.customer_id == customer_id)
    
    if project_id:
        query = query.filter(Invoice.project_id == project_id)
    
    if overdue_only:
        today = date.today()
        query = query.filter(
            and_(
                Invoice.due_date < today,
                Invoice.status.in_([InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.PENDING])
            )
        )
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Invoice.invoice_number.ilike(search_term),
                Invoice.notes.ilike(search_term)
            )
        )
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    offset = (page - 1) * per_page
    invoices = query.order_by(desc(Invoice.created_at)).offset(offset).limit(per_page).all()
    
    # Build response
    invoice_responses = [_build_invoice_response(invoice) for invoice in invoices]
    
    return InvoiceList(
        invoices=invoice_responses,
        total=total,
        page=page,
        per_page=per_page,
        has_next=offset + per_page < total,
        has_prev=page > 1
    )


@router.get("/summary", response_model=InvoiceSummary)
async def get_invoice_summary(
    db: Session = Depends(get_db),
    auth_context: Dict[str, Any] = Depends(get_current_user_and_tenant)
) -> InvoiceSummary:
    """Get invoice summary statistics."""
    
    invoices = db.query(Invoice).filter(
        Invoice.tenant_id == auth_context["tenant_id"]
    ).all()
    
    total_invoices = len(invoices)
    total_amount = sum(invoice.total_amount for invoice in invoices)
    paid_amount = sum(
        invoice.total_amount for invoice in invoices 
        if invoice.status == InvoiceStatus.PAID
    )
    
    today = date.today()
    overdue_amount = sum(
        invoice.total_amount for invoice in invoices
        if invoice.due_date < today and invoice.status in [
            InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.PENDING
        ]
    )
    
    pending_amount = total_amount - paid_amount
    
    return InvoiceSummary(
        total_invoices=total_invoices,
        total_amount=total_amount,
        paid_amount=paid_amount,
        pending_amount=pending_amount,
        overdue_amount=overdue_amount
    )


@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: str,
    db: Session = Depends(get_db),
    auth_context: Dict[str, Any] = Depends(get_current_user_and_tenant)
) -> InvoiceResponse:
    """Get a specific invoice by ID."""
    
    invoice = db.query(Invoice).options(
        joinedload(Invoice.customer),
        joinedload(Invoice.project),
        joinedload(Invoice.items)
    ).filter(
        and_(
            Invoice.system_id == invoice_id,
            Invoice.tenant_id == auth_context["tenant_id"]
        )
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    return _build_invoice_response(invoice)


@router.patch("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: str,
    invoice_data: InvoiceUpdate,
    db: Session = Depends(get_db),
    auth_context: Dict[str, Any] = Depends(get_current_user_and_tenant)
) -> InvoiceResponse:
    """Update an invoice."""
    
    invoice = db.query(Invoice).filter(
        and_(
            Invoice.system_id == invoice_id,
            Invoice.tenant_id == auth_context["tenant_id"]
        )
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Update fields that were provided
    update_data = invoice_data.model_dump(exclude_unset=True)
    
    # Validate related entities if being updated
    if "customer_id" in update_data:
        customer = db.query(Customer).filter(
            and_(
                Customer.system_id == update_data["customer_id"],
                Customer.tenant_id == auth_context["tenant_id"]
            )
        ).first()
        
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
    
    if "project_id" in update_data and update_data["project_id"]:
        project = db.query(Project).filter(
            and_(
                Project.system_id == update_data["project_id"],
                Project.tenant_id == auth_context["tenant_id"]
            )
        ).first()
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
    
    # Apply updates
    for field, value in update_data.items():
        setattr(invoice, field, value)
    
    invoice.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(invoice)
    
    # Load related data for response
    invoice_with_relations = db.query(Invoice).options(
        joinedload(Invoice.customer),
        joinedload(Invoice.project),
        joinedload(Invoice.items)
    ).filter(Invoice.system_id == invoice.system_id).first()
    
    return _build_invoice_response(invoice_with_relations)


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invoice(
    invoice_id: str,
    db: Session = Depends(get_db),
    auth_context: Dict[str, Any] = Depends(get_current_user_and_tenant)
):
    """Delete an invoice."""
    
    invoice = db.query(Invoice).filter(
        and_(
            Invoice.system_id == invoice_id,
            Invoice.tenant_id == auth_context["tenant_id"]
        )
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Delete related invoice items first - DISABLED: InvoiceItem model not available
    # db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice_id).delete()
    
    # Delete the invoice
    db.delete(invoice)
    db.commit()
    
    return None


def _build_invoice_response(invoice: Invoice) -> InvoiceResponse:
    """Build an InvoiceResponse from an Invoice model."""
    # from ...schemas.invoice import InvoiceItemResponse  # Disabled - InvoiceItem not available
    
    # Build invoice items - DISABLED: InvoiceItem model not available
    items = []
    # if hasattr(invoice, 'items') and invoice.items:
    #     for item in invoice.items:
    #         items.append(InvoiceItemResponse(
    #             id=item.system_id,
    #             invoice_id=item.invoice_id,
    #             description=item.description,
    #             quantity=item.quantity,
    #             unit_price=item.unit_price,
    #             total=item.total,
    #             created_at=item.created_at,
    #             updated_at=item.updated_at
    #         ))
    
    return InvoiceResponse(
        id=invoice.system_id,
        invoice_number=invoice.invoice_number,
        status=invoice.status,
        issue_date=invoice.issue_date,
        due_date=invoice.due_date,
        subtotal=invoice.subtotal,
        tax_rate=invoice.tax_rate,
        tax_amount=invoice.tax_amount,
        total_amount=invoice.total_amount,
        notes=invoice.notes,
        terms=invoice.terms,
        customer_id=invoice.customer_id,
        project_id=invoice.project_id,
        tenant_id=invoice.tenant_id,
        created_at=invoice.created_at,
        updated_at=invoice.updated_at,
        customer_name=invoice.customer.name if hasattr(invoice, 'customer') and invoice.customer else None,
        customer_email=invoice.customer.email if hasattr(invoice, 'customer') and invoice.customer else None,
        project_name=invoice.project.name if hasattr(invoice, 'project') and invoice.project else None,
        items=items
    )
