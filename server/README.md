# Server Structure

This directory contains the backend server for DriveMate.

## Folder Structure

```
server/
├── config/           # Configuration files
│   ├── database.js  # MongoDB connection setup
│   ├── socket.js    # Socket.io configuration
│   └── constants.js # Environment constants
│
├── controllers/     # Request handlers (business logic entry points)
│   ├── authController.js
│   ├── rideController.js
│   └── userController.js
│
├── services/         # Business logic layer
│   ├── authService.js
│   ├── rideService.js
│   └── userService.js
│
├── routes/           # API route definitions
│   ├── auth.js
│   ├── rides.js
│   └── users.js
│
├── middleware/       # Express middleware
│   └── auth.js       # Authentication middleware
│
├── models/           # MongoDB models (Mongoose schemas)
│   ├── User.js
│   └── Ride.js
│
├── utils/            # Utility functions
│   ├── jwt.js        # JWT token utilities
│   └── calculations.js # Distance, fare, OTP calculations
│
├── socket/           # Socket.io event handlers (future use)
│
├── index.js          # Main server entry point
└── package.json      # Dependencies and scripts
```

## Architecture Pattern

This server follows a **layered architecture** pattern:

1. **Routes** (`routes/`) - Define API endpoints and validation
2. **Controllers** (`controllers/`) - Handle HTTP requests/responses
3. **Services** (`services/`) - Contain business logic
4. **Models** (`models/`) - Database schemas and models
5. **Utils** (`utils/`) - Reusable utility functions
6. **Config** (`config/`) - Configuration and setup files
7. **Middleware** (`middleware/`) - Express middleware functions

## Flow Example

**Request Flow:**
```
Client Request
  ↓
Route (validation)
  ↓
Controller (request/response handling)
  ↓
Service (business logic)
  ↓
Model (database operations)
  ↓
Response back through layers
```

**Example: User Registration**
```
POST /api/auth/register
  ↓
routes/auth.js (validates input)
  ↓
controllers/authController.js (handles req/res)
  ↓
services/authService.js (business logic)
  ↓
models/User.js (saves to database)
  ↓
Response with token and user data
```

## Key Files

- **index.js** - Server entry point, sets up Express, Socket.io, and MongoDB
- **config/database.js** - MongoDB connection configuration
- **config/socket.js** - Socket.io setup and event handlers
- **middleware/auth.js** - JWT authentication middleware
- **utils/calculations.js** - Distance calculation, fare calculation, OTP generation

## Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/drivemate
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Running the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## API Endpoints

See `docs/API_DOCUMENTATION.md` for complete API documentation.

