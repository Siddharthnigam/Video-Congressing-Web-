from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.conf import settings
import jwt
import time
from .models import Room, Participant, ChatMessage, AttentionStats
from .serializers import RoomSerializer, ParticipantSerializer, ChatMessageSerializer, AttentionStatsSerializer

def generate_livekit_token(room_id, participant_name):
    # Generate a proper JWT token for LiveKit
    api_key = getattr(settings, 'LIVEKIT_API_KEY', 'devkey')
    api_secret = getattr(settings, 'LIVEKIT_API_SECRET', 'secret')
    
    now = int(time.time())
    exp = now + 3600  # Token expires in 1 hour
    
    payload = {
        'iss': api_key,
        'sub': participant_name,
        'iat': now,
        'exp': exp,
        'video': {
            'room': room_id,
            'roomJoin': True,
            'canPublish': True,
            'canSubscribe': True
        }
    }
    
    return jwt.encode(payload, api_secret, algorithm='HS256')

@api_view(['POST'])
def create_room(request):
    room_id = f"room-{request.data.get('timestamp', '12345')}"
    user, created = User.objects.get_or_create(username=request.data.get('host_name', 'Anonymous'))
    
    room = Room.objects.create(
        room_id=room_id,
        name=request.data.get('name', 'Meeting Room'),
        host=user
    )
    
    # Generate LiveKit token for host
    livekit_token = generate_livekit_token(room_id, user.username)
    
    return Response({
        'room_id': room.room_id,
        'name': room.name,
        'host': user.username,
        'livekit_url': settings.LIVEKIT_URL,
        'token': livekit_token
    })

@api_view(['POST'])
def join_room(request, room_id):
    try:
        room = Room.objects.get(room_id=room_id, is_active=True)
        user, created = User.objects.get_or_create(username=request.data.get('name', 'Anonymous'))
        
        participant, created = Participant.objects.get_or_create(
            room=room,
            user=user,
            defaults={'name': request.data.get('name', 'Anonymous')}
        )
        
        # Generate LiveKit token
        livekit_token = generate_livekit_token(room_id, user.username)
        
        participants = Participant.objects.filter(room=room)
        return Response({
            'room': RoomSerializer(room).data,
            'participants': ParticipantSerializer(participants, many=True).data,
            'livekit_url': settings.LIVEKIT_URL,
            'token': livekit_token
        })
    except Room.DoesNotExist:
        return Response({'error': 'Room not found'}, status=404)

@api_view(['GET'])
def get_participants(request, room_id):
    try:
        room = Room.objects.get(room_id=room_id)
        participants = Participant.objects.filter(room=room)
        return Response(ParticipantSerializer(participants, many=True).data)
    except Room.DoesNotExist:
        return Response({'error': 'Room not found'}, status=404)

@api_view(['POST'])
def send_message(request, room_id):
    try:
        room = Room.objects.get(room_id=room_id)
        user = User.objects.get(username=request.data.get('sender', 'Anonymous'))
        
        message = ChatMessage.objects.create(
            room=room,
            sender=user,
            message=request.data.get('message', '')
        )
        
        return Response(ChatMessageSerializer(message).data)
    except Room.DoesNotExist:
        return Response({'error': 'Room not found'}, status=404)

@api_view(['GET'])
def get_messages(request, room_id):
    try:
        room = Room.objects.get(room_id=room_id)
        messages = ChatMessage.objects.filter(room=room).order_by('timestamp')
        return Response(ChatMessageSerializer(messages, many=True).data)
    except Room.DoesNotExist:
        return Response({'error': 'Room not found'}, status=404)

@api_view(['POST'])
def update_attention(request, room_id):
    try:
        room = Room.objects.get(room_id=room_id)
        participant = Participant.objects.get(
            room=room, 
            user__username=request.data.get('username')
        )
        
        stats, created = AttentionStats.objects.get_or_create(
            participant=participant,
            defaults={
                'attention_score': request.data.get('attention_score', 100),
                'total_time': request.data.get('total_time', 0),
                'focused_time': request.data.get('focused_time', 0)
            }
        )
        
        if not created:
            stats.attention_score = request.data.get('attention_score', stats.attention_score)
            stats.total_time = request.data.get('total_time', stats.total_time)
            stats.focused_time = request.data.get('focused_time', stats.focused_time)
            stats.save()
        
        return Response(AttentionStatsSerializer(stats).data)
    except (Room.DoesNotExist, Participant.DoesNotExist):
        return Response({'error': 'Room or participant not found'}, status=404)