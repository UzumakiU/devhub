"""
Core exceptions for the application
"""
from fastapi import HTTPException, status

class DevHubException(Exception):
    """Base exception for DevHub"""
    pass

class TenantNotFound(DevHubException):
    """Tenant not found exception"""
    pass

class UserNotFound(DevHubException):
    """User not found exception"""
    pass

class InsufficientPermissions(DevHubException):
    """User lacks required permissions"""
    pass

class FeatureDisabled(HTTPException):
    """Feature is currently disabled"""
    def __init__(self, feature_name: str):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"{feature_name.title()} module is temporarily disabled"
        )

class ValidationError(HTTPException):
    """Validation error"""
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )
