# DriveMate Testing Workflow

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐                         ┌──────────────────┐
│  RIDER BROWSER   │                         │  DRIVER BROWSER  │
│  (Port 5173)     │                         │  (Port 5173)     │
│                  │                         │                  │
│ • Login/Register │                         │ • Login/Register │
│ • Book a Ride    │─────────────────────────│ • Go Online      │
│ • Track Ride     │      Socket.io          │ • Accept Ride    │
│                  │     WebSocket           │ • Update Status  │
└────────┬─────────┘                         └────────┬─────────┘
         │                                            │
         │                                            │
         └──────────────────┬───────────────────────┘
                            │
                     ┌──────▼────────┐
                     │   Backend     │
                     │ (Port 5000)   │
                     │               │
                     │ • Express.js  │
                     │ • Socket.io   │
                     │ • MongoDB     │
                     │ • JWT Auth    │
                     └────────────────┘
```

---

## Complete Testing Sequence

### Phase 1: Account Creation (5 minutes)

```
START
  │
  ├─► Create DRIVER Account (Browser 1)
  │   ├─ Go to localhost:5173
  │   ├─ Click "Register"
  │   ├─ Enter: Name, Email, Password, Phone, Vehicle Info
  │   ├─ Select Role: "Driver"
  │   └─ Success: Redirected to Driver Dashboard
  │
  └─► Create RIDER Account (Browser 2 - Incognito)
      ├─ Go to localhost:5173
      ├─ Click "Register"
      ├─ Enter: Name, Email, Password, Phone
      ├─ Select Role: "Rider"
      └─ Success: Redirected to Rider Dashboard
```

---

### Phase 2: Driver Goes Online (2 minutes)

```
DRIVER BROWSER:
  │
  ├─► On Driver Dashboard
  │   ├─ See "Driver Status" section at top
  │   ├─ See toggle button (currently OFF/Gray)
  │   │
  │   └─► CLICK TOGGLE
  │       ├─ Toggle turns GREEN
  │       ├─ Message: "You are available for rides"
  │       └─ Socket.io emits: join-room event
  │
  └─ Ready to receive ride requests! ✅

SERVER LOGS:
  "User [socket-id] joined room"
```

---

### Phase 3: Rider Books a Ride (3 minutes)

```
RIDER BROWSER:
  │
  ├─► On Rider Dashboard
  │   └─ Click "Book a Ride" button
  │
  ├─► On Booking Page
  │   │
  │   ├─► SELECT PICKUP LOCATION
  │   │   ├─ Type "main" or "broadway" in pickup field
  │   │   ├─ See suggestions dropdown appear
  │   │   └─ Click a suggestion to select it
  │   │
  │   ├─► SELECT DROPOFF LOCATION
  │   │   ├─ Type address in dropoff field
  │   │   ├─ See suggestions dropdown appear
  │   │   └─ Click a suggestion to select it
  │   │
  │   ├─► SELECT RIDE TYPE
  │   │   ├─ Click on: Economy / Comfort / Premium
  │   │   └─ (Affects pricing per km)
  │   │
  │   ├─► ESTIMATE FARE
  │   │   ├─ Click "Estimate Fare" button
  │   │   ├─ See calculated distance and fare
  │   │   └─ Fare box appears below
  │   │
  │   └─► BOOK RIDE
  │       ├─ Click "Book Ride" button
  │       ├─ API Call: POST /api/rides/request
  │       ├─ Success: Ride created in MongoDB
  │       └─ Redirect: RideTracking page
  │
  └─► On RideTracking Page
      ├─ Map shows pickup & dropoff locations
      ├─ Status: PENDING (yellow badge)
      └─ Waiting for driver to accept... ✅

SERVER LOGIC:
  ├─ Validate pickup/dropoff locations
  ├─ Calculate distance (Haversine formula)
  ├─ Calculate fare (base + distance × rate)
  ├─ Create Ride document in MongoDB
  ├─ Find all available drivers (role=driver, isAvailable=true)
  ├─ Emit 'new-ride-request' to each driver via Socket.io
  └─ Return ride ID to rider

SERVER LOGS:
  "Request ride error: [error]" OR
  "Sent ride request to [N] available drivers"
```

---

### Phase 4: Driver Receives & Accepts (2 minutes)

```
DRIVER BROWSER:
  │
  ├─► Driver Dashboard (still showing "Available for rides")
  │   │
  │   ├─► WAIT/REFRESH
  │   │   └─ Watch for "New Ride Requests" section to appear
  │   │
  │   └─► NEW RIDE REQUEST APPEARS
  │       └─ New card shows under "New Ride Requests":
  │           ├─ Pickup Location
  │           ├─ Dropoff Location
  │           ├─ Distance (km)
  │           ├─ Fare ($$)
  │           └─ "Accept Ride" button
  │
  └─► CLICK "ACCEPT RIDE"
      ├─ API Call: POST /api/rides/[rideId]/accept
      ├─ Update in MongoDB: driver field set to driver ID
      ├─ Change ride status: pending → accepted
      ├─ Socket.io emits: 'ride-accepted' to rider
      ├─ Success: Redirect to RideTracking page
      └─ Status: ACCEPTED (blue badge) ✅

