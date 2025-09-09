# Video Meeting System Testing Guide

## Prerequisites
1. **LiveKit Cloud Account**: Get your API secret from LiveKit Cloud dashboard
2. **Update Django Settings**: Replace `your_secret_key_here` with your actual LiveKit API secret

## Setup Steps

### 1. Start Django Backend
```bash
cd backend
call venv\Scripts\activate
python manage.py runserver
```

### 2. Start React Frontend
```bash
cd Project
npm run dev
```

### 3. Update LiveKit Secret
In `backend/videomeet/settings.py`:
```python
LIVEKIT_API_SECRET = 'your_actual_secret_from_livekit_cloud'
```

## Testing Scenarios

### Test 1: Single User Join
1. Open browser → `http://localhost:5173`
2. Click "Create Meeting"
3. Enter your name
4. Allow camera/microphone permissions
5. Click "Create Meeting"
6. Verify: You see yourself in the video grid

### Test 2: Multi-User Same Device
1. Open first tab → Create meeting
2. Copy room ID from URL or UI
3. Open second tab → Join meeting
4. Enter different name + room ID
5. Verify: Both participants see each other

### Test 3: Multi-User Different Devices
1. Device 1: Create meeting
2. Device 2: Join same room ID
3. Verify: Both see/hear each other
4. Test controls: mute/unmute, camera on/off

### Test 4: Screen Share
1. Join meeting
2. Click screen share button
3. Select screen/window to share
4. Verify: Other participants see your screen

## Troubleshooting

### Camera/Mic Not Working
- Check browser permissions
- Try different browser (Chrome recommended)
- Check if other apps are using camera

### Connection Issues
- Verify Django backend is running on port 8000
- Check browser console for errors
- Ensure LiveKit API secret is correct

### No Video/Audio Between Users
- Check network connectivity
- Try on same WiFi network first
- For cross-network, TURN server may be needed

## Expected Behavior
✅ Camera preview in lobby
✅ Smooth connection to meeting
✅ Real-time video/audio streaming
✅ Working mute/camera controls
✅ Screen sharing functionality
✅ Clean disconnect on leave