# Video Meeting Backend

Django REST API backend for the video meeting application.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run migrations:
```bash
python manage.py migrate
```

3. Start the server:
```bash
python manage.py runserver
```

## API Endpoints

- `POST /api/rooms/create/` - Create a new meeting room
- `POST /api/rooms/{room_id}/join/` - Join a meeting room
- `GET /api/rooms/{room_id}/participants/` - Get room participants
- `GET /api/rooms/{room_id}/messages/` - Get chat messages
- `POST /api/rooms/{room_id}/messages/send/` - Send chat message
- `POST /api/rooms/{room_id}/attention/` - Update attention stats

## WebSocket

- `ws://localhost:8000/ws/room/{room_id}/` - Real-time communication

## Features

- Room management
- Participant tracking
- Chat messaging
- Attention detection stats
- WebRTC signaling support