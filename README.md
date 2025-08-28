# Campus Event Platform

A real-time campus event management platform with role-based access control, built with Node.js, Express, MongoDB, React, and Socket.io.

## Features

### 🎯 Core Features
- **Real-time Updates**: Live attendee count updates using WebSocket
- **Role-based Access**: Student, Organizer, and Admin roles
- **Event Management**: Create, edit, and manage campus events
- **Registration System**: Students can register for events with organizer approval
- **Dashboard**: Comprehensive dashboards for different user roles

### 👥 User Roles

#### Students
- Browse and search events
- Register for events
- Track registration status
- View event details and requirements

#### Organizers
- Create and manage events
- Approve/reject registrations
- View registration statistics
- Real-time attendee monitoring

#### Admins
- Full system access
- Manage all events and registrations
- View system-wide statistics

### 🚀 Technical Features
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Frontend**: React with modern UI components
- **Real-time**: Socket.io for live updates
- **Authentication**: JWT-based authentication
- **Validation**: Input validation and error handling

## Project Structure

```
campus-event-platform/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── server.js        # Main server file
│   └── package.json     # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── context/     # React context
│   │   └── utils/       # Utility functions
│   └── package.json     # Frontend dependencies
└── README.md           # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp config.env.example config.env
```

4. Update `config.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus_events
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

5. Start the backend server:
```bash
npm run dev
```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be running on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Events
- `GET /api/events` - Get all events (with pagination and filters)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create new event (Organizer/Admin)
- `PUT /api/events/:id` - Update event (Organizer/Admin)
- `DELETE /api/events/:id` - Delete event (Organizer/Admin)
- `PUT /api/events/:id/status` - Update event status

### Registrations
- `POST /api/registrations` - Register for event (Student)
- `GET /api/registrations/my-registrations` - Get user's registrations
- `DELETE /api/registrations/:id` - Cancel registration
- `GET /api/registrations/event/:eventId` - Get event registrations (Organizer/Admin)
- `PUT /api/registrations/:id/approve` - Approve registration
- `PUT /api/registrations/:id/reject` - Reject registration

## Real-time Features

The platform uses Socket.io for real-time updates:

- **Event Updates**: Live updates when events are created, updated, or deleted
- **Registration Updates**: Real-time attendee count updates
- **Status Changes**: Instant notifications for registration approval/rejection

## Usage

### For Students
1. Register for an account
2. Browse events on the events page
3. Click on an event to view details
4. Register for events you're interested in
5. Track your registrations in "My Registrations"

### For Organizers
1. Register as an organizer
2. Access the organizer dashboard
3. Create new events with details
4. Manage registrations and approve/reject participants
5. Monitor real-time attendee counts

### For Admins
1. Full access to all features
2. Can manage any event or registration
3. Access to system-wide statistics

## Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **React Icons** - Icon library
- **date-fns** - Date manipulation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
