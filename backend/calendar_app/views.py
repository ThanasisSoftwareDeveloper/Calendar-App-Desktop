from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from .models import CalendarSettings


class CalendarSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarSettings
        fields = ['default_view', 'week_starts_on', 'show_weekends', 'show_completed_tasks', 'accent_color']


class CalendarSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        settings, _ = CalendarSettings.objects.get_or_create(user=request.user)
        return Response(CalendarSettingsSerializer(settings).data)

    def patch(self, request):
        settings, _ = CalendarSettings.objects.get_or_create(user=request.user)
        serializer = CalendarSettingsSerializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
