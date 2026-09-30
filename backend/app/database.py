"""
Async database configuration with SQLAlchemy 2.0.
Provides engine, session factory, and base model class.
"""
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.config import settings


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


# Create async engine - handle SQLite vs PostgreSQL
database_url = settings.DATABASE_URL
is_sqlite = database_url.startswith("sqlite")

if is_sqlite:
    # SQLite doesn't support pool settings
    engine: AsyncEngine = create_async_engine(
        database_url,
        echo=settings.DEBUG,
        connect_args={"check_same_thread": False},
    )
else:
    # PostgreSQL with connection pooling
    engine: AsyncEngine = create_async_engine(
        database_url,
        echo=settings.DEBUG,
        poolclass=NullPool if settings.ENVIRONMENT == "test" else None,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
    )

# Export is_sqlite for models to use
__all__ = ["engine", "async_session_maker", "Base", "get_session", "get_session_context", "init_db", "close_db", "is_sqlite"]

# Session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency for database sessions.
    Ensures proper session lifecycle management.
    """
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@asynccontextmanager
async def get_session_context() -> AsyncGenerator[AsyncSession, None]:
    """
    Context manager for database sessions outside of FastAPI dependencies.
    Use for background tasks, scripts, etc.
    """
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database - create all tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """Close database connections."""
    await engine.dispose()