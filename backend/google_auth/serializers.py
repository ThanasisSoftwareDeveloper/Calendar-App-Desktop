from rest_framework import serializers
from .models import GoogleProfile


class GoogleProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoogleProfile
        fields = [
            'id', 'email', 'name', 'avatar_url',
            'primary_calendar_id', 'calendar_sync_enabled',
            'last_calendar_sync', 'gmail_import_enabled',
            'gmail_import_label', 'last_gmail_import',
        ]
        read_only_fields = ['email', 'name', 'avatar_url', 'last_calendar_sync', 'last_gmail_import']
