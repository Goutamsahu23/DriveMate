import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaMapMarkerAlt, FaCar, FaLocationArrow } from 'react-icons/fa'
import api from '../utils/api'
import ErrorBoundary from '../components/ErrorBoundary'
import MapComponent from '../components/MapComponent'

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
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]) // Default to NYC
  const [loading, setLoading] = useState(false)
  const [estimating, setEstimating] = useState(false)
  const [fareEstimate, setFareEstimate] = useState(null)
  const [mapError, setMapError] = useState(false)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  
  // Debounce timer for location search
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
        (error) => {
          console.error('Geolocation error:', error)
          // Keep default location, don't fail the page
        }
      )
    }
  }, [])

  // Fetch real location suggestions from OpenStreetMap Nominatim API (free, no API key needed)
  const fetchLocationSuggestions = async (input) => {
    if (!input || input.length < 2) return []
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&limit=5&countrycodes=in`
      )
      const data = await response.json()
      
      if (!data || data.length === 0) return []
      
      return data.map(location => ({
        address: location.display_name || `${location.name}, India`,
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lon)
      }))
    } catch (error) {
      console.error('Error fetching location suggestions:', error)
      return []
    }
  }

  const handlePickupAddressChange = (e) => {
    const value = e.target.value
    setPickupAddress(value)
    
    // Clear previous timeout
    if (pickupSearchTimeout.current) {
      clearTimeout(pickupSearchTimeout.current)
    }
    
    if (value.length > 1) {
      setSuggestionsLoading(true)
      // Debounce the search - wait 500ms before making API call
      pickupSearchTimeout.current = setTimeout(async () => {
        const suggestions = await fetchLocationSuggestions(value)
        setPickupSuggestions(suggestions)
        setShowPickupSuggestions(true)
        setSuggestionsLoading(false)
      }, 500)
    } else {
      setPickupSuggestions([])
      setShowPickupSuggestions(false)
      setSuggestionsLoading(false)
    }
  }

  const handleDropoffAddressChange = (e) => {
    const value = e.target.value
    setDropoffAddress(value)
    
    // Clear previous timeout
    if (dropoffSearchTimeout.current) {
      clearTimeout(dropoffSearchTimeout.current)
    }
    
    if (value.length > 1) {
      setSuggestionsLoading(true)
      // Debounce the search - wait 500ms before making API call
      dropoffSearchTimeout.current = setTimeout(async () => {
        const suggestions = await fetchLocationSuggestions(value)
        setDropoffSuggestions(suggestions)
        setShowDropoffSuggestions(true)
        setSuggestionsLoading(false)
      }, 500)
    } else {
      setDropoffSuggestions([])
      setShowDropoffSuggestions(false)
      setSuggestionsLoading(false)
    }
  }

  const selectPickupSuggestion = (suggestion) => {
    setPickupAddress(suggestion.address)
    setPickupLocation({ lat: suggestion.lat, lng: suggestion.lng })
    setShowPickupSuggestions(false)
    setMapCenter([suggestion.lat, suggestion.lng])
  }

  const selectDropoffSuggestion = (suggestion) => {
    setDropoffAddress(suggestion.address)
    setDropoffLocation({ lat: suggestion.lat, lng: suggestion.lng })
    setShowDropoffSuggestions(false)
  }

  const handleUseCurrentLocation = async (type) => {
    if (navigator.geolocation) {
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
        (error) => {
          console.error('Geolocation error:', error)
          alert('Unable to get your current location. Please enable location services.')
        }
      )
    }
  }

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const calculateFare = (distance, type) => {
    const baseFare = 2.5
    const perKmRate = {
      economy: 1.5,
      comfort: 2.0,
      premium: 3.0
    }
    return baseFare + (distance * perKmRate[type] || perKmRate.economy)
  }

  const handleMapClick = (type, lat, lng) => {
    try {
      if (type === 'pickup') {
        setPickupLocation({ lat, lng })
      } else {
        setDropoffLocation({ lat, lng })
      }
    } catch (err) {
      console.error('Map click handler error:', err)
    }
  }

  const handleEstimateFare = () => {
    if (!pickupLocation || !dropoffLocation) {
      alert('Please select both pickup and dropoff locations')
      return
    }

    try {
      setEstimating(true)
      const distance = calculateDistance(
        pickupLocation.lat,
        pickupLocation.lng,
        dropoffLocation.lat,
        dropoffLocation.lng
      )
      const fare = calculateFare(distance, rideType)
      setFareEstimate({ distance, fare })
    } catch (err) {
      console.error('Fare calculation error:', err)
      alert('Error calculating fare. Please try again.')
    } finally {
      setEstimating(false)
    }
  }

  const handleBookRide = async () => {
    if (!pickupLocation || !dropoffLocation) {
      alert('Please select both pickup and dropoff locations')
      return
    }

    setLoading(true)
    try {
      console.log('Booking ride with:', {
        pickupLocation,
        dropoffLocation,
        rideType
      })
      
      const res = await api.post('/rides/request', {
        pickupLocation: {
          ...pickupLocation,
          address: pickupAddress || 'Selected location'
        },
        dropoffLocation: {
          ...dropoffLocation,
          address: dropoffAddress || 'Selected location'
        },
        rideType
      })

      console.log('Ride booked successfully:', res.data)
      
      if (!res.data || !res.data._id) {
        console.error('Invalid response from server:', res.data)
        alert('Server returned invalid data. Please try again.')
        return
      }

      navigate(`/ride/${res.data._id}`)
    } catch (error) {
      console.error('Error booking ride:', error.response?.data || error.message)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to book ride. Please check your internet connection and try again.'
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Check if book ride button should be enabled
  const canBookRide = pickupLocation && dropoffLocation && !loading

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-8">Book a Ride</h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Map */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '600px', position: 'relative' }}>
              <ErrorBoundary
                fallback={
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center p-4">
                      <p className="text-red-600 mb-2">Map unavailable</p>
                      <p className="text-sm text-gray-600">You can still book a ride by entering addresses manually</p>
                    </div>
                  </div>
                }
              >
                {typeof window !== 'undefined' ? (
                  <MapComponent
                    center={mapCenter}
                    pickupLocation={pickupLocation}
                    dropoffLocation={dropoffLocation}
                    onMapClick={handleMapClick}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading map...</p>
                    </div>
                  </div>
                )}
              </ErrorBoundary>
            </div>

            {/* Booking Form */}
            <div className="space-y-6">
              {/* Pickup Location */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  <FaMapMarkerAlt className="inline text-primary-600 mr-2" />
                  Pickup Location
                </label>
                <div className="relative mb-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pickupAddress}
                      onChange={handlePickupAddressChange}
                      onFocus={() => pickupSuggestions.length > 0 && setShowPickupSuggestions(true)}
                      placeholder="Enter pickup address or click on map"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => handleUseCurrentLocation('pickup')}
                      className="px-4 py-3 bg-primary-100 hover:bg-primary-200 text-primary-600 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                      title="Use your current location"
                    >
                      <FaLocationArrow className="text-sm" />
                      <span className="hidden sm:inline">Current</span>
                    </button>
                  </div>
                  
                  {/* Pickup suggestions dropdown */}
                  {showPickupSuggestions && (
                    <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1">
                      {suggestionsLoading ? (
                        <div className="px-4 py-3 text-center text-gray-600">
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                            <span className="text-sm">Searching locations...</span>
                          </div>
                        </div>
                      ) : pickupSuggestions.length > 0 ? (
                        pickupSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => selectPickupSuggestion(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0 flex items-start gap-2"
                          >
                            <FaMapMarkerAlt className="text-primary-600 mt-1 flex-shrink-0" />
                            <span className="text-sm">{suggestion.address}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-center text-gray-600">
                          <p className="text-sm">No locations found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {pickupLocation && (
                  <p className="text-sm text-gray-600">
                    Selected: {pickupLocation.lat.toFixed(4)}, {pickupLocation.lng.toFixed(4)}
                  </p>
                )}
              </div>

              {/* Dropoff Location */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  <FaMapMarkerAlt className="inline text-green-600 mr-2" />
                  Dropoff Location
                </label>
                <div className="relative mb-2">
                  <input
                    type="text"
                    value={dropoffAddress}
                    onChange={handleDropoffAddressChange}
                    onFocus={() => dropoffSuggestions.length > 0 && setShowDropoffSuggestions(true)}
                    placeholder="Enter dropoff address or click on map"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  
                  {/* Dropoff suggestions dropdown */}
                  {showDropoffSuggestions && (
                    <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1">
                      {suggestionsLoading ? (
                        <div className="px-4 py-3 text-center text-gray-600">
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                            <span className="text-sm">Searching locations...</span>
                          </div>
                        </div>
                      ) : dropoffSuggestions.length > 0 ? (
                        dropoffSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => selectDropoffSuggestion(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0 flex items-start gap-2"
                          >
                            <FaMapMarkerAlt className="text-green-600 mt-1 flex-shrink-0" />
                            <span className="text-sm">{suggestion.address}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-center text-gray-600">
                          <p className="text-sm">No locations found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {dropoffLocation && (
                  <p className="text-sm text-gray-600">
                    Selected: {dropoffLocation.lat.toFixed(4)}, {dropoffLocation.lng.toFixed(4)}
                  </p>
                )}
              </div>

              {/* Ride Type */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <label className="block text-gray-700 font-semibold mb-4">
                  <FaCar className="inline text-primary-600 mr-2" />
                  Ride Type
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'economy', label: 'Economy', price: '$1.50/km' },
                    { value: 'comfort', label: 'Comfort', price: '$2.00/km' },
                    { value: 'premium', label: 'Premium', price: '$3.00/km' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setRideType(type.value)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                        rideType === type.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{type.label}</span>
                        <span className="text-sm text-gray-600">{type.price}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fare Estimate */}
              {fareEstimate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary-50 rounded-xl p-6 border-2 border-primary-200"
                >
                  <h3 className="font-bold text-lg mb-2">Fare Estimate</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Distance</span>
                      <span className="font-semibold">{fareEstimate.distance.toFixed(2)} km</span>
                    </div>
                    <div className="flex justify-between text-xl">
                      <span className="font-bold">Estimated Fare</span>
                      <span className="font-bold text-primary-600">${fareEstimate.fare.toFixed(2)}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleEstimateFare}
                  disabled={!pickupLocation || !dropoffLocation || estimating}
                  className="w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {estimating ? 'Calculating...' : 'Estimate Fare'}
                </button>
                <button
                  onClick={handleBookRide}
                  disabled={!pickupLocation || !dropoffLocation || loading}
                  className={`w-full font-semibold py-3 rounded-lg transition-colors ${
                    !pickupLocation || !dropoffLocation || loading
                      ? 'btn-primary opacity-50 cursor-not-allowed'
                      : 'btn-primary hover:bg-primary-700 cursor-pointer'
                  }`}
                  title={(!pickupLocation || !dropoffLocation) ? 'Please select both pickup and dropoff locations' : 'Book your ride'}
                >
                  {loading ? 'Booking...' : 'Book Ride'}
                </button>
                <button
                  onClick={() => navigate('/rider')}
                  className="w-full text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