RIDER BROWSER (Real-time Update):
  │
  └─ Socket.io receives 'ride-accepted' event
     ├─ Status changes: PENDING → ACCEPTED
     ├─ Driver info appears:
     │  ├─ Driver name
     │  ├─ Driver phone
     │  ├─ Driver rating
     │  └─ Vehicle info (Make, Model, Color, Plate)
     └─ Both now on RideTracking page ✅
```

---

### Phase 5: Complete the Ride (3 minutes)

```
DRIVER BROWSER (RideTracking Page):
  │
  ├─► Status: ACCEPTED
  │   └─ Button: "Mark as Arrived"
  │
  ├─► CLICK "Mark as Arrived"
  │   ├─ Status: DRIVER ARRIVED (purple badge)
  │   └─ Button: "Start Ride"
  │
  ├─► CLICK "Start Ride"
  │   ├─ Status: IN PROGRESS (green badge)
  │   ├─ Time stamp: startedAt set
  │   └─ Button: "Complete Ride"
  │
  └─► CLICK "Complete Ride"
      ├─ Status: COMPLETED (green badge)
      ├─ Driver set to isAvailable: true
      ├─ Ride completed timestamp set
      ├─ Redirect to Driver Dashboard
      └─ Ride removed from Active Rides ✅

RIDER BROWSER (Real-time):
  │
  └─ Receives status updates via Socket.io
     ├─ ACCEPTED → DRIVER ARRIVED
     ├─ DRIVER ARRIVED → IN PROGRESS
     ├─ IN PROGRESS → COMPLETED
     ├─ Shows status badge changing
     └─ Redirected to Rider Dashboard ✅

BOTH DASHBOARDS:
  │
  └─ Ride cycle complete!
     ├─ Can view in "Ride History"
     ├─ Can rate driver/rider (if implemented)
     └─ Ready to start new rides ✅
```

---

## Status Codes & Colors

| Status | Color | Badge | Action Next |
|--------|-------|-------|-------------|
| pending | Yellow | ⚠️ PENDING | Driver needs to accept |
| accepted | Blue | 🔵 ACCEPTED | Driver marks arrived |
| driver_arrived | Purple | 🟣 DRIVER ARRIVED | Start the ride |
| in_progress | Green | 🟢 IN PROGRESS | Complete the ride |
| completed | Green | ✅ COMPLETED | Ride finished |
| cancelled | Red | ❌ CANCELLED | Ride ended |

---

## Socket.io Events Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    REAL-TIME EVENTS                         │
└─────────────────────────────────────────────────────────────┘

PHASE 1: Driver Goes Online
  Driver → Server: emit('join-room', userId)
  Server: Adds driver to Socket.io room

PHASE 2: Rider Books Ride
  Rider → Server: POST /api/rides/request
  Server → Drivers: emit('new-ride-request', rideData)
  ⚡ All online drivers receive the notification

PHASE 3: Driver Accepts
  Driver → Server: POST /api/rides/[id]/accept
  Server → Rider: emit('ride-accepted', rideData)
  ⚡ Rider instantly sees driver info

PHASE 4: Status Updates
  Driver → Server: PATCH /api/rides/[id]/status
  Server → Both: emit('ride-status', {rideId, status})
  ⚡ Both see status change in real-time

PHASE 5: Ride Completes
  Completion triggers redirect to dashboards
```

---

## Debugging Checklist

### If Ride Requests Not Showing

```
✓ Check 1: Is driver toggle ON? (Green)
  └─ If NO: Click toggle first!

✓ Check 2: Is driver socket connected?
  └─ F12 → Console → Check for "Driver socket connected"

✓ Check 3: Did server emit to driver?
  └─ Terminal: Check for "Sent ride request to X drivers"

✓ Check 4: Did driver receive event?
  └─ F12 → Console → Check for "New ride request received"
```

### If Status Updates Not Showing

```
✓ Manual Refresh: Refresh rider page (F5)
  
✓ Socket Check: F12 → Network → WS (should be connected)

✓ Console: Check for socket.io errors
  
✓ Server: Check for ride update logs
```

### If Location Suggestions Not Working

```
✓ Type at least 2 characters
✓ Suggestions are mock data: "Main Street", "Broadway", etc.
✓ Click on a suggestion to select (sets coordinates)
```

---

## Performance Tips

1. **Keep Console Open**: F12 on both browser windows to see logs
2. **Keep Terminal Visible**: Watch server logs
3. **Refresh Between Tests**: Clear old data before new test
4. **Use Separate Browser Windows**: Not tabs (better Socket.io handling)
5. **Test One Feature at a Time**: Don't skip steps

---

## Success Metrics

```
✅ Account Creation Works
✅ Driver Can Go Online
✅ Ride Requests Appear for Driver
✅ Driver Can Accept Rides
✅ Status Updates Real-Time
✅ Locations Display on Map
✅ Both See Correct Information
✅ No Console Errors
✅ No Server Errors
```

If all pass → **Application is working correctly! 🎉**

---

## Next Steps (After Testing)

- [ ] Test with multiple drivers
- [ ] Test cancellation
- [ ] Test rating system
- [ ] Test with real locations (implement Google Maps API)
- [ ] Deploy to production
