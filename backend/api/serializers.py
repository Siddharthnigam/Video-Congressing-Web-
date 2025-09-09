from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Room, Participant, ChatMessage, AttentionStats

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class RoomSerializer(serializers.ModelSerializer):
    host = UserSerializer(read_only=True)
    
    class Meta:
        model = Room
        fields = ['id', 'room_id', 'name', 'host', 'created_at', 'is_active']

class ParticipantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Participant
        fields = ['id', 'user', 'name', 'joined_at', 'is_muted', 'is_video_off']

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'message', 'timestamp']

class AttentionStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttentionStats
        fields = ['attention_score', 'total_time', 'focused_time', 'updated_at']