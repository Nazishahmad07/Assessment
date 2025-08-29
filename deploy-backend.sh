#!/bin/bash

# Backend Deployment Script for Vercel

echo "🚀 Deploying Backend to Vercel..."

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

echo "📦 Deploying backend to Vercel..."
cd backend
vercel --prod

echo "✅ Backend deployment complete!"
echo "📝 Don't forget to set environment variables in Vercel dashboard:"
echo "   - MONGODB_URI"
echo "   - JWT_SECRET" 
echo "   - NODE_ENV=production"
