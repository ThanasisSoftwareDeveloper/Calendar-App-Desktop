from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from datetime import date, timedelta
import django_filters

from .models import Task, Category, Tag
from .serializers import (
    TaskSerializer, CategorySerializer, TagSerializer,
    TaskMoveSerializer, TaskReorderSerializer
)


class TaskFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    month = django_filters.NumberFilter(field_name='date__month')
    year = django_filters.NumberFilter(field_name='date__year')

    class Meta:
        model = Task
        fields = ['date', 'status', 'priority', 'category', 'date_from', 'date_to', 'month', 'year']


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = TaskFilter
    search_fields = ['title', 'description']
    ordering_fields = ['date', 'order', 'priority', 'created_at']

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user).select_related('category').prefetch_related('tags')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def by_month(self, request):
        """Get all tasks for a specific month"""
        year = int(request.query_params.get('year', date.today().year))
        month = int(request.query_params.get('month', date.today().month))
        tasks = self.get_queryset().filter(date__year=year, date__month=month)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_week(self, request):
        """Get all tasks for a specific week"""
        year = int(request.query_params.get('year', date.today().year))
        week = int(request.query_params.get('week', date.today().isocalendar()[1]))
        start = date.fromisocalendar(year, week, 1)
        end = start + timedelta(days=6)
        tasks = self.get_queryset().filter(date__range=[start, end])
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def today(self, request):
        tasks = self.get_queryset().filter(date=date.today())
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def move(self, request, pk=None):
        """Drag & drop: move task to a different date"""
        task = self.get_object()
        serializer = TaskMoveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        old_date = task.date
        new_date = serializer.validated_data['date']
        task.date = new_date
        task.order = serializer.validated_data.get('order', 0)
        task.save(update_fields=['date', 'order', 'updated_at'])

        # If synced with Google Calendar, mark for re-sync
        if task.synced_with_google and task.google_event_id:
            from google_auth.services import GoogleCalendarService
            try:
                service = GoogleCalendarService(request.user)
                service.update_event_date(task)
            except Exception:
                pass  # Sync failure shouldn't block UI

        return Response(TaskSerializer(task).data)

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Reorder tasks within a day (drag & drop within same day)"""
        serializer = TaskReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        task_orders = serializer.validated_data['task_orders']
        for item in task_orders:
            Task.objects.filter(id=item['id'], user=request.user).update(order=item['order'])

        return Response({'status': 'reordered'})

    @action(detail=False, methods=['post'])
    def import_from_gmail(self, request):
        """Import tasks from Gmail emails"""
        from google_auth.services import GmailService
        try:
            service = GmailService(request.user)
            imported = service.import_tasks_from_emails(request.user)
            return Response({
                'imported': len(imported),
                'tasks': TaskSerializer(imported, many=True).data
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.status = 'completed'
        task.save(update_fields=['status', 'updated_at'])
        return Response(TaskSerializer(task).data)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        tasks = self.get_queryset().filter(
            date__lt=date.today(),
            status__in=['pending', 'in_progress']
        )
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Dashboard stats"""
        qs = self.get_queryset()
        today = date.today()
        return Response({
            'total': qs.count(),
            'today': qs.filter(date=today).count(),
            'completed_today': qs.filter(date=today, status='completed').count(),
            'overdue': qs.filter(date__lt=today, status__in=['pending', 'in_progress']).count(),
            'this_week': qs.filter(
                date__range=[today - timedelta(days=today.weekday()), today + timedelta(days=6 - today.weekday())]
            ).count(),
        })


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
