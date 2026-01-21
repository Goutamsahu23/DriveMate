# DriveMate API Documentation

Complete API roadmap and endpoint documentation for the DriveMate ride-booking platform.

## Base URL
```
http://localhost:5000/api
```

## Authentication Flow

### Step 1: Register (Sign Up)
**POST** `/auth/register`

Create a new user account (Rider or Driver).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "rider" | "driver",
  
  // Required only if role is "driver"
  "vehicleInfo": {
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "color": "Blue",
    "licensePlate": "ABC-1234"
  },
  "driverLicense": "DL123456"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "rider",
    "phone": "+1234567890",
    "isAvailable": false,
    "currentLocation": null
  }
}
```

**Error Responses:**
- `400` - Validation errors or user already exists
- `500` - Server error

---

### Step 2: Login
**POST** `/auth/login`

Authenticate and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "rider",
    "phone": "+1234567890",
    "isAvailable": false,
    "currentLocation": null
  }
}
```

**Error Responses:**
- `400` - Invalid credentials
- `500` - Server error

---

### Step 3: Verify Token / Get Current User
**GET** `/users/me`

Verify authentication token and get current user details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "rider",
  "phone": "+1234567890",
  "isAvailable": false,
  "currentLocation": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "rating": 4.5,
  "totalRides": 10,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

**Error Responses:**
- `401` - Unauthorized (invalid/expired token)
- `500` - Server error

---

## User Management APIs

### Update User Location
**PATCH** `/users/location`

Update current location (used for tracking).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "lat": 40.7128,
  "lng": -74.0060
}
```

**Response (200):**
```json
{
  "message": "Location updated",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060
  }
}
```

---

### Update Driver Availability
**PATCH** `/users/availability`

Toggle driver availability status (drivers only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "isAvailable": true
}
```

**Response (200):**
```json
{
  "message": "Availability updated",
  "isAvailable": true
}
```

**Error Responses:**
- `403` - Only drivers can update availability

---

### Get Nearby Drivers
**GET** `/users/drivers/nearby?lat=40.7128&lng=-74.0060`

Get list of available drivers within 10km radius.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `lat` (required) - Latitude
- `lng` (required) - Longitude

**Response (200):**
```json
[
  {
    "_id": "driver_id",
    "name": "Jane Driver",
    "phone": "+1234567890",
    "vehicleInfo": {
      "make": "Toyota",
      "model": "Camry",
      "year": 2020,
      "color": "Blue",
      "licensePlate": "ABC-1234"
    },
    "rating": 4.8,
    "currentLocation": {
      "lat": 40.7130,
      "lng": -74.0062
    },
    "distance": 0.5
  }
]
```

---

## Ride Management APIs

### Request a Ride
**POST** `/rides/request`

