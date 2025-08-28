# Campus Event Platform - Backend

Backend API for the Campus Event Platform built with Node.js, Express, and MongoDB.

## Features

- **RESTful API** with comprehensive endpoints
- **JWT Authentication** with role-based access control
- **Real-time Updates** using Socket.io
- **MongoDB Integration** with Mongoose ODM
- **Input Validation** using express-validator
- **Error Handling** with proper HTTP status codes

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "phone": "+1234567890",
  "studentId": "STU001",
  "department": "Computer Science"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Event Endpoints

#### Get All Events
```http
GET /api/events?page=1&limit=10&category=academic&status=upcoming&search=workshop
```

#### Get Single Event
```http
GET /api/events/:id
```

#### Create Event (Organizer/Admin)
```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Tech Workshop",
  "description": "Learn about modern web development",
  "date": "2024-01-15T10:00:00.000Z",
  "time": "10:00 AM",
  "location": "Main Auditorium",
  "maxAttendees": 50,
  "category": "technical",
  "registrationDeadline": "2024-01-10T23:59:59.000Z",
  "requirements": "Bring your laptop"
}
```

### Registration Endpoints

#### Register for Event (Student)
```http
POST /api/registrations
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventId": "event_id_here",
  "additionalInfo": "I'm interested in learning React"
}
```

#### Approve Registration (Organizer/Admin)
```http
PUT /api/registrations/:id/approve
Authorization: Bearer <token>
```

#### Reject Registration (Organizer/Admin)
```http
PUT /api/registrations/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "rejectionReason": "Event is full"
}
```

## Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['student', 'organizer', 'admin']),
  studentId: String (required for students),
  department: String (required for students),
  phone: String,
  isActive: Boolean
}
```

### Event Model
```javascript
{
  title: String,
  description: String,
  date: Date,
  time: String,
  location: String,
  organizer: ObjectId (ref: User),
  maxAttendees: Number,
  currentAttendees: Number,
  category: String (enum: ['academic', 'sports', 'cultural', 'technical', 'social', 'other']),
  requirements: String,
  registrationDeadline: Date,
  status: String (enum: ['upcoming', 'ongoing', 'completed', 'cancelled']),
  isActive: Boolean
}
```

### Registration Model
```javascript
{
  event: ObjectId (ref: Event),
  user: ObjectId (ref: User),
  status: String (enum: ['pending', 'approved', 'rejected', 'cancelled']),
  registrationDate: Date,
  approvedBy: ObjectId (ref: User),
  approvedDate: Date,
  rejectionReason: String,
  additionalInfo: String
}
```

## Real-time Events

The server emits the following Socket.io events:

### Event Updates
- `event-created` - New event created
- `event-updated` - Event details updated
- `event-deleted` - Event deleted
- `event-status-updated` - Event status changed

### Registration Updates
- `new-registration` - New registration submitted
- `registration-approved` - Registration approved
- `registration-rejected` - Registration rejected
- `registration-cancelled` - Registration cancelled

## Environment Variables

Create a `config.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus_events
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see above)

3. Start the server:
```bash
npm run dev
```

## Testing

The API can be tested using tools like Postman or curl. Make sure to:

1. Register a user first
2. Login to get a JWT token
3. Use the token in the Authorization header for protected routes

## Error Handling

The API returns consistent error responses:

```javascript
{
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
