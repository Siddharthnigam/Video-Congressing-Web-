# Quick Fix for LiveKit Connection Issue

## Problem
Frontend is trying to connect to `localhost:7880` instead of LiveKit Cloud URL.

## Root Cause
Django backend is not running or not reachable, so frontend falls back to default localhost URL.

## Solution Steps

### 1. Start Django Backend
```bash
cd backend
call venv\Scripts\activate
python manage.py runserver
```

### 2. Verify Backend is Running
Open browser: `http://localhost:8000/api/rooms/create/`
Should see: `{"detail":"Method \"GET\" not allowed."}`

### 3. Test API Call
```bash
curl -X POST http://localhost:8000/api/rooms/create/ \
  -H "Content-Type: application/json" \
  -d '{"host_name": "test", "name": "test room", "timestamp": 123456}'
```

Should return:
```json
{
  "room_id": "room-123456",
  "name": "test room", 
  "host": "test",
  "livekit_url": "wss://video-call-wf27naz0.livekit.cloud",
  "token": "eyJ..."
}
```

### 4. Check Frontend Console
After starting backend, check browser console for:
- "API createRoom response:" - should show correct livekit_url
- "Connecting to LiveKit:" - should show cloud URL, not localhost

### 5. If Still Connecting to Localhost
The issue is that the API call is failing. Check:
1. Django server is running on port 8000
2. CORS is configured correctly
3. No firewall blocking the connection

## Expected Flow
1. User clicks "Create Meeting"
2. Frontend calls Django API
3. Django returns LiveKit Cloud URL + JWT token
4. Frontend connects to LiveKit Cloud
5. Video call works

## Debug Commands
```bash
# Check if Django is running
curl http://localhost:8000/api/rooms/create/

# Check Django logs
python manage.py runserver --verbosity=2
```