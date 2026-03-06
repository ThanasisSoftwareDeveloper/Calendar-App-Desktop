from celery import shared_task
from django.utils import timezone
from django.contrib.auth.models import User


@shared_task
def send_due_reminders():
    """Check and send due reminders via Gmail"""
    from .models import Task
    from google_auth.services import GmailService

    now = timezone.now()
    window_start = now - timezone.timedelta(minutes=1)
    window_end = now + timezone.timedelta(minutes=1)

    due_tasks = Task.objects.filter(
        reminder_at__range=(window_start, window_end),
        reminder_sent=False,
        status__in=['pending', 'in_progress'],
    ).select_related('user')

    for task in due_tasks:
        try:
            service = GmailService(task.user)
            service.send_reminder_email(task)
            task.reminder_sent = True
            task.save(update_fields=['reminder_sent'])
        except Exception as e:
            print(f"Failed to send reminder for task {task.id}: {e}")


@shared_task
def send_task_reminder(task_id):
    """Send a specific task reminder"""
    from .models import Task
    from google_auth.services import GmailService

    try:
        task = Task.objects.select_related('user').get(id=task_id)
        service = GmailService(task.user)
        service.send_reminder_email(task)
        task.reminder_sent = True
        task.save(update_fields=['reminder_sent'])
    except Exception as e:
        print(f"Reminder task failed: {e}")
