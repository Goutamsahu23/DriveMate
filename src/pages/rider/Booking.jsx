import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaMapMarkerAlt, FaLocationArrow, FaArrowLeft } from 'react-icons/fa'
import api from '../../services/api'
import ErrorBoundary from '../../components/common/ErrorBoundary'
import MapComponent from '../../components/map/MapComponent'
import AppHeader from '../../components/layout/AppHeader'
import Button from '../../components/ui/Button'
import Toast from '../../components/ui/Toast'
import { RIDE_TYPES } from '../../lib/constants'

export default function Booking() {
  const navigate = useNavigate()
  const [pickupLocation, setPickupLocation] = useState(null)
  const [dropoffLocation, setDropoffLocation] = useState(null)
  const [pickupAddress, setPickupAddress] = useState('')
  const [dropoffAddress, setDropoffAddress] = useState('')
  const [pickupSuggestions, setPickupSuggestions] = useState([])
  const [dropoffSuggestions, setDropoffSuggestions] = useState([])
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false)
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false)
  const [rideType, setRideType] = useState('economy')
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060])
  const [loading, setLoading] = useState(false)
  const [estimating, setEstimating] = useState(false)
  const [fareEstimate, setFareEstimate] = useState(null)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [activeField, setActiveField] = useState(null)

  const pickupSearchTimeout = useRef(null)
  const dropoffSearchTimeout = useRef(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setMapCenter([latitude, longitude])
          setPickupLocation({ lat: latitude, lng: longitude })
        },
        () => {},
      )
    }
  }, [])

  const fetchLocationSuggestions = async (input) => {
    if (!input || input.length < 2) return []
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&limit=5&countrycodes=in`,
      )
      const data = await response.json()
      if (!data?.length) return []
      return data.map((location) => ({
        address: location.display_name || `${location.name}, India`,
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lon),
      }))
    } catch {
      return []
    }
  }

  const handleAddressChange = (type, value) => {
    const isPickup = type === 'pickup'
    if (isPickup) setPickupAddress(value)
    else setDropoffAddress(value)

    const timeoutRef = isPickup ? pickupSearchTimeout : dropoffSearchTimeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (value.length > 1) {
      setSuggestionsLoading(true)
      timeoutRef.current = setTimeout(async () => {
        const suggestions = await fetchLocationSuggestions(value)
        if (isPickup) {
          setPickupSuggestions(suggestions)
          setShowPickupSuggestions(true)
        } else {
          setDropoffSuggestions(suggestions)
          setShowDropoffSuggestions(true)
        }
        setSuggestionsLoading(false)
      }, 500)
    } else {
      if (isPickup) { setPickupSuggestions([]); setShowPickupSuggestions(false) }
      else { setDropoffSuggestions([]); setShowDropoffSuggestions(false) }
      setSuggestionsLoading(false)
    }
  }

  const selectSuggestion = (type, suggestion) => {
    if (type === 'pickup') {
      setPickupAddress(suggestion.address)
      setPickupLocation({ lat: suggestion.lat, lng: suggestion.lng })
      setShowPickupSuggestions(false)
      setMapCenter([suggestion.lat, suggestion.lng])
    } else {
      setDropoffAddress(suggestion.address)
      setDropoffLocation({ lat: suggestion.lat, lng: suggestion.lng })
      setShowDropoffSuggestions(false)
    }
  }

  const handleUseCurrentLocation = (type) => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        if (type === 'pickup') {
          setPickupLocation({ lat: latitude, lng: longitude })
          setPickupAddress('Current Location')
          setMapCenter([latitude, longitude])
        } else {
          setDropoffLocation({ lat: latitude, lng: longitude })
          setDropoffAddress('Current Location')
        }
      },
      () => setToast('Unable to get your location. Please enable location services.'),
    )
  }

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const calculateFare = (distance, type) => {
    const rates = { economy: 1.5, comfort: 2.0, premium: 3.0 }
    return 2.5 + distance * (rates[type] || rates.economy)
  }

  const handleMapClick = (type, lat, lng) => {
    if (type === 'pickup') setPickupLocation({ lat, lng })
    else setDropoffLocation({ lat, lng })
  }

  const handleEstimateFare = () => {
    if (!pickupLocation || !dropoffLocation) {
      setToast('Please select both pickup and dropoff locations')
      return
    }
    setEstimating(true)
    const distance = calculateDistance(pickupLocation.lat, pickupLocation.lng, dropoffLocation.lat, dropoffLocation.lng)
    setFareEstimate({ distance, fare: calculateFare(distance, rideType) })
    setEstimating(false)
  }

  const handleBookRide = async () => {
    if (!pickupLocation || !dropoffLocation) {
      setToast('Please select both pickup and dropoff locations')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/rides/request', {
        pickupLocation: { ...pickupLocation, address: pickupAddress || 'Selected location' },
        dropoffLocation: { ...dropoffLocation, address: dropoffAddress || 'Selected location' },
        rideType,
      })
      if (!res.data?._id) {
        setToast('Server returned invalid data. Please try again.')
        return
      }
      navigate(`/ride/${res.data._id}`)
    } catch (error) {
      setToast(error.response?.data?.message || 'Failed to book ride')
    } finally {
      setLoading(false)
    }
  }

  const SuggestionDropdown = ({ suggestions, show, onSelect, loading: sugLoading, accent }) => (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="absolute z-20 top-full left-0 right-0 mt-2 glass-strong rounded-2xl overflow-hidden border border-surface-border-strong"
        >
          {sugLoading ? (
            <div className="px-4 py-4 flex items-center gap-3 text-mist-muted text-sm">
              <div className="w-4 h-4 border-2 border-volt/30 border-t-volt rounded-full animate-spin" />
              Searching...
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(s)}
                className="w-full text-left px-4 py-3 hover:bg-surface-hover border-b border-surface-border last:border-0 flex items-start gap-3 transition-colors"
              >
                <FaMapMarkerAlt className={`mt-1 shrink-0 ${accent}`} />
                <span className="text-sm text-mist-muted line-clamp-2">{s.address}</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-4 text-sm text-mist-dim text-center">No locations found</div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="min-h-screen bg-void flex flex-col">
      <AppHeader role="rider" />
      <Toast message={toast} type="error" onClose={() => setToast('')} />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Map — takes majority on desktop */}
        <div className="relative flex-1 min-h-[45vh] lg:min-h-0">
          <ErrorBoundary
            fallback={
              <div className="h-full flex items-center justify-center bg-void-100">
                <p className="text-coral text-sm">Map unavailable — use address search below</p>
              </div>
            }
          >
            <MapComponent
              center={mapCenter}
              pickupLocation={pickupLocation}
              dropoffLocation={dropoffLocation}
              onMapClick={handleMapClick}
            />
          </ErrorBoundary>

          {/* Floating back button */}
          <button
            onClick={() => navigate('/rider')}
            className="absolute top-4 left-4 z-[1000] glass-strong rounded-full px-4 py-2 flex items-center gap-2 text-sm text-mist-muted hover:text-mist transition-colors"
          >
            <FaArrowLeft className="w-3 h-3" />
            Back
          </button>
        </div>

        {/* Booking panel — slides up on mobile */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-[440px] xl:w-[480px] glass-strong border-t lg:border-t-0 lg:border-l border-surface-border overflow-y-auto"
        >
          <div className="p-6 space-y-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-volt mb-1">New ride</p>
              <h1 className="font-display font-bold text-2xl text-mist">Set your route</h1>
            </div>

            {/* Pickup */}
            <div className="relative">
              <label className="label-field">Pickup</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => handleAddressChange('pickup', e.target.value)}
                    onFocus={() => { setActiveField('pickup'); pickupSuggestions.length > 0 && setShowPickupSuggestions(true) }}
                    placeholder="Where from?"
                    className="input-field"
                  />
                  <SuggestionDropdown
                    suggestions={pickupSuggestions}
                    show={showPickupSuggestions && activeField === 'pickup'}
                    onSelect={(s) => selectSuggestion('pickup', s)}
                    loading={suggestionsLoading}
                    accent="text-volt"
                  />
                </div>
                <button
                  onClick={() => handleUseCurrentLocation('pickup')}
                  className="shrink-0 w-12 h-12 rounded-2xl bg-volt/10 border border-volt/20 text-volt flex items-center justify-center hover:bg-volt/20 transition-colors"
                  title="Use current location"
                >
                  <FaLocationArrow className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dropoff */}
            <div className="relative">
              <label className="label-field">Dropoff</label>
              <input
                type="text"
                value={dropoffAddress}
                onChange={(e) => handleAddressChange('dropoff', e.target.value)}
                onFocus={() => { setActiveField('dropoff'); dropoffSuggestions.length > 0 && setShowDropoffSuggestions(true) }}
                placeholder="Where to?"
                className="input-field"
              />
              <SuggestionDropdown
                suggestions={dropoffSuggestions}
                show={showDropoffSuggestions && activeField === 'dropoff'}
                onSelect={(s) => selectSuggestion('dropoff', s)}
                loading={suggestionsLoading}
                accent="text-coral"
              />
            </div>

            {/* Ride type */}
            <div>
              <label className="label-field">Ride class</label>
              <div className="space-y-2">
                {RIDE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setRideType(type.value)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 ${
                      rideType === type.value
                        ? 'border-volt/40 bg-volt/5 shadow-volt'
                        : 'border-surface-border bg-void-50 hover:border-surface-border-strong'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{type.icon}</span>
                        <div>
                          <p className="font-display font-semibold text-mist">{type.label}</p>
                          <p className="text-mist-dim text-xs">{type.desc}</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs text-mist-muted">{type.rate}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fare estimate */}
            <AnimatePresence>
              {fareEstimate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl border border-volt/20 bg-volt/5 p-5 overflow-hidden"
                >
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim">Distance</p>
                      <p className="font-display font-bold text-mist">{fareEstimate.distance.toFixed(2)} km</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim">Estimate</p>
                      <p className="font-display font-bold text-2xl text-volt">${fareEstimate.fare.toFixed(2)}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleEstimateFare}
                disabled={!pickupLocation || !dropoffLocation || estimating}
                loading={estimating}
              >
                Estimate Fare
              </Button>
              <Button
                className="w-full"
                onClick={handleBookRide}
                disabled={!pickupLocation || !dropoffLocation}
                loading={loading}
              >
                Book Ride →
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
