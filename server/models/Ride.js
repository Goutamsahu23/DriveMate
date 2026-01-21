import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema({
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pickupLocation: {
    address: String,
    lat: Number,
    lng: Number
  },
  dropoffLocation: {
    address: String,
    lat: Number,
    lng: Number
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'driver_arrived', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  fare: {
    type: Number,
    default: 0
  },
  distance: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  },
  rideType: {
    type: String,
    enum: ['economy', 'comfort', 'premium'],
    default: 'economy'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  startedAt: Date,
  completedAt: Date,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: String,
  otp: {
    code: String,
    expiresAt: Date,
    verified: {
      type: Boolean,
      default: false
    }
  },
  driverArrivedAt: Date
}, {
  timestamps: true
});

export default mongoose.model('Ride', rideSchema);
