# Frontend Deployment Guide

## Environment Variables for Production

### For Vite Deployment:
Set this environment variable in your deployment platform:
```
VITE_BACKEND_URL=https://assessment-ashy.vercel.app/api
```

### For Create React App Deployment:
Set this environment variable in your deployment platform:
```
REACT_APP_API_URL=https://assessment-ashy.vercel.app/api
```

## Deployment Platforms

### Vercel:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add: `VITE_BACKEND_URL` = `https://assessment-ashy.vercel.app/api`
4. Redeploy your application

### Netlify:
1. Go to Site settings
2. Navigate to Environment variables
3. Add: `VITE_BACKEND_URL` = `https://assessment-ashy.vercel.app/api`
4. Redeploy your application

### Other Platforms:
Make sure to set the appropriate environment variable based on your build tool.

## Testing the Connection

After deployment, you can test if the frontend is connecting to the backend by:
1. Opening browser developer tools (F12)
2. Going to Network tab
3. Making a request (like login/register)
4. Check if the request goes to `https://assessment-ashy.vercel.app/api`

## Troubleshooting

If the frontend still doesn't connect to the backend:
1. Check if the environment variable is set correctly
2. Verify the backend URL is accessible
3. Check browser console for CORS errors
4. Ensure the backend CORS is configured for your frontend domain
