#!/bin/bash

# Frontend Deployment Script for Vercel

echo "🚀 Deploying Frontend to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel:"
    vercel login
fi

echo "📦 Deploying frontend to Vercel..."
cd frontend
vercel --prod

echo "✅ Frontend deployment complete!"
echo "📝 Don't forget to set environment variables in Vercel dashboard:"
echo "   - VITE_BACKEND_URL=https://your-backend-url.vercel.app/api"
echo "   - OR REACT_APP_API_URL=https://your-backend-url.vercel.app/api"
