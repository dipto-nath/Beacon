import asyncio
from datetime import datetime, timezone
import uuid
from passlib.context import CryptContext

from app.database import async_session_maker
from app.models.user import User, UserRole
from app.models.check_in import CheckIn, MoodLevel, StressLevel, EnergyLevel, SleepQuality, SupportLevel, CheckInTag
from app.models.support_case import SupportCase, CaseStatus, CasePriority
from app.models.counseling import Appointment, CounselingRequest, CounselingRequestStatus, AppointmentStatus, SessionMode

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_db():
    async with async_session_maker() as session:
        # Check if users already exist
        from sqlalchemy import text
        existing = await session.execute(text("SELECT id FROM users LIMIT 1"))
        if existing.first():
            print("Database already seeded")
            return

        print("Seeding database...")
        
        # 1. Create Counselors
        counselor_1 = User(
            id=uuid.UUID('c0000000-0000-0000-0000-000000000001'),
            email='s.okafor@ashford.ac.uk',
            first_name='Sarah',
            last_name='Okafor',
            role=UserRole.COUNSELOR,
            student_id_hash='coun-001',
            password_hash=pwd_context.hash('password123'),
        )
        counselor_2 = User(
            id=uuid.UUID('c0000000-0000-0000-0000-000000000002'),
            email='j.whitfield@ashford.ac.uk',
            first_name='James',
            last_name='Whitfield',
            role=UserRole.COUNSELOR,
            student_id_hash='coun-002',
            password_hash=pwd_context.hash('password123'),
        )
        
        # 2. Create Student
        student_1 = User(
            id=uuid.UUID('d0000000-0000-0000-0000-000000000001'),
            email='d.nath@ashford.ac.uk',
            first_name='Dipto',
            last_name='Nath',
            role=UserRole.STUDENT,
            student_id_hash='stu-001',
            program='MSc Computer Science',
            year_of_study=2,
            password_hash=pwd_context.hash('password123'),
        )
        
        session.add_all([counselor_1, counselor_2, student_1])
        await session.commit()
        
        # 3. Create Check-ins
        check_ins = [
            CheckIn(
                id=uuid.UUID('e0000000-0000-0000-0000-000000000010'),
                student_id=student_1.id,
                mood=MoodLevel.OKAY,
                stress=StressLevel.MODERATE,
                energy=EnergyLevel.MODERATE,
                sleep=SleepQuality.NEEDS_ATTENTION,
                tags=[CheckInTag.ACADEMIC_PRESSURE, CheckInTag.SLEEP],
                support_level=SupportLevel.ADDITIONAL,
                escalation_triggered=False,
                completed_at=datetime(2026, 9, 30, 8, 42, tzinfo=timezone.utc)
            ),
            CheckIn(
                id=uuid.UUID('e0000000-0000-0000-0000-000000000009'),
                student_id=student_1.id,
                mood=MoodLevel.GOOD,
                stress=StressLevel.LOW,
                energy=EnergyLevel.STABLE,
                sleep=SleepQuality.ADEQUATE,
                tags=[CheckInTag.WORKLOAD],
                support_level=SupportLevel.SELF_GUIDED,
                escalation_triggered=False,
                completed_at=datetime(2026, 9, 29, 9, 15, tzinfo=timezone.utc)
            ),
            CheckIn(
                id=uuid.UUID('e0000000-0000-0000-0000-000000000008'),
                student_id=student_1.id,
                mood=MoodLevel.DIFFICULT,
                stress=StressLevel.ELEVATED,
                energy=EnergyLevel.LOW,
                sleep=SleepQuality.POOR,
                tags=[CheckInTag.EXAMS, CheckInTag.LONELINESS, CheckInTag.SLEEP],
                support_level=SupportLevel.COUNSELOR,
                escalation_triggered=False,
                completed_at=datetime(2026, 9, 28, 10, 0, tzinfo=timezone.utc)
            ),
        ]
        
        session.add_all(check_ins)
        await session.commit()
        
        # 4. Create Support Cases
        cases = [
            SupportCase(
                id=uuid.uuid4(),
                case_ref='BEC-20260930-014',
                student_id=student_1.id,
                priority=CasePriority.ELEVATED,
                status=CaseStatus.NEW,
                reason_summary='Reported elevated stress and poor sleep for 5 consecutive days',
            ),
            SupportCase(
                id=uuid.uuid4(),
                case_ref='BEC-20260929-012',
                student_id=student_1.id,
                priority=CasePriority.STANDARD,
                status=CaseStatus.SCHEDULED,
                assigned_counselor_id=counselor_1.id,
                reason_summary='Student self-requested counseling through the platform.',
            ),
            SupportCase(
                id=uuid.uuid4(),
                case_ref='BEC-20260928-009',
                student_id=student_1.id,
                priority=CasePriority.URGENT,
                status=CaseStatus.CONTACTED,
                assigned_counselor_id=counselor_2.id,
                reason_summary='Check-in responses indicated significant distress. Escalation triggered.',
            ),
        ]
        
        session.add_all(cases)
        await session.commit()
        print("Database seeded successfully")

if __name__ == "__main__":
    asyncio.run(seed_db())
