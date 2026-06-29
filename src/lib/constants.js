export const RIDE_STATUS = {
  pending: { label: 'Finding Driver', color: 'volt', dot: 'bg-volt' },
  accepted: { label: 'Driver En Route', color: 'iris', dot: 'bg-iris' },
  driver_arrived: { label: 'Driver Arrived', color: 'coral', dot: 'bg-coral' },
  in_progress: { label: 'In Progress', color: 'volt', dot: 'bg-volt' },
  completed: { label: 'Completed', color: 'volt', dot: 'bg-volt' },
  cancelled: { label: 'Cancelled', color: 'coral', dot: 'bg-coral' },
}

export const RIDE_TYPES = [
  { value: 'economy', label: 'Pulse', desc: 'Fast & efficient', rate: '$1.50/km', icon: '⚡' },
  { value: 'comfort', label: 'Flow', desc: 'Extra space & comfort', rate: '$2.00/km', icon: '◈' },
  { value: 'premium', label: 'Apex', desc: 'Luxury experience', rate: '$3.00/km', icon: '✦' },
]

export const ACTIVE_STATUSES = ['pending', 'accepted', 'driver_arrived', 'in_progress']
export const DRIVER_ACTIVE_STATUSES = ['accepted', 'driver_arrived', 'in_progress']
