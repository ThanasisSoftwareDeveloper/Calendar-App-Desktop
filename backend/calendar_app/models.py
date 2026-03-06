from django.db import models
from django.contrib.auth.models import User


class CalendarSettings(models.Model):
    """Per-user calendar display preferences"""
    WEEK_START_CHOICES = [('monday', 'Monday'), ('sunday', 'Sunday')]
    VIEW_CHOICES = [('month', 'Month'), ('week', 'Week'), ('day', 'Day')]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='calendar_settings')
    default_view = models.CharField(max_length=10, choices=VIEW_CHOICES, default='month')
    week_starts_on = models.CharField(max_length=10, choices=WEEK_START_CHOICES, default='monday')
    show_weekends = models.BooleanField(default=True)
    show_completed_tasks = models.BooleanField(default=True)
    accent_color = models.CharField(max_length=7, default='#00ff88')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s calendar settings"
