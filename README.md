# DriveMate - Ride Booking Platform

A full-stack ride booking platform (Uber clone) built with React, Node.js, Express, MongoDB, and Socket.io. Connect riders with nearby drivers in real-time.

## Features

- 🚗 **User Authentication** - Secure login/register for riders and drivers
- 📍 **Real-time Location Tracking** - Track driver location in real-time
- 🗺️ **Interactive Maps** - Select pickup and dropoff locations
- 💰 **Fare Calculation** - Automatic fare calculation based on distance and ride type
- 🔔 **Real-time Notifications** - Socket.io powered real-time updates
- 📱 **Responsive Design** - Beautiful, modern UI with Tailwind CSS
- 🎨 **Smooth Animations** - Framer Motion for delightful user experience
- 🚦 **Ride Management** - Complete ride lifecycle management

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Framer Motion (animations)
- React Router (routing)
- React Leaflet (maps)
- Socket.io Client (real-time)
- Axios (API calls)

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.io (real-time)
- JWT (authentication)
- Bcrypt (password hashing)

## Project Structure

```
DriveMate/
├── docs/                    # Documentation (API, workflow)
├── scripts/                 # Utility scripts (e.g. test-auth.js)
├── src/                     # Frontend (React + Vite)
│   ├── app/                 # App shell & route definitions
│   ├── components/
│   │   ├── common/          # Shared utilities (ErrorBoundary)
│   │   ├── effects/         # Motion & visual effects
│   │   ├── layout/          # Nav, headers, page layouts
│   │   ├── map/             # Map components
│   │   ├── rides/           # Ride-specific UI
│   │   ├── routing/         # Route guards (PrivateRoute)
│   │   └── ui/              # Design system primitives
│   ├── config/              # Environment & app config
│   ├── context/             # React context (auth)
│   ├── data/                # Static page data
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Constants & motion helpers
│   ├── pages/
│   │   ├── auth/            # Login, Register
│   │   ├── driver/          # Driver dashboard
│   │   ├── public/          # Landing page
│   │   ├── rider/           # Rider dashboard, Booking
│   │   └── shared/          # Ride tracking (both roles)
│   ├── services/            # API client
│   └── styles/              # Global CSS
└── server/                  # Backend (Express + MongoDB)
    ├── config/              # DB, socket, constants
    ├── controllers/         # Request handlers
    ├── middleware/          # Auth middleware
    ├── models/              # Mongoose schemas
    ├── routes/              # API routes
    ├── services/            # Business logic
    └── utils/               # Helpers (JWT, calculations)
```

## Getting Started

### Prerequisites
- Node.js (v20.19.0 or higher recommended)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Goutamsahu23/DriveMate.git
cd driver-mate
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd server
npm install
```

4. **Set up environment variables**

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/drivemate
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:5173
```

5. **Start MongoDB**
Make sure MongoDB is running on your system or use MongoDB Atlas connection string.

6. **Start the backend server**
```bash
cd server
npm run dev
```

7. **Start the frontend development server**
```bash
# From the root directory
npm run dev
```

8. **Open your browser**
Navigate to `http://localhost:5173`

## Project Structure

```
driver-mate/
├── server/                 # Backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   └── index.js          # Server entry point
├── src/
│   ├── pages/            # React pages
│   ├── context/          # React context (Auth)
│   ├── utils/            # Utilities (API client)
│   └── App.jsx           # Main app component
└── public/               # Static assets
```

## Usage

### As a Rider
1. Register/Login as a rider
2. Go to booking page
3. Select pickup and dropoff locations on the map
4. Choose ride type (Economy, Comfort, Premium)
5. Book the ride
6. Wait for driver to accept
7. Track your ride in real-time
8. Complete the ride

### As a Driver
1. Register/Login as a driver (with vehicle info)
2. Toggle availability to "ON"
3. Receive ride requests
4. Accept rides
5. Navigate to pickup location
6. Mark as arrived
7. Start and complete rides
8. Track earnings

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Rides
- `POST /api/rides/request` - Request a new ride
- `POST /api/rides/:rideId/accept` - Accept a ride (driver)
- `PATCH /api/rides/:rideId/status` - Update ride status
- `GET /api/rides/my-rides` - Get user's rides
- `GET /api/rides/:rideId` - Get ride details
- `POST /api/rides/:rideId/cancel` - Cancel a ride

### Users
- `GET /api/users/me` - Get current user
- `PATCH /api/users/location` - Update user location
- `PATCH /api/users/availability` - Update driver availability
- `GET /api/users/drivers/nearby` - Get nearby drivers

## Socket.io Events

### Client to Server
- `join-room` - Join a room (userId or rideId)
- `driver-location-update` - Update driver location
- `ride-status-update` - Update ride status

### Server to Client
- `new-ride-request` - New ride request (drivers)
- `ride-accepted` - Ride accepted (riders)
- `ride-status` - Ride status update
- `driver-location` - Driver location update
- `ride-cancelled` - Ride cancelled

## Development

### Frontend Development
```bash
npm run dev
```

### Backend Development
```bash
cd server
npm run dev
```

### Build for Production
```bash
# Frontend
npm run build

# Backend
cd server
npm start
```

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (server/.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/drivemate
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
```

## Features in Detail

### Real-time Tracking
- Drivers update their location periodically
- Riders see driver location in real-time on the map
- Socket.io ensures instant updates

### Ride Types
- **Economy**: $1.50/km + $2.50 base fare
- **Comfort**: $2.00/km + $2.50 base fare
- **Premium**: $3.00/km + $2.50 base fare

### Ride Status Flow
1. `pending` - Ride requested, waiting for driver
2. `accepted` - Driver accepted the ride
3. `driver_arrived` - Driver arrived at pickup
4. `in_progress` - Ride in progress
5. `completed` - Ride completed
6. `cancelled` - Ride cancelled



## Acknowledgments

- Built with modern web technologies
- Inspired by Uber and similar ride-sharing platforms
- Uses OpenStreetMap for map tiles
