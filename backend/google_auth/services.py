"""
Google API Services:
- GoogleOAuthService: Handle OAuth2 flow
- GmailService: Import tasks from Gmail, send reminders
- GoogleCalendarService: 2-way sync with Google Calendar
"""
import json
import base64
import email as email_lib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import requests
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import User

from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request as GoogleRequest


class GoogleOAuthService:
    AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    TOKEN_URL = "https://oauth2.googleapis.com/token"
    USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

    def get_auth_url(self, state=None):
        params = {
            'client_id': settings.GOOGLE_CLIENT_ID,
            'redirect_uri': settings.GOOGLE_REDIRECT_URI,
            'response_type': 'code',
            'scope': ' '.join(settings.GOOGLE_SCOPES),
            'access_type': 'offline',
            'prompt': 'consent',
        }
        if state:
            params['state'] = state
        from urllib.parse import urlencode
        return f"{self.AUTH_URL}?{urlencode(params)}"

    def exchange_code(self, code):
        """Exchange authorization code for tokens"""
        response = requests.post(self.TOKEN_URL, data={
            'code': code,
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
            'redirect_uri': settings.GOOGLE_REDIRECT_URI,
            'grant_type': 'authorization_code',
        })
        response.raise_for_status()
        return response.json()

    def get_user_info(self, access_token):
        response = requests.get(
            self.USERINFO_URL,
            headers={'Authorization': f'Bearer {access_token}'}
        )
        response.raise_for_status()
        return response.json()

    def refresh_access_token(self, refresh_token):
        response = requests.post(self.TOKEN_URL, data={
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
            'refresh_token': refresh_token,
            'grant_type': 'refresh_token',
        })
        response.raise_for_status()
        return response.json()


def get_google_credentials(user):
    """Get valid Google credentials for a user, refreshing if needed"""
    from .models import GoogleProfile
    profile = GoogleProfile.objects.get(user=user)

    creds = Credentials(
        token=profile.access_token,
        refresh_token=profile.refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        scopes=settings.GOOGLE_SCOPES,
    )

    if profile.is_token_expired:
        creds.refresh(GoogleRequest())
        profile.access_token = creds.token
        profile.token_expiry = timezone.now() + timedelta(seconds=3600)
        profile.save(update_fields=['access_token', 'token_expiry'])

    return creds


class GmailService:
    def __init__(self, user):
        self.user = user
        creds = get_google_credentials(user)
        self.service = build('gmail', 'v1', credentials=creds)

    def import_tasks_from_emails(self, user):
        """Import emails labeled 'DevCalendar' as tasks"""
        from tasks_app.models import Task
        from .models import GoogleProfile

        profile = GoogleProfile.objects.get(user=user)
        imported_tasks = []

        # Search for emails with the DevCalendar label or subject
        query = f'subject:[DevCalendar] OR label:{profile.gmail_import_label}'
        results = self.service.users().messages().list(
            userId='me', q=query, maxResults=50
        ).execute()

        messages = results.get('messages', [])

        for msg_ref in messages:
            msg_id = msg_ref['id']
            # Skip already imported
            if Task.objects.filter(gmail_message_id=msg_id, user=user).exists():
                continue

            msg = self.service.users().messages().get(
                userId='me', id=msg_id, format='full'
            ).execute()

            task = self._create_task_from_email(msg, user)
            if task:
                imported_tasks.append(task)

        profile.last_gmail_import = timezone.now()
        profile.save(update_fields=['last_gmail_import'])

        return imported_tasks

    def _create_task_from_email(self, msg, user):
        """Parse an email and create a Task"""
        from tasks_app.models import Task
        from datetime import date

        headers = {h['name']: h['value'] for h in msg['payload'].get('headers', [])}
        subject = headers.get('Subject', 'No Subject')

        # Clean up subject - remove [DevCalendar] prefix if present
        title = subject.replace('[DevCalendar]', '').strip()
        if not title:
            title = 'Imported from Gmail'

        # Get email body
        body = self._get_email_body(msg['payload'])

        # Parse date from email (default to today)
        task_date = date.today()
        date_str = headers.get('X-Task-Date', '')
        if date_str:
            try:
                task_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                pass

        task = Task.objects.create(
            user=user,
            title=title[:255],
            description=body[:2000] if body else '',
            date=task_date,
            gmail_message_id=msg['id'],
            imported_from_gmail=True,
        )
        return task

    def _get_email_body(self, payload):
        """Extract plain text body from email payload"""
        if payload.get('mimeType') == 'text/plain':
            data = payload.get('body', {}).get('data', '')
            if data:
                return base64.urlsafe_b64decode(data + '==').decode('utf-8', errors='ignore')

        for part in payload.get('parts', []):
            body = self._get_email_body(part)
            if body:
                return body
        return ''

    def send_reminder_email(self, task):
        """Send a reminder email for a task"""
        from .models import GoogleProfile

        profile = GoogleProfile.objects.get(user=self.user)
        to_email = profile.email

        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'⏰ Reminder: {task.title}'
        msg['From'] = to_email
        msg['To'] = to_email

        html_body = f"""
        <div style="font-family: 'JetBrains Mono', monospace; background: #0a0a0a; color: #e0e0e0; padding: 24px; border-radius: 8px; border: 1px solid #1a1a1a;">
            <h2 style="color: #00ff88; margin-top: 0;">⏰ Task Reminder</h2>
            <h3 style="color: #ffffff;">{task.title}</h3>
            <p style="color: #888;">📅 Due: {task.date.strftime('%A, %B %d %Y')}</p>
            {'<p style="color: #888;">🕐 Time: ' + task.time.strftime('%H:%M') + '</p>' if task.time else ''}
            {'<p style="color: #aaa;">' + task.description + '</p>' if task.description else ''}
            <p style="color: #555; font-size: 12px; margin-top: 24px;">Sent by DevCalendar</p>
        </div>
        """

        msg.attach(MIMEText(html_body, 'html'))

        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
        self.service.users().messages().send(
            userId='me', body={'raw': raw}
        ).execute()


