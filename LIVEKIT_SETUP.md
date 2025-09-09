# LiveKit Setup Instructions

## 1. Download LiveKit Server

Download from: https://github.com/livekit/livekit/releases
- Download `livekit_1.x.x_windows_amd64.zip`
- Extract to a folder (e.g., `C:\livekit`)

## 2. Create LiveKit Configuration

Create `livekit.yaml` in the livekit folder:

```yaml
port: 7880
bind_addresses:
  - ""
api_port: 7881
keys:
  API49W4GgPvvz9d: your_secret_key_here
redis:
  address: localhost:6379
turn:
  enabled: true
  domain: localhost
  cert_file: ""
  key_file: ""
  tls_port: 5349
  udp_port: 3478
```

## 3. Start LiveKit Server

```bash
cd C:\livekit
livekit-server --config livekit.yaml
```

## 4. Update Django Settings

In `backend/videomeet/settings.py`, replace:
```python
LIVEKIT_API_SECRET = 'your_actual_secret_key_here'
```

## 5. Test the Setup

1. Start Django backend: `python manage.py runserver`
2. Start React frontend: `npm run dev`
3. Start LiveKit server: `livekit-server --config livekit.yaml`
4. Open two browser tabs and join the same room

## Troubleshooting

- Ensure all three services are running
- Check browser console for errors
- Verify API key/secret match in Django and LiveKit config
- Test with localhost URLs first