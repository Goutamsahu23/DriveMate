import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon - only run on client side
if (typeof window !== 'undefined' && L && L.Icon && L.Icon.Default) {
  try {
    // Remove the default icon URL getter
    delete (L.Icon.Default.prototype)._getIconUrl
    
    // Set custom icon URLs using unpkg CDN (more reliable)
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  } catch (e) {
    console.warn('Could not set Leaflet icon options:', e)
  }
}

function MapController({ center }) {
  const map = useMap()
  useEffect(() => {
    if (map && center && Array.isArray(center) && center.length === 2) {
      map.setView(center, map.getZoom())
    }
  }, [center, map])
  return null
}

export default function MapComponent({ center, pickupLocation, dropoffLocation, onMapClick }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setMounted(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleMapClick = (e) => {
    if (!e || !e.latlng) return
    const { lat, lng } = e.latlng
    
    if (!pickupLocation) {
      onMapClick('pickup', lat, lng)
    } else if (!dropoffLocation) {
      onMapClick('dropoff', lat, lng)
    } else {
      onMapClick('pickup', lat, lng)
    }
  }

  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  if (!center || !Array.isArray(center) || center.length !== 2) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Waiting for location...</p>
        </div>
      </div>
    )
  }

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      eventHandlers={{
        click: handleMapClick
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapController center={center} />
      {pickupLocation && pickupLocation.lat && pickupLocation.lng && (
        <Marker position={[pickupLocation.lat, pickupLocation.lng]} />
      )}
      {dropoffLocation && dropoffLocation.lat && dropoffLocation.lng && (
        <Marker position={[dropoffLocation.lat, dropoffLocation.lng]} />
      )}
    </MapContainer>
  )
}
