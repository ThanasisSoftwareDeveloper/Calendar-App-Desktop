from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default='#00ff88')  # hex color
    icon = models.CharField(max_length=50, blank=True, default='📁')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        unique_together = ['user', 'name']

    def __str__(self):
        return f"{self.user.username} - {self.name}"


class Tag(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tags')
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7, default='#00ff88')

    class Meta:
        unique_together = ['user', 'name']

    def __str__(self):
        return self.name


class Task(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date = models.DateField()
    time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    tags = models.ManyToManyField(Tag, blank=True, related_name='tasks')

    # Google Calendar integration
    google_event_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    google_calendar_id = models.CharField(max_length=255, blank=True)
    synced_with_google = models.BooleanField(default=False)
    last_synced_at = models.DateTimeField(null=True, blank=True)

    # Gmail import
    gmail_message_id = models.CharField(max_length=255, blank=True, null=True)
    imported_from_gmail = models.BooleanField(default=False)

    # Reminder
    reminder_at = models.DateTimeField(null=True, blank=True)
    reminder_sent = models.BooleanField(default=False)

    # Ordering for drag & drop within a day
    order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'order', 'time']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['user', 'status']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.title} ({self.date})"

    @property
    def is_overdue(self):
        if self.status in ['completed', 'cancelled']:
            return False
        return self.date < timezone.now().date()
