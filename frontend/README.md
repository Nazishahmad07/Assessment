# Campus Event Platform - Frontend

React frontend for the Campus Event Platform with real-time updates and modern UI.

## Features

- **Modern React UI** with responsive design
- **Real-time Updates** using Socket.io client
- **Role-based Navigation** and access control
- **Event Management** with search and filtering
- **Registration System** with status tracking
- **Organizer Dashboard** for event management

## Components

### Pages
- **Home** - Landing page with features overview
- **Login/Register** - Authentication pages
- **Events** - Browse and search events
- **EventDetails** - Detailed event view with registration
- **MyRegistrations** - User's registration history
- **OrganizerDashboard** - Event management dashboard
- **CreateEvent** - Event creation form
- **EditEvent** - Event editing form
- **EventRegistrations** - Manage event registrations

### Components
- **Navbar** - Navigation with role-based menu
- **ProtectedRoute** - Route protection based on authentication and roles

### Context
- **AuthContext** - Authentication state management
- **SocketContext** - Real-time communication management

### Services
- **api.js** - Axios configuration with interceptors
- **authService.js** - Authentication API calls
- **eventService.js** - Event-related API calls
- **registrationService.js** - Registration API calls

## User Interface

### Design System
- **Colors**: Primary blue (#007bff), Success green (#28a745), Warning yellow (#ffc107), Danger red (#dc3545)
- **Typography**: System fonts with clear hierarchy
- **Layout**: Responsive grid system
- **Components**: Consistent button styles, form controls, and cards

### Responsive Design
- Mobile-first approach
- Breakpoints for tablets and desktops
- Flexible grid layouts
- Touch-friendly interface elements

## Real-time Features

### Socket.io Integration
- Automatic connection on authentication
- Event room joining for real-time updates
- Live attendee count updates
- Registration status notifications

### Real-time Updates
- **Event List**: Live updates when events are created/updated
- **Event Details**: Real-time attendee count
- **Registration Status**: Instant approval/rejection notifications
- **Dashboard**: Live statistics updates

## State Management

### Authentication State
```javascript
{
  user: User | null,
  token: string | null,
  loading: boolean,
  isAuthenticated: boolean
}
```

### Socket State
```javascript
{
  socket: Socket | null,
  connected: boolean
}
```

## Routing

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/events` - Events listing
- `/events/:id` - Event details

### Protected Routes
- `/my-registrations` - User registrations (Students)
- `/organizer/dashboard` - Organizer dashboard
- `/organizer/events/create` - Create event
- `/organizer/events/:id/edit` - Edit event
- `/organizer/events/:id/registrations` - Manage registrations

## API Integration

### Authentication
- JWT token storage in localStorage
- Automatic token refresh
- Logout on token expiration

### Error Handling
- Toast notifications for user feedback
- Consistent error display
- Network error handling

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

This creates an optimized build in the `build` folder.

## Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Dependencies

### Core
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client

### UI/UX
- **React Toastify** - Toast notifications
- **React Icons** - Icon library
- **date-fns** - Date manipulation

### Real-time
- **Socket.io Client** - Real-time communication

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting with React.lazy
- Optimized bundle size
- Efficient re-rendering with proper state management
- Image optimization
- Caching strategies

## Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Color contrast compliance
- Screen reader compatibility
