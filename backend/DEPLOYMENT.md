# Vercel Deployment Guide

## Environment Variables Setup

In your Vercel dashboard, add these environment variables:

1. **MONGODB_URI**: `mongodb+srv://nazishmallick58_db_user:HJtILzx0h33epl4E@cluster1.uqfecdh.mongodb.net/campus_events?retryWrites=true&w=majority&appName=Cluster1`

2. **JWT_SECRET**: `your_jwt_secret_key_here_change_in_production`

3. **NODE_ENV**: `production`

## Deployment Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from backend directory**:
   ```bash
   cd backend
   vercel
   ```

4. **Set environment variables in Vercel dashboard**:
   - Go to your project in Vercel dashboard
   - Go to Settings → Environment Variables
   - Add the variables listed above

## Important Notes

- The server.js file has been modified to work with Vercel's serverless environment
- Socket.io functionality is disabled in production (Vercel doesn't support WebSockets in serverless functions)
- CORS is configured to allow your Vercel frontend domain
- The app exports as a default export for Vercel compatibility

## Testing the Deployment

After deployment, test these endpoints:
- `GET /api/health` - Health check
- `GET /api/events` - Get events
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## Frontend Configuration

Update your frontend API base URL to point to your Vercel backend URL:
```javascript
const API_BASE_URL = 'https://your-backend-url.vercel.app/api';
```
