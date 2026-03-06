from celery import shared_task


@shared_task
def sync_all_google_calendars():
    """Sync all users' Google Calendars"""
    from .models import GoogleProfile
    from .services import GoogleCalendarService

    profiles = GoogleProfile.objects.filter(calendar_sync_enabled=True).select_related('user')
    total = 0

    for profile in profiles:
        try:
            service = GoogleCalendarService(profile.user)
            count = service.sync_from_google(profile.user)
            total += count
        except Exception as e:
            print(f"Calendar sync failed for {profile.user.username}: {e}")

    return total