Create a new ride request (riders only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "pickupLocation": {
    "address": "123 Main Street, New York, NY",
    "lat": 40.7128,
    "lng": -74.0060
  },
  "dropoffLocation": {
    "address": "456 Broadway, New York, NY",
    "lat": 40.7580,
    "lng": -73.9855
  },
  "rideType": "economy" | "comfort" | "premium"
}
```

**Response (201):**
```json
{
  "_id": "ride_id",
  "rider": "rider_user_id",
  "driver": null,
  "pickupLocation": {
    "address": "123 Main Street, New York, NY",
    "lat": 40.7128,
    "lng": -74.0060
  },
  "dropoffLocation": {
    "address": "456 Broadway, New York, NY",
    "lat": 40.7580,
    "lng": -73.9855
  },
  "status": "pending",
  "fare": 12.50,
  "distance": 5.2,
  "rideType": "economy",
  "requestedAt": "2024-01-15T10:00:00.000Z",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

**Socket.io Event Emitted:**
- `pending-ride-available` - Broadcasted to all drivers

**Error Responses:**
- `400` - Validation errors
- `403` - Only riders can request rides
- `500` - Server error

---

### Accept a Ride
**POST** `/rides/:rideId/accept`

Accept a pending ride request (drivers only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "ride_id",
  "rider": "rider_user_id",
  "driver": "driver_user_id",
  "status": "accepted",
  "acceptedAt": "2024-01-15T10:05:00.000Z",
  ...
}
```

**Socket.io Event Emitted:**
- `ride-accepted` - Sent to the rider

**Error Responses:**
- `400` - Driver not available or ride not available
- `403` - Only drivers can accept rides
- `404` - Ride not found
- `500` - Server error

---

### Get All Pending Rides
**GET** `/rides/pending/all`

Get all pending rides available for drivers to accept.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "ride_id",
    "rider": {
      "_id": "rider_id",
      "name": "John Rider",
      "phone": "+1234567890"
    },
    "pickupLocation": {...},
    "dropoffLocation": {...},
    "status": "pending",
    "fare": 12.50,
    "distance": 5.2,
    "rideType": "economy",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

**Error Responses:**
- `403` - Only drivers can view pending rides

---

### Update Ride Status
**PATCH** `/rides/:rideId/status`

Update ride status (driver_arrived, in_progress, completed).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "driver_arrived" | "in_progress" | "completed"
}
```

**Special Behavior:**
- When status is `driver_arrived`: Generates a 4-digit OTP (expires in 5 minutes)
- When status is `completed`: Makes driver available again

**Response (200):**
```json
{
  "message": "Ride status updated to driver_arrived",
  "ride": {
    "_id": "ride_id",
    "status": "driver_arrived",
    "otp": {
      "code": "1234",
      "expiresAt": "2024-01-15T10:10:00.000Z",
      "verified": false
    },
    "driverArrivedAt": "2024-01-15T10:05:00.000Z",
    ...
  }
}
```

**Socket.io Events Emitted:**
- `driver-arrived` - Sent to rider (includes OTP)
- `ride-status-update` - Sent to both rider and driver

**Error Responses:**
- `400` - Invalid status or cannot update
- `403` - Not authorized
- `404` - Ride not found
- `500` - Server error

---

### Verify OTP and Start Ride
**POST** `/rides/:rideId/verify-otp`

Verify OTP code and start the ride (drivers only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "otp": "1234"
}
```

**Response (200):**
```json
{
  "message": "Ride started successfully",
  "ride": {
    "_id": "ride_id",
    "status": "in_progress",
    "otp": {
      "code": "1234",
      "verified": true
    },
    "startedAt": "2024-01-15T10:06:00.000Z",
    ...
  }
}
```

**Socket.io Events Emitted:**
- `ride-status-update` - Sent to both rider and driver

**Error Responses:**
- `400` - Invalid OTP, OTP expired, or OTP not generated
- `403` - Only driver can verify OTP
- `404` - Ride not found
- `500` - Server error

---

### Get User's Rides
**GET** `/rides/my-rides`

Get all rides for the authenticated user (both rider and driver).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "ride_id",
    "rider": {
      "_id": "rider_id",
      "name": "John Rider",
      "phone": "+1234567890",
      "rating": 4.5
    },
    "driver": {
      "_id": "driver_id",
      "name": "Jane Driver",
      "phone": "+1234567890",
      "vehicleInfo": {...},
      "rating": 4.8
    },
    "pickupLocation": {...},
    "dropoffLocation": {...},
    "status": "completed",
    "fare": 12.50,
    "distance": 5.2,
    "rideType": "economy",
    "requestedAt": "2024-01-15T10:00:00.000Z",
    "acceptedAt": "2024-01-15T10:05:00.000Z",
    "startedAt": "2024-01-15T10:06:00.000Z",
    "completedAt": "2024-01-15T10:20:00.000Z",
    "rating": 5,
    "review": "Great ride!"
  }
]
```

---

### Get Single Ride Details
**GET** `/rides/:rideId`

Get detailed information about a specific ride.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "ride_id",
  "rider": {
    "_id": "rider_id",
    "name": "John Rider",
    "phone": "+1234567890",
    "rating": 4.5,
    "currentLocation": {...}
  },
  "driver": {
    "_id": "driver_id",
    "name": "Jane Driver",
    "phone": "+1234567890",
    "vehicleInfo": {...},
    "rating": 4.8,
    "currentLocation": {...}
  },
  "pickupLocation": {...},
  "dropoffLocation": {...},
  "status": "in_progress",
  "fare": 12.50,
  "distance": 5.2,
  "rideType": "economy",
  "otp": {
    "code": "1234",
    "expiresAt": "2024-01-15T10:10:00.000Z",
    "verified": true
  },
  ...
}
```

**Error Responses:**
- `403` - Not authorized (not rider or driver of this ride)
- `404` - Ride not found

---

### Cancel Ride
**POST** `/rides/:rideId/cancel`

Cancel a ride (rider or driver).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "ride_id",
  "status": "cancelled",
  ...
}
```

**Socket.io Events Emitted:**
- `ride-cancelled` - Sent to both rider and driver

**Error Responses:**
- `400` - Cannot cancel (already completed/cancelled)
- `403` - Not authorized
- `404` - Ride not found
- `500` - Server error

---

## Socket.io Events

### Client → Server Events

#### Join Room
```javascript
socket.emit('join-room', userId)
```
Join a room to receive updates for a specific user or ride.

#### Driver Location Update
```javascript
socket.emit('driver-location-update', {
  rideId: 'ride_id',
  location: { lat: 40.7128, lng: -74.0060 }
})
```
Update driver's current location during a ride.

#### Ride Status Update
```javascript
socket.emit('ride-status-update', {
  rideId: 'ride_id',
  status: 'in_progress'
})
```
Notify about ride status changes.

