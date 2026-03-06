from rest_framework import serializers
from .models import Task, Category, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'color']


class CategorySerializer(serializers.ModelSerializer):
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'icon', 'task_count', 'created_at']

    def get_task_count(self, obj):
        return obj.tasks.filter(status__in=['pending', 'in_progress']).count()


class TaskSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Tag.objects.all(), write_only=True, source='tags', required=False
    )
    category_detail = CategorySerializer(source='category', read_only=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), allow_null=True, required=False
    )
    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'date', 'time', 'end_time',
            'priority', 'status', 'category', 'category_detail', 'tags', 'tag_ids',
            'google_event_id', 'synced_with_google', 'last_synced_at',
            'imported_from_gmail', 'gmail_message_id',
            'reminder_at', 'reminder_sent',
            'order', 'is_overdue', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at', 'reminder_sent', 'last_synced_at']

    def create(self, validated_data):
        tags = validated_data.pop('tags', [])
        task = Task.objects.create(**validated_data)
        task.tags.set(tags)
        return task

    def update(self, instance, validated_data):
        tags = validated_data.pop('tags', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tags is not None:
            instance.tags.set(tags)
        return instance


class TaskMoveSerializer(serializers.Serializer):
    """For drag & drop - move task to a different date"""
    date = serializers.DateField()
    order = serializers.IntegerField(default=0)


class TaskReorderSerializer(serializers.Serializer):
    """Reorder tasks within a day"""
    task_orders = serializers.ListField(
        child=serializers.DictField(child=serializers.IntegerField())
    )
    # Each item: {"id": 1, "order": 0}
