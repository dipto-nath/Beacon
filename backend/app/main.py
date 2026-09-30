"""
FastAPI application factory.
"""
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html

from app.config import settings
from app.database import init_db, close_db
from app.core.exceptions import BeaconException
from app.core.security import blacklist_token, is_token_blacklisted
from app.routers import (
    auth,
    students,
    check_ins,
    mood,
    assessments,
    recommendations,
    resources,
    counseling,
    appointments,
    privacy,
    staff,
    admin,
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler."""
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    app = FastAPI(
        title="Beacon API",
        description="Student Mental Health & Wellbeing Platform API",
        version="1.0.0",
        docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
        redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
        openapi_url="/openapi.json" if settings.ENVIRONMENT != "production" else None,
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["Retry-After"],
    )

    # Global exception handler for BeaconException
    @app.exception_handler(BeaconException)
    async def beacon_exception_handler(request: Request, exc: BeaconException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": {"code": exc.code, "message": exc.message, "detail": exc.detail}},
            headers=exc.headers,
        )

    # Global exception handler for unexpected errors
    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        # Log the error (in production, use proper logging)
        if settings.DEBUG:
            import traceback
            traceback.print_exc()
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": {"code": "INTERNAL_ERROR", "message": "An internal error occurred", "detail": None}},
        )

    # Token blacklist middleware
    @app.middleware("http")
    async def token_blacklist_middleware(request: Request, call_next):
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            if await is_token_blacklisted(token):
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"error": {"code": "TOKEN_BLACKLISTED", "message": "Token has been revoked", "detail": None}},
                    headers={"WWW-Authenticate": "Bearer"},
                )
        response = await call_next(request)
        return response

    # Health check endpoint
    @app.get("/health", tags=["Health"])
    async def health_check():
        return {"status": "healthy", "environment": settings.ENVIRONMENT}

    # Include routers
    app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
    app.include_router(students.router, prefix="/api/v1", tags=["Students"])
    app.include_router(check_ins.router, prefix="/api/v1/check-ins", tags=["Check-ins"])
    app.include_router(mood.router, prefix="/api/v1/mood", tags=["Mood"])
    app.include_router(assessments.router, prefix="/api/v1/assessments", tags=["Assessments"])
    app.include_router(recommendations.router, prefix="/api/v1/recommendations", tags=["Recommendations"])
    app.include_router(resources.router, prefix="/api/v1/resources", tags=["Resources"])
    app.include_router(counseling.router, prefix="/api/v1/counseling", tags=["Counseling"])
    app.include_router(appointments.router, prefix="/api/v1/appointments", tags=["Appointments"])
    app.include_router(privacy.router, prefix="/api/v1/privacy", tags=["Privacy"])
    app.include_router(staff.router, prefix="/api/v1/staff", tags=["Staff"])
    app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)