class GoogleCalendarService:
    def __init__(self, user):
        self.user = user
        creds = get_google_credentials(user)
        self.service = build('calendar', 'v3', credentials=creds)

    def _task_to_event(self, task):
        """Convert a Task to a Google Calendar event dict"""
        event = {
            'summary': task.title,
            'description': task.description or '',
        }

        if task.time:
            start_dt = datetime.combine(task.date, task.time)
            end_dt = datetime.combine(task.date, task.end_time) if task.end_time else start_dt + timedelta(hours=1)
            event['start'] = {'dateTime': start_dt.isoformat(), 'timeZone': 'Europe/Athens'}
            event['end'] = {'dateTime': end_dt.isoformat(), 'timeZone': 'Europe/Athens'}
        else:
            event['start'] = {'date': task.date.isoformat()}
            event['end'] = {'date': (task.date + timedelta(days=1)).isoformat()}

        # Priority as color
        color_map = {'urgent': '11', 'high': '6', 'medium': '5', 'low': '2'}
        event['colorId'] = color_map.get(task.priority, '5')

        return event

    def create_event(self, task):
        """Create a Google Calendar event from a task"""
        from .models import GoogleProfile
        profile = GoogleProfile.objects.get(user=self.user)
        event = self._task_to_event(task)

        created = self.service.events().insert(
            calendarId=profile.primary_calendar_id,
            body=event
        ).execute()

        task.google_event_id = created['id']
        task.google_calendar_id = profile.primary_calendar_id
        task.synced_with_google = True
        task.last_synced_at = timezone.now()
        task.save(update_fields=['google_event_id', 'google_calendar_id', 'synced_with_google', 'last_synced_at'])

        return created

    def update_event(self, task):
        """Update an existing Google Calendar event"""
        from .models import GoogleProfile
        profile = GoogleProfile.objects.get(user=self.user)
        event = self._task_to_event(task)

        self.service.events().update(
            calendarId=task.google_calendar_id or profile.primary_calendar_id,
            eventId=task.google_event_id,
            body=event
        ).execute()

        task.last_synced_at = timezone.now()
        task.save(update_fields=['last_synced_at'])

    def update_event_date(self, task):
        """Quick update just the date after drag & drop"""
        self.update_event(task)

    def delete_event(self, task):
        """Delete a Google Calendar event"""
        if not task.google_event_id:
            return
        from .models import GoogleProfile
        profile = GoogleProfile.objects.get(user=self.user)
        try:
            self.service.events().delete(
                calendarId=task.google_calendar_id or profile.primary_calendar_id,
                eventId=task.google_event_id
            ).execute()
        except Exception:
            pass

    def sync_from_google(self, user):
        """Import events from Google Calendar into tasks"""
        from tasks_app.models import Task
        from .models import GoogleProfile
        from datetime import date

        profile = GoogleProfile.objects.get(user=user)

        # Use incremental sync if we have a sync token
        kwargs = {
            'calendarId': profile.primary_calendar_id,
            'singleEvents': True,
            'orderBy': 'startTime',
            'maxResults': 250,
        }

        if profile.calendar_sync_token:
            kwargs['syncToken'] = profile.calendar_sync_token
        else:
            # Initial sync: get events for next 30 days
            now = datetime.utcnow()
            kwargs['timeMin'] = now.isoformat() + 'Z'
            kwargs['timeMax'] = (now + timedelta(days=30)).isoformat() + 'Z'

        try:
            events_result = self.service.events().list(**kwargs).execute()
        except Exception:
            # Sync token expired, do full sync
            profile.calendar_sync_token = ''
            profile.save(update_fields=['calendar_sync_token'])
            return self.sync_from_google(user)

        events = events_result.get('items', [])
        synced_count = 0

        for event in events:
            if event.get('status') == 'cancelled':
                Task.objects.filter(google_event_id=event['id'], user=user).delete()
                continue

            task_date = None
            task_time = None
            start = event.get('start', {})

            if 'dateTime' in start:
                dt = datetime.fromisoformat(start['dateTime'].replace('Z', '+00:00'))
                task_date = dt.date()
                task_time = dt.time()
            elif 'date' in start:
                task_date = datetime.strptime(start['date'], '%Y-%m-%d').date()

            if not task_date:
                continue

            defaults = {
                'title': event.get('summary', 'Google Calendar Event')[:255],
                'description': event.get('description', ''),
                'date': task_date,
                'time': task_time,
                'synced_with_google': True,
                'google_calendar_id': profile.primary_calendar_id,
                'last_synced_at': timezone.now(),
            }

            Task.objects.update_or_create(
                google_event_id=event['id'],
                user=user,
                defaults=defaults
            )
            synced_count += 1

        # Save next sync token
        next_sync_token = events_result.get('nextSyncToken', '')
        profile.calendar_sync_token = next_sync_token
        profile.last_calendar_sync = timezone.now()
        profile.save(update_fields=['calendar_sync_token', 'last_calendar_sync'])

        return synced_count
