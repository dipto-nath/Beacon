"""
Mood analytics router.
"""
from datetime import date, datetime, timedelta, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.core.permissions import require_permission, Permission
from app.models.check_in import CheckIn, MoodEntry
from app.schemas.mood import (
    MoodDataPoint,
    MoodSummaryResponse,
    MoodPattern,
    MoodPatternsResponse,
)

router = APIRouter()


@router.get("/summary", response_model=MoodSummaryResponse)
async def get_mood_summary(
    period: str = Query("7d", pattern="^(7d|30d|semester)$"),
    current_user=Depends(require_permission(Permission.VIEW_OWN_MOOD)),
    session: AsyncSession = Depends(get_session),
):
    """Get aggregated mood data for specified period."""
    # Calculate date range
    today = date.today()
    if period == "7d":
        start_date = today - timedelta(days=7)
    elif period == "30d":
        start_date = today - timedelta(days=30)
    else:  # semester
        start_date = today - timedelta(days=120)

    start_dt = datetime.combine(start_date, datetime.min.time()).replace(tzinfo=timezone.utc)

    # Get mood entries
    result = await session.execute(
        select(MoodEntry)
        .where(
            and_(
                MoodEntry.student_id == current_user.id,
                MoodEntry.date >= start_dt,
            )
        )
        .order_by(MoodEntry.date)
    )
    entries = result.scalars().all()

    if not entries:
        return MoodSummaryResponse(
            period=period,
            data_points=[],
            avg_mood=0,
            avg_stress=0,
            check_in_count=0,
            streak_days=0,
        )

    data_points = [
        MoodDataPoint(
            date=e.date.date(),
            mood_score=e.avg_mood_score,
            stress_score=e.avg_stress_score,
            label=e.date.strftime("%a"),
        )
        for e in entries
    ]

    avg_mood = sum(e.avg_mood_score for e in entries) / len(entries)
    avg_stress = sum(e.avg_stress_score for e in entries) / len(entries)
    check_in_count = sum(e.check_in_count for e in entries)

    # Calculate streak
    dates = [e.date.date() for e in entries]
    streak = 0
    if dates:
        yesterday = today - timedelta(days=1)
        if dates[-1] == today or dates[-1] == yesterday:
            streak = 1
            for i in range(len(dates) - 2, -1, -1):
                if dates[i+1] - dates[i] == timedelta(days=1):
                    streak += 1
                else:
                    break

    return MoodSummaryResponse(
        period=period,
        data_points=data_points,
        avg_mood=round(avg_mood, 2),
        avg_stress=round(avg_stress, 2),
        check_in_count=check_in_count,
        streak_days=streak,
    )


@router.get("/patterns", response_model=MoodPatternsResponse)
async def get_mood_patterns(
    current_user=Depends(require_permission(Permission.VIEW_OWN_MOOD)),
    session: AsyncSession = Depends(get_session),
):
    """Get AI-identified mood patterns (minimum 5 data points)."""
    result = await session.execute(
        select(MoodEntry)
        .where(MoodEntry.student_id == current_user.id)
        .order_by(MoodEntry.date.desc())
        .limit(30)
    )
    entries = result.scalars().all()

    if len(entries) < 5:
        return MoodPatternsResponse(
            patterns=[],
            data_points_analyzed=len(entries),
            disclaimer="These are observed patterns, not clinical findings.",
        )

    # Simple pattern detection (placeholder for ML service)
    patterns = []

    # Pattern 1: Sleep-mood correlation
    sleep_scores = [e.sleep_rating for e in entries if e.sleep_rating is not None]
    mood_scores = [e.avg_mood_score for e in entries if e.sleep_rating is not None]

    if len(sleep_scores) >= 5:
        import statistics
        try:
            correlation = statistics.correlation(sleep_scores, mood_scores)
            if correlation > 0.3:
                patterns.append(MoodPattern(
                    pattern="sleep_mood_correlation",
                    description=f"Better sleep correlates with better mood (r={correlation:.2f})",
                    confidence=min(abs(correlation), 1.0),
                ))
        except Exception:
            pass

    # Pattern 2: Weekend effect
    weekday_moods = [e.avg_mood_score for e in entries if e.date.weekday() < 5]
    weekend_moods = [e.avg_mood_score for e in entries if e.date.weekday() >= 5]

    if len(weekday_moods) >= 3 and len(weekend_moods) >= 2:
        weekday_avg = sum(weekday_moods) / len(weekday_moods)
        weekend_avg = sum(weekend_moods) / len(weekend_moods)
        diff = weekend_avg - weekday_avg
        if abs(diff) > 0.3:
            direction = "better" if diff > 0 else "worse"
            patterns.append(MoodPattern(
                pattern="weekend_effect",
                description=f"Mood is {direction} on weekends by {abs(diff):.1f} points",
                confidence=min(abs(diff) / 2.0, 1.0),
            ))

    return MoodPatternsResponse(
        patterns=patterns,
        data_points_analyzed=len(entries),
        disclaimer="These are observed patterns, not clinical findings.",
    )