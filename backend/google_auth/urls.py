from django.urls import path
from .views import (
    GoogleAuthURLView, GoogleCallbackView, GoogleProfileView,
    GoogleCalendarSyncView, GmailImportView, DisconnectGoogleView
)

urlpatterns = [
    path('google/url/', GoogleAuthURLView.as_view(), name='google-auth-url'),
    path('google/callback/', GoogleCallbackView.as_view(), name='google-callback'),
    path('google/profile/', GoogleProfileView.as_view(), name='google-profile'),
    path('google/calendar/sync/', GoogleCalendarSyncView.as_view(), name='google-calendar-sync'),
    path('google/gmail/import/', GmailImportView.as_view(), name='gmail-import'),
    path('google/disconnect/', DisconnectGoogleView.as_view(), name='google-disconnect'),
]
