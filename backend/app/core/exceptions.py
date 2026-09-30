"""
Custom HTTP exceptions for the application.
All exceptions include error codes for frontend handling.
"""
from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class BeaconException(HTTPException):
    """Base exception with error code."""

    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        detail: Optional[Any] = None,
        headers: Optional[Dict[str, str]] = None,
    ):
        super().__init__(
            status_code=status_code,
            detail={"code": code, "message": message, "detail": detail},
            headers=headers,
        )
        self.code = code
        self.message = message


# ─── Authentication Errors ────────────────────────────────────────

class InvalidCredentialsError(BeaconException):
    def __init__(self, message: str = "Invalid email or password"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="INVALID_CREDENTIALS",
            message=message,
            headers={"WWW-Authenticate": "Bearer"},
        )


class TokenExpiredError(BeaconException):
    def __init__(self, message: str = "Token has expired"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="TOKEN_EXPIRED",
            message=message,
            headers={"WWW-Authenticate": "Bearer"},
        )


class TokenInvalidError(BeaconException):
    def __init__(self, message: str = "Invalid token"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="TOKEN_INVALID",
            message=message,
            headers={"WWW-Authenticate": "Bearer"},
        )


class TokenBlacklistedError(BeaconException):
    def __init__(self, message: str = "Token has been revoked"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="TOKEN_BLACKLISTED",
            message=message,
            headers={"WWW-Authenticate": "Bearer"},
        )


class RefreshTokenRequiredError(BeaconException):
    def __init__(self, message: str = "Refresh token required"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="REFRESH_TOKEN_REQUIRED",
            message=message,
        )


# ─── Authorization Errors ─────────────────────────────────────────

class ForbiddenError(BeaconException):
    def __init__(self, message: str = "You don't have permission to access this resource"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="FORBIDDEN",
            message=message,
        )


class InsufficientRoleError(BeaconException):
    def __init__(self, required_role: str):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="INSUFFICIENT_ROLE",
            message=f"This action requires {required_role} role",
        )


# ─── Resource Errors ──────────────────────────────────────────────

class NotFoundError(BeaconException):
    def __init__(self, resource: str, identifier: str = ""):
        msg = f"{resource} not found"
        if identifier:
            msg += f": {identifier}"
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="NOT_FOUND",
            message=msg,
        )


class AlreadyExistsError(BeaconException):
    def __init__(self, resource: str, field: str = ""):
        msg = f"{resource} already exists"
        if field:
            msg += f" with this {field}"
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="ALREADY_EXISTS",
            message=msg,
        )


# ─── Validation Errors ────────────────────────────────────────────

class ValidationError(BeaconException):
    def __init__(self, message: str, detail: Any = None):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="VALIDATION_ERROR",
            message=message,
            detail=detail,
        )


class RateLimitError(BeaconException):
    def __init__(self, message: str = "Rate limit exceeded. Please try again later.", retry_after: int = 60):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            code="RATE_LIMIT_EXCEEDED",
            message=message,
            headers={"Retry-After": str(retry_after)},
        )


# ─── Business Logic Errors ────────────────────────────────────────

class CheckInLimitError(BeaconException):
    def __init__(self, message: str = "You have already checked in today"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="CHECK_IN_LIMIT_EXCEEDED",
            message=message,
        )


class EscalationRequiredError(BeaconException):
    def __init__(self, message: str = "Escalation required for this check-in"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="ESCALATION_REQUIRED",
            message=message,
        )


class DataExportError(BeaconException):
    def __init__(self, message: str = "Failed to generate data export"):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="EXPORT_FAILED",
            message=message,
        )


class PrivacyThresholdError(BeaconException):
    def __init__(self, message: str = "Insufficient data for privacy-preserving aggregation"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="PRIVACY_THRESHOLD_NOT_MET",
            message=message,
        )


# ─── System Errors ────────────────────────────────────────────────

class InternalServerError(BeaconException):
    def __init__(self, message: str = "An internal error occurred"):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="INTERNAL_ERROR",
            message=message,
        )


class ServiceUnavailableError(BeaconException):
    def __init__(self, message: str = "Service temporarily unavailable"):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            code="SERVICE_UNAVAILABLE",
            message=message,
        )