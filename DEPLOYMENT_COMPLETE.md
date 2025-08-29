# 🚀 Complete Deployment Guide

## Overview
This guide will help you deploy both the backend and frontend of your Campus Events Platform to Vercel.

## Prerequisites
- Node.js installed
- Vercel account
- MongoDB Atlas account (already configured)

## Backend Deployment

### Step 1: Deploy Backend to Vercel
```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy backend
cd backend
vercel --prod
```

### Step 2: Set Backend Environment Variables
In your Vercel dashboard, go to your backend project → Settings → Environment Variables and add:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://nazishmallick58_db_user:HJtILzx0h33epl4E@cluster1.uqfecdh.mongodb.net/campus_events?retryWrites=true&w=majority&appName=Cluster1` |
| `JWT_SECRET` | `your_super_secure_jwt_secret_key_change_this_in_production_2024` |
| `NODE_ENV` | `production` |

### Step 3: Test Backend
After deployment, test your backend:
- Health check: `https://your-backend-url.vercel.app/api/health`
- API info: `https://your-backend-url.vercel.app/`

## Frontend Deployment

### Step 1: Deploy Frontend to Vercel
```bash
# Deploy frontend
cd frontend
vercel --prod
```

### Step 2: Set Frontend Environment Variables
In your Vercel dashboard, go to your frontend project → Settings → Environment Variables and add:

**For Vite (if using Vite):**
| Variable | Value |
|----------|-------|
| `VITE_BACKEND_URL` | `https://your-backend-url.vercel.app/api` |

**For Create React App (if using CRA):**
| Variable | Value |
|----------|-------|
| `REACT_APP_API_URL` | `https://your-backend-url.vercel.app/api` |

### Step 3: Update Backend CORS
Update `backend/server.js` line 26 to include your frontend domain:
```javascript
'https://your-frontend-domain.vercel.app'
```

## Quick Deployment Commands

### Using the provided scripts:
```bash
# Deploy backend
chmod +x deploy-backend.sh
./deploy-backend.sh

# Deploy frontend
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

## Testing Your Deployment

### 1. Test Backend
```bash
curl https://your-backend-url.vercel.app/api/health
```

### 2. Test Frontend
- Visit your frontend URL
- Try to register a new user
- Check browser console for any errors

### 3. Test Full Flow
1. Register a new user
2. Login with the user
3. Create an event (if organizer)
4. Register for an event (if student)

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Make sure your frontend domain is added to backend CORS configuration
   - Check that environment variables are set correctly

2. **Environment Variables Not Working**
   - Ensure variables are set in Vercel dashboard
   - Redeploy after setting variables
   - Check variable names match exactly

3. **Database Connection Issues**
   - Verify MongoDB URI is correct
   - Check if MongoDB Atlas allows connections from Vercel IPs

4. **Build Failures**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

## URLs After Deployment

- **Backend API**: `https://your-backend-url.vercel.app`
- **Frontend App**: `https://your-frontend-url.vercel.app`
- **API Health**: `https://your-backend-url.vercel.app/api/health`

## Security Notes

1. **Change JWT Secret**: Use a strong, unique JWT secret in production
2. **MongoDB Security**: Ensure your MongoDB Atlas cluster has proper security settings
3. **Environment Variables**: Never commit sensitive data to version control

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints directly
4. Check browser console for frontend errors
