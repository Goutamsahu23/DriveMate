export const MARQUEE_ITEMS = [
  'Real-time tracking', 'Instant booking', 'Verified drivers',
  'Live OTP security', 'Cash payments', 'Zero surge pricing',
  'OpenStreetMap', 'Socket.io powered', 'Move different',
]

export const ACCENT_TEXT = { volt: 'text-volt', iris: 'text-iris', coral: 'text-coral' }

export const FEATURES = [
  {
    num: '01',
    title: 'Velocity',
    desc: 'Book in seconds. Your driver is already moving before you finish typing.',
    accent: 'volt',
  },
  {
    num: '02',
    title: 'Precision',
    desc: 'Live GPS tracking with sub-second updates. Every meter, accounted for.',
    accent: 'iris',
  },
  {
    num: '03',
    title: 'Trust',
    desc: 'OTP-verified pickups. Rated drivers. Your safety isn\'t negotiable.',
    accent: 'coral',
  },
]

export const HOW_IT_WORKS = [
  { step: '01', title: 'Set your route', desc: 'Drop a pin, search an address, or tap your current location. Pick Pulse, Flow, or Apex.', accent: 'volt' },
  { step: '02', title: 'Get matched', desc: 'Nearby drivers receive your request instantly. First to accept is yours — no bidding wars.', accent: 'iris' },
  { step: '03', title: 'Track live', desc: 'Watch your driver approach in real-time. Share a 4-digit OTP when they arrive.', accent: 'coral' },
  { step: '04', title: 'Arrive & pay', desc: 'Ride complete. Pay cash directly. Rate your experience. Done.', accent: 'volt' },
]

export const STATS = [
  { value: '10K+', label: 'Rides completed' },
  { value: '< 3min', label: 'Avg. pickup time' },
  { value: '500+', label: 'Active drivers' },
  { value: '4.9', label: 'Rider rating' },
]

export const RIDE_CLASSES = [
  { name: 'Pulse', type: 'economy', rate: '$1.50/km', desc: 'Fast, efficient, everyday rides.', icon: '⚡', accent: 'volt' },
  { name: 'Flow', type: 'comfort', rate: '$2.00/km', desc: 'More space. Smoother journeys.', icon: '◈', accent: 'iris' },
  { name: 'Apex', type: 'premium', rate: '$3.00/km', desc: 'Top-tier vehicles. VIP treatment.', icon: '✦', accent: 'coral' },
]

export const TESTIMONIALS = [
  { quote: 'The live tracking is absurdly smooth. I watched my driver turn the corner before they even called.', name: 'Priya S.', role: 'Rider', city: 'Delhi' },
  { quote: 'Went online, accepted a ride in 40 seconds. The dashboard actually feels built for drivers.', name: 'Rahul M.', role: 'Driver', city: 'Mumbai' },
  { quote: 'OTP pickup gave me real peace of mind. No getting in the wrong car ever again.', name: 'Ananya K.', role: 'Rider', city: 'Bangalore' },
]

export const FAQ = [
  { q: 'How do I book a ride?', a: 'Sign up as a rider, open the dashboard, and tap Book a Ride. Set pickup and dropoff on the map or via address search.' },
  { q: 'How does driver matching work?', a: 'When you request a ride, all available nearby drivers are notified in real-time. The first driver to accept gets the trip.' },
  { q: 'What is the OTP for?', a: 'When your driver arrives, you receive a 4-digit code. Share it with them to verify identity before starting the ride.' },
  { q: 'What payment methods are supported?', a: 'Currently cash payments at the end of your trip. Simple, direct, no hidden fees.' },
]
