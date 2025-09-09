from django.db import models
from django.contrib.auth.models import User

class Room(models.Model):
    room_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200)
    host = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

class Participant(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_muted = models.BooleanField(default=False)
    is_video_off = models.BooleanField(default=False)

class ChatMessage(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

class AttentionStats(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE)
    attention_score = models.IntegerField(default=100)
    total_time = models.IntegerField(default=0)
    focused_time = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)