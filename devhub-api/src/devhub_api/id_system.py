"""
ID Generation System for DevHub Multi-Tenant SaaS Platform
Implements prefixed sequential IDs (USR-000, PRJ-001, TNT-000, etc.)

ARCHITECTURE CLARIFICATION:
- Platform Founder (USR-000): DevHub Enterprise owner, controls entire platform
- Tenant Businesses: Client businesses using the platform (TNT-000, TNT-001, etc.)
- Business Owners: Own/control their specific tenant business completely
- Business Employees: Work within a tenant business with role-based permissions
"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from .models.tenant import Tenant
from .models.user import User
from .models.project import Project
from .models.crm import Customer, Lead, CustomerInteraction, CustomerNote
from .models.invoice import Invoice


class IDGenerator:
    """Generates sequential IDs with prefixes for different entity types"""
    
    PREFIXES = {
        "tenant": "TNT",
        "user": "USR",
        "project": "PRJ", 
        "customer": "CUS",
        "invoice": "INV",
        "lead": "LED",
        "customer_interaction": "INT",
        "customer_note": "NOT"
    }
    
    @classmethod
    def generate_id(cls, entity_type: str, db: Session) -> str:
        """
        Generate the next sequential ID for the given entity type
        
        Args:
            entity_type: Type of entity (tenant, user, project, customer, invoice)
            db: Database session
            
        Returns:
            Next sequential ID like TNT-001, USR-001, PRJ-002, etc.
        """
        prefix = cls.PREFIXES.get(entity_type.lower())
        if not prefix:
            raise ValueError(f"Unknown entity type: {entity_type}")
        
        # Get the next sequence number
        next_num = cls._get_next_sequence_number(entity_type, db)
        
        # Format as PREFIX-###
        return f"{prefix}-{next_num:03d}"
    
    @classmethod
    def _get_next_sequence_number(cls, entity_type: str, db: Session) -> int:
        """
        Get the next sequence number for the given entity type
        
        Uses database-level operations for better consistency and performance
        """
        
        model_map = {
            "tenant": Tenant,
            "user": User,
            "project": Project,
            "customer": Customer,
            "invoice": Invoice,
            "lead": Lead,
            "customer_interaction": CustomerInteraction,
            "customer_note": CustomerNote
        }
        
        model = model_map.get(entity_type.lower())
        if not model:
            raise ValueError(f"Unknown entity type: {entity_type}")
        
        # Get the prefix for this entity type
        prefix = cls.PREFIXES[entity_type.lower()]
        
        # Use SQL to get the maximum sequence number efficiently
        from sqlalchemy import text, func
        
        # Query for records with the correct prefix pattern
        query = db.query(model.system_id).filter(
            model.system_id.like(f"{prefix}-%")
        )
        
        # Get all matching IDs
        existing_ids = query.all()
        
        if not existing_ids:
            return 0  # Start from 0 if no records exist
        
        # Extract sequence numbers from existing IDs
        max_seq = -1
        for (system_id,) in existing_ids:
            try:
                # Extract number from format like "CUS-020"
                if '-' in system_id:
                    seq_str = system_id.split('-')[1]
                    # Validate it's a proper number (3 digits)
                    if seq_str.isdigit() and len(seq_str) == 3:
                        seq_num = int(seq_str)
                        max_seq = max(max_seq, seq_num)
            except (IndexError, ValueError):
                continue
        
        # Return the next number (starting from 0 if none found)
        return max_seq + 1
    
    @classmethod
    def validate_id_format(cls, entity_type: str, system_id: str) -> bool:
        """
        Validate that an ID follows the correct format
        
        Args:
            entity_type: Type of entity (tenant, user, etc.)
            system_id: The ID to validate
            
        Returns:
            True if valid format, False otherwise
        """
        prefix = cls.PREFIXES.get(entity_type.lower())
        if not prefix:
            return False
        
        # Check format: PREFIX-###
        import re
        pattern = f"^{prefix}-\\d{{3}}$"
        return bool(re.match(pattern, system_id))
    
    @classmethod
    def get_sequence_number(cls, system_id: str) -> int:
        """
        Extract the sequence number from a system ID
        
        Args:
            system_id: The system ID (e.g., "CUS-042")
            
        Returns:
            The sequence number (e.g., 42)
        """
        try:
            if '-' in system_id:
                return int(system_id.split('-')[1])
        except (IndexError, ValueError):
            pass
        return -1
    
    @classmethod
    def get_display_id(cls, system_id: str, is_founder: bool = False, user_role: str | None = None) -> str:
        """
        Get the display ID for a user
        
        Args:
            system_id: The system ID (e.g., USR-000)
            is_founder: Whether this is the platform founder
            user_role: The user's role (BUSINESS_OWNER, MANAGER, EMPLOYEE)
            
        Returns:
            Display ID (FOUNDER for founder, role-based for others)
        """
        if is_founder and system_id == "USR-000":
            return "FOUNDER"
        elif user_role == "BUSINESS_OWNER":
            return "BUSINESS_OWNER"
        return system_id


def create_tenant(db: Session, business_name: str, business_email: str, owner_email: str, 
                 owner_password_hash: str, owner_full_name: str, subscription_plan: str = "starter") -> tuple[Tenant, User]:
    """
    Create a new tenant business with its business owner
    
    Args:
        db: Database session
        business_name: Name of the business (e.g., "ACME Corp")
        business_email: Business contact email
        owner_email: Business owner's email
        owner_password_hash: Hashed password for business owner
        owner_full_name: Business owner's full name
        subscription_plan: Subscription plan (starter, professional, enterprise)
        
    Returns:
        Tuple of (Tenant, User) objects
    """
    # Generate tenant ID
    tenant_id = IDGenerator.generate_id("tenant", db)
    
    # Create tenant
    tenant = Tenant(
        system_id=tenant_id,
        business_name=business_name,
        business_email=business_email,
        subscription_plan=subscription_plan,
        is_active=True
    )
    
    db.add(tenant)
    db.flush()  # Get the tenant ID for the user
    
    # Generate user ID for business owner
    user_system_id = IDGenerator.generate_id("user", db)
    
    # Create business owner user
    business_owner = User(
        system_id=user_system_id,
        display_id="BUSINESS_OWNER",
        email=owner_email,
        full_name=owner_full_name,
        hashed_password=owner_password_hash,
        tenant_id=tenant_id,
        user_role="BUSINESS_OWNER",
        is_founder=False,
        is_active=True
    )
    
    db.add(business_owner)
    db.commit()
    db.refresh(tenant)
    db.refresh(business_owner)
    
    return tenant, business_owner


def create_founder_account(db: Session, email: str, password_hash: str, full_name: str) -> User:
    """
    Create the platform founder account with special ID USR-000
    This is the DevHub Enterprise owner who controls the entire platform
    
    Args:
        db: Database session
        email: Founder email
        password_hash: Hashed password
        full_name: Founder full name
        
    Returns:
        Created User object
    """
    # Check if founder already exists
    existing_founder = db.query(User).filter(User.system_id == "USR-000").first()
    if existing_founder:
        raise ValueError("Platform founder already exists")
    
    # Create founder with fixed ID USR-000 (no tenant_id - controls platform)
    founder = User(
        system_id="USR-000",
        display_id="FOUNDER",
        email=email,
        full_name=full_name,
        hashed_password=password_hash,
        tenant_id=None,  # Platform founder doesn't belong to any tenant
        user_role="FOUNDER",
        is_founder=True,
        is_active=True
    )
    
    db.add(founder)
    db.commit()
    db.refresh(founder)
    
    return founder


def create_tenant_user(db: Session, tenant_id: str, email: str, password_hash: str, 
                      full_name: str, user_role: str = "EMPLOYEE", department: str = None) -> User:
    """
    Create a user within an existing tenant business
    
    Args:
        db: Database session
        tenant_id: The tenant business ID (e.g., TNT-001)
        email: User email
        password_hash: Hashed password
        full_name: User full name
        user_role: Role within tenant (BUSINESS_OWNER, MANAGER, EMPLOYEE)
        department: Department (sales, marketing, development, admin, etc.)
        
    Returns:
        Created User object
    """
    # Verify tenant exists
    tenant = db.query(Tenant).filter(Tenant.system_id == tenant_id).first()
    if not tenant:
        raise ValueError(f"Tenant {tenant_id} not found")
    
    # Generate next user ID
    system_id = IDGenerator.generate_id("user", db)
    display_id = IDGenerator.get_display_id(system_id, False, user_role)
    
    user = User(
        system_id=system_id,
        display_id=display_id,
        email=email,
        full_name=full_name,
        hashed_password=password_hash,
        tenant_id=tenant_id,
        user_role=user_role,
        department=department,
        is_founder=False,
        is_active=True
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


# Legacy function for backwards compatibility
def create_user(db: Session, email: str, password_hash: str, full_name: str) -> User:
    """
    DEPRECATED: Create a regular user with auto-generated ID
    Use create_tenant_user() instead for multi-tenant setup
    """
    return create_tenant_user(db, None, email, password_hash, full_name)