---

### Server → Client Events

#### Pending Ride Available
```javascript
socket.on('pending-ride-available', (data) => {
  // data: { _id, rideId, pickupLocation, dropoffLocation, fare, distance, rideType, rider, createdAt }
})
```
Broadcasted to all drivers when a new ride is requested.

#### Ride Accepted
```javascript
socket.on('ride-accepted', (data) => {
  // data: { rideId, driver: { id, name, phone, vehicleInfo, rating, currentLocation } }
})
```
Sent to rider when a driver accepts their ride.

#### Driver Arrived
```javascript
socket.on('driver-arrived', (data) => {
  // data: { rideId, otp: "1234", driver: { name, phone, location } }
})
```
Sent to rider when driver arrives at pickup location (includes OTP).

#### Ride Status Update
```javascript
socket.on('ride-status-update', (data) => {
  // data: { rideId, status, ride }
})
```
Sent to both rider and driver when ride status changes.

#### Driver Location
```javascript
socket.on('driver-location', (data) => {
  // data: { rideId, location: { lat, lng } }
})
```
Real-time driver location updates during ride.

#### Ride Cancelled
```javascript
socket.on('ride-cancelled', (data) => {
  // data: { rideId }
})
```
Sent to both parties when a ride is cancelled.

---

## Complete User Flow

### Rider Flow

1. **Register** → `POST /auth/register` (role: "rider")
2. **Login** → `POST /auth/login`
3. **Verify Token** → `GET /users/me` (automatic on app load)
4. **Update Location** → `PATCH /users/location` (optional, for better matching)
5. **Request Ride** → `POST /rides/request`
6. **Wait for Driver** → Listen to `ride-accepted` socket event
7. **Track Ride** → Listen to `driver-location` and `ride-status-update` events
8. **Receive OTP** → Listen to `driver-arrived` event (shows OTP to rider)
9. **Ride Completes** → Listen to `ride-status-update` with status "completed"
10. **View History** → `GET /rides/my-rides`

### Driver Flow

1. **Register** → `POST /auth/register` (role: "driver", include vehicleInfo & driverLicense)
2. **Login** → `POST /auth/login`
3. **Verify Token** → `GET /users/me` (automatic on app load)
4. **Update Location** → `PATCH /users/location` (required for matching)
5. **Set Availability** → `PATCH /users/availability` (set isAvailable: true)
6. **View Pending Rides** → `GET /rides/pending/all` or listen to `pending-ride-available` events
7. **Accept Ride** → `POST /rides/:rideId/accept`
8. **Update Location** → `PATCH /users/location` (continuously during ride)
9. **Mark Arrived** → `PATCH /rides/:rideId/status` (status: "driver_arrived")
10. **Verify OTP** → `POST /rides/:rideId/verify-otp` (with OTP from rider)
11. **Start Ride** → Status automatically changes to "in_progress" after OTP verification
12. **Complete Ride** → `PATCH /rides/:rideId/status` (status: "completed")
13. **View History** → `GET /rides/my-rides`

---

## Ride Status Flow

```
pending → accepted → driver_arrived → in_progress → completed
   ↓                                    ↓
cancelled                            cancelled
```

**Status Descriptions:**
- `pending` - Ride requested, waiting for driver
- `accepted` - Driver accepted the ride
- `driver_arrived` - Driver arrived at pickup (OTP generated)
- `in_progress` - Ride started (after OTP verification)
- `completed` - Ride finished successfully
- `cancelled` - Ride cancelled by rider or driver

---

## Fare Calculation

**Formula:**
```
Base Fare: $2.50
Per KM Rate:
  - Economy: $1.50/km
  - Comfort: $2.00/km
  - Premium: $3.00/km

Total Fare = Base Fare + (Distance × Per KM Rate)
```

**Example:**
- Distance: 5 km
- Ride Type: Economy
- Fare = $2.50 + (5 × $1.50) = $10.00

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens expire after 7 days. On expiration, user must login again.

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description"
}
```

**Validation Errors:**
```json
{
  "errors": [
    {
      "param": "email",
      "msg": "Please provide a valid email"
    }
  ]
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors, invalid input)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "rider"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Request Ride
```bash
curl -X POST http://localhost:5000/api/rides/request \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "pickupLocation": {
      "address": "123 Main St",
      "lat": 40.7128,
      "lng": -74.0060
    },
    "dropoffLocation": {
      "address": "456 Broadway",
      "lat": 40.7580,
      "lng": -73.9855
    },
    "rideType": "economy"
  }'
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Distances are calculated in kilometers using the Haversine formula
- Driver availability is required before accepting rides
- OTP expires after 5 minutes
- Socket.io rooms are based on user IDs and ride IDs
- Real-time location updates should be sent every 10-30 seconds during active rides
