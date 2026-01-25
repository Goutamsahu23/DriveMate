// Calculate distance using Haversine formula
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Calculate fare based on distance and ride type
export const calculateFare = (distance, rideType) => {
  const baseFare = 2.5;
  const perKmRate = {
    economy: 1.5,
    comfort: 2.0,
    premium: 3.0
  };
  return baseFare + (distance * perKmRate[rideType] || perKmRate.economy);
};

// Generate OTP
export const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Calculate OTP expiration time (5 minutes from now)
export const getOTPExpiration = () => {
  return new Date(Date.now() + 5 * 60 * 1000);
};
