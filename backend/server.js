const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: './config.env' });
}

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');
const { authenticateToken } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://assessment-6vdlfzqz6-nazish-ahmads-projects.vercel.app', 
        'https://assessment-ashy.vercel.app',
        'https://assessment-kexs.vercel.app',  // Your frontend domain
        /^https:\/\/.*\.vercel\.app$/,  // Allow all Vercel domains
        /^https:\/\/.*\.netlify\.app$/  // Allow all Netlify domains
      ]
    : "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_events', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Campus Events API Server',
    status: 'OK',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      registrations: '/api/registrations',
      health: '/api/health'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    requestedPath: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      root: 'GET /',
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me'
      },
      events: {
        list: 'GET /api/events',
        create: 'POST /api/events',
        get: 'GET /api/events/:id',
        update: 'PUT /api/events/:id',
        delete: 'DELETE /api/events/:id'
      },
      registrations: {
        register: 'POST /api/registrations',
        myRegistrations: 'GET /api/registrations/my-registrations',
        eventRegistrations: 'GET /api/registrations/event/:eventId'
      }
    }
  });
});

// For Vercel deployment - export the app as default
module.exports = app;

// For local development - start the server
if (process.env.NODE_ENV !== 'production') {
  const server = http.createServer(app);
  const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join event room for real-time updates
    socket.on('join-event', (eventId) => {
      socket.join(`event-${eventId}`);
      console.log(`User ${socket.id} joined event room: event-${eventId}`);
    });

    // Leave event room
    socket.on('leave-event', (eventId) => {
      socket.leave(`event-${eventId}`);
      console.log(`User ${socket.id} left event room: event-${eventId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  // Make io accessible to routes
  app.set('io', io);

  const PORT = process.env.PORT || 5001;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
