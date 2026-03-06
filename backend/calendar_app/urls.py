from django.urls import path
from .views import CalendarSettingsView

urlpatterns = [
    path('settings/', CalendarSettingsView.as_view(), name='calendar-settings'),
]
