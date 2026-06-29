import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

if (typeof window !== 'undefined' && L?.Icon?.Default) {
  try {
    delete L.Icon.Default.prototype._getIconUrl
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
    if (map && center?.length === 2) map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

export default function MapComponent({ center, pickupLocation, dropoffLocation, onMapClick }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleMapClick = (e) => {
    if (!e?.latlng) return
    const { lat, lng } = e.latlng
    if (!pickupLocation) onMapClick('pickup', lat, lng)
    else if (!dropoffLocation) onMapClick('dropoff', lat, lng)
    else onMapClick('pickup', lat, lng)
  }

  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center bg-void-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-volt/30 border-t-volt rounded-full animate-spin" />
          <p className="font-mono text-xs uppercase tracking-widest text-mist-dim">Loading map</p>
        </div>
      </div>
    )
  }

  if (!center || !Array.isArray(center) || center.length !== 2) {
    return (
      <div className="h-full flex items-center justify-center bg-void-100">
        <p className="font-mono text-xs text-mist-dim uppercase tracking-widest">Waiting for location</p>
      </div>
    )
  }

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom
      eventHandlers={{ click: handleMapClick }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      <MapController center={center} />
      {pickupLocation?.lat && pickupLocation?.lng && (
        <Marker position={[pickupLocation.lat, pickupLocation.lng]} />
      )}
      {dropoffLocation?.lat && dropoffLocation?.lng && (
        <Marker position={[dropoffLocation.lat, dropoffLocation.lng]} />
      )}
    </MapContainer>
  )
}
