# Deployment Guide

## Frontend Deployment (Vercel)

### 1. Prepare Frontend
```bash
cd Project
npm run build
```

### 2. Deploy to Vercel
1. Push code to GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Set build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add environment variable:
   - `VITE_API_BASE_URL` = `https://your-backend-app.onrender.com/api`
7. Deploy

## Backend Deployment (Render)

### 1. Prepare Backend
1. Update `requirements.txt` with all dependencies
2. Set environment variables in Render dashboard:
   - `LIVEKIT_API_SECRET` = your actual LiveKit secret
   - `DEBUG` = `False`

### 2. Deploy to Render
1. Push code to GitHub repository
2. Go to [Render Dashboard](https://render.com/dashboard)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Name: `video-call-backend`
   - Environment: `Python 3`
   - Build Command: `./build.sh`
   - Start Command: `gunicorn videomeet.wsgi:application`
6. Add environment variables:
   - `LIVEKIT_API_SECRET` = your LiveKit secret
   - `DEBUG` = `False`
7. Create PostgreSQL database and connect
8. Deploy

### 3. Update Frontend URL
After backend deployment, update frontend environment:
1. Copy your Render backend URL
2. Update `VITE_API_BASE_URL` in Vercel dashboard
3. Redeploy frontend

## Final Steps
1. Update CORS settings in Django with your Vercel domain
2. Test the deployed application
3. Monitor logs for any issues

## Environment Variables Summary

### Frontend (Vercel)
- `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`

### Backend (Render)
- `LIVEKIT_API_SECRET` = your actual secret
- `DEBUG` = `False`
- `DATABASE_URL` = auto-configured by Render