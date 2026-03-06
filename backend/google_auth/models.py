from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class GoogleProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='google_profile')
    google_id = models.CharField(max_length=255, unique=True)
    email = models.EmailField()
    name = models.CharField(max_length=255, blank=True)
    avatar_url = models.URLField(blank=True)

    # OAuth Tokens
    access_token = models.TextField()
    refresh_token = models.TextField(blank=True)
    token_expiry = models.DateTimeField(null=True, blank=True)

    # Google Calendar
    primary_calendar_id = models.CharField(max_length=255, default='primary')
    calendar_sync_enabled = models.BooleanField(default=True)
    last_calendar_sync = models.DateTimeField(null=True, blank=True)
    calendar_sync_token = models.TextField(blank=True)  # incremental sync token

    # Gmail
    gmail_import_enabled = models.BooleanField(default=False)
    gmail_import_label = models.CharField(max_length=100, default='Calendar-App-Desktop')
    last_gmail_import = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.email}"

    @property
    def is_token_expired(self):
        if not self.token_expiry:
            return True
        return timezone.now() >= self.token_expiry
