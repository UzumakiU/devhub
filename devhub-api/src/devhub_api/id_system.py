"""
ID Generation System for DevHub
Implements prefixed sequential IDs (USR-000, PRJ-001, etc.)
"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from .models import User, Project, Customer, Invoice


class IDGenerator:
    """Generates sequential IDs with prefixes for different entity types"""
    
    PREFIXES = {
        "user": "USR",
        "project": "PRJ", 
        "customer": "CUS",
        "invoice": "INV"
    }
    
    @classmethod
    def generate_id(cls, entity_type: str, db: Session) -> str:
        """
        Generate the next sequential ID for the given entity type
        
        Args:
            entity_type: Type of entity (user, project, customer, invoice)
            db: Database session
            
        Returns:
            Next sequential ID like USR-001, PRJ-002, etc.
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
        """Get the next sequence number for the given entity type"""
        
        model_map = {
            "user": User,
            "project": Project,
            "customer": Customer,
            "invoice": Invoice
        }
        
        model = model_map.get(entity_type.lower())
        if not model:
            raise ValueError(f"Unknown entity type: {entity_type}")
        
        # Get the current max sequence number
        result = db.query(model).count()
        
        # Return the next number (starting from 000)
        return result
    
    @classmethod
    def get_display_id(cls, system_id: str, is_founder: bool = False) -> str:
        """
        Get the display ID for a user
        
        Args:
            system_id: The system ID (e.g., USR-000)
            is_founder: Whether this is the founder account
            
        Returns:
            Display ID (FOUNDER for founder, system_id for others)
        """
        if is_founder and system_id == "USR-000":
            return "FOUNDER"
        return system_id


def create_founder_account(db: Session, email: str, password_hash: str, full_name: str) -> User:
    """
    Create the founder account with special ID USR-000
    
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
        raise ValueError("Founder account already exists")
    
    # Create founder with fixed ID USR-000
    founder = User(
        system_id="USR-000",
        display_id="FOUNDER",
        email=email,
        full_name=full_name,
        hashed_password=password_hash,
        is_founder=True,
        is_active=True
    )
    
    db.add(founder)
    db.commit()
    db.refresh(founder)
    
    return founder


def create_user(db: Session, email: str, password_hash: str, full_name: str) -> User:
    """
    Create a regular user with auto-generated ID
    
    Args:
        db: Database session
        email: User email
        password_hash: Hashed password
        full_name: User full name
        
    Returns:
        Created User object
    """
    # Generate next user ID
    system_id = IDGenerator.generate_id("user", db)
    display_id = system_id  # Same for regular users
    
    user = User(
        system_id=system_id,
        display_id=display_id,
        email=email,
        full_name=full_name,
        hashed_password=password_hash,
        is_founder=False,
        is_active=True
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user
