"""
Celery application configuration.
"""
from celery import Celery
from celery.schedules import crontab

from app.config import settings

celery_app = Celery("beacon")

celery_app.conf.update(
    broker_url=settings.CELERY_BROKER_URL,
    result_backend=settings.CELERY_RESULT_BACKEND,
    task_serializer=settings.CELERY_TASK_SERIALIZER,
    result_serializer=settings.CELERY_RESULT_SERIALIZER,
    accept_content=settings.CELERY_ACCEPT_CONTENT,
    timezone=settings.CELERY_TIMEZONE,
    enable_utc=True,
    beat_schedule_filename=settings.CELERY_BEAT_SCHEDULE_FILE,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,
    worker_prefetch_multiplier=4,
    worker_max_tasks_per_child=100,
    result_expires=3600,
)

# Beat schedule for periodic tasks
celery_app.conf.beat_schedule = {
    "generate-daily-campus-snapshot": {
        "task": "app.tasks.analytics_tasks.generate_daily_campus_snapshot",
        "schedule": crontab(hour=2, minute=0),  # 02:00 UTC daily
    },
    "generate-weekly-campus-snapshot": {
        "task": "app.tasks.analytics_tasks.generate_weekly_campus_snapshot",
        "schedule": crontab(hour=3, minute=0, day_of_week=1),  # 03:00 UTC Monday
    },
    "generate-monthly-campus-snapshot": {
        "task": "app.tasks.analytics_tasks.generate_monthly_campus_snapshot",
        "schedule": crontab(hour=4, minute=0, day_of_month=1),  # 04:00 UTC 1st of month
    },
    "process-pending-exports": {
        "task": "app.tasks.export_tasks.process_pending_exports",
        "schedule": crontab(minute="*/15"),  # Every 15 minutes
    },
    "cleanup-expired-exports": {
        "task": "app.tasks.export_tasks.cleanup_expired_exports",
        "schedule": crontab(hour=1, minute=0),  # 01:00 UTC daily
    },
    "send-check-in-reminders": {
        "task": "app.tasks.notification_tasks.send_check_in_reminders",
        "schedule": crontab(hour=20, minute=0),  # 20:00 UTC daily
    },
    "send-appointment-reminders": {
        "task": "app.tasks.notification_tasks.send_appointment_reminders",
        "schedule": crontab(minute=0, hour="*"),  # Hourly
    },
}


# Auto-discover tasks
celery_app.autodiscover_tasks([
    "app.tasks.analytics_tasks",
    "app.tasks.notification_tasks",
    "app.tasks.escalation_tasks",
    "app.tasks.export_tasks",
])


@celery_app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f"Request: {self.request!r}")