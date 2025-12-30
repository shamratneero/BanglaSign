from django.conf import settings
from django.db import models
from django.utils import timezone


class MLModel(models.Model):
    ARCH_CHOICES = [
        ("resnet18", "ResNet18"),
        ("effnet_b0", "EfficientNet-B0"),
        ("mlp", "MLP"),
    ]

    name = models.CharField(max_length=120)
    arch = models.CharField(max_length=32, choices=ARCH_CHOICES)
    version = models.CharField(max_length=40, default="v1")
    description = models.TextField(blank=True, default="")

    file = models.FileField(upload_to="models/")  # stores .pth
    enabled = models.BooleanField(default=True)
    is_active = models.BooleanField(default=False)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["enabled"]),
            models.Index(fields=["is_active"]),
            models.Index(fields=["arch"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.arch}) [{self.version}]"


class InferenceEvent(models.Model):
    """
    Log a single inference request (for stats).
    Keep minimal for deadline.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    model = models.ForeignKey(MLModel, on_delete=models.SET_NULL, null=True, blank=True)

    source = models.CharField(max_length=32, default="web")  # web/local/api
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [
            models.Index(fields=["created_at"]),
        ]

