from rest_framework import serializers
from .models import MLModel


class MLModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLModel
        fields = [
            "id",
            "name",
            "arch",
            "version",
            "description",
            "file",
            "enabled",
            "is_active",
            "created_by",
            "created_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "is_active"]


class MLModelListSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLModel
        fields = ["id", "name", "arch", "version", "enabled", "is_active", "created_at"]
        read_only_fields = fields
