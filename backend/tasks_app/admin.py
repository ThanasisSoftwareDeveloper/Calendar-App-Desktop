from django.contrib import admin
from .models import Task, Category, Tag


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'date', 'priority', 'status', 'synced_with_google']
    list_filter = ['status', 'priority', 'synced_with_google', 'imported_from_gmail']
    search_fields = ['title', 'description', 'user__username']
    date_hierarchy = 'date'


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'color']


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'color']
