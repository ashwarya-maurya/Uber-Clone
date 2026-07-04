import React, { createContext, useState } from 'react'

export const RideDataContext = createContext()

const RideContext = ({ children }) => {

  const [ride, setRide] = useState({
    pickup: {
      address: '',
      lat: null,
      lng: null
    },
    destination: {
      address: '',
      lat: null,
      lng: null
    },
    selectedVehicleType: '',
    estimate: {
      Auto: null,
      Car: null,
      Bike: null,
      distance: null,
      duration: null
    },
    activeRide: {
      rideId: null,
      pickup: null,
      destination: null,
      vehicleType: null,
      fare: null,
      distance: null,
      duration: null,
      status: null,
      captain: null,
      otp: null,
      captainLocation: {
        lat: null,
        lng: null
      }
    }
  })

  const setPickup = (pickup) => {
    setRide((prev) => ({
      ...prev,
      pickup: {
        address: pickup.address ?? '',
        lat: pickup.lat ?? null,
        lng: pickup.lng ?? null
      }
    }))
  }

  const setDestination = (destination) => {
    setRide((prev) => ({
      ...prev,
      destination: {
        address: destination.address ?? '',
        lat: destination.lat ?? null,
        lng: destination.lng ?? null
      }
    }))
  }

  const setSelectedVehicleType = (vehicleType) => {
    setRide((prev) => ({
      ...prev,
      selectedVehicleType: vehicleType
    }))
  }

  const setEstimate = (estimateData) => {
    setRide((prev) => ({
      ...prev,
      estimate: {
        Auto: estimateData?.fare?.Auto ?? null,
        Car: estimateData?.fare?.Car ?? null,
        Bike: estimateData?.fare?.Bike ?? null,
        distance: estimateData?.distance ?? null,
        duration: estimateData?.duration ?? null
      }
    }))
  }

  const clearEstimate = () => {
    setRide((prev) => ({
      ...prev,
      estimate: {
        Auto: null,
        Car: null,
        Bike: null,
        distance: null,
        duration: null
      }
    }))
  }

  const setActiveRide = (rideData) => {
    setRide((prev) => ({
      ...prev,
      activeRide: {
        rideId: rideData?._id ?? prev.activeRide.rideId,
        pickup: rideData?.pickup ?? prev.activeRide.pickup,
        destination: rideData?.destination ?? prev.activeRide.destination,
        vehicleType: rideData?.vehicleType ?? prev.activeRide.vehicleType,
        fare: rideData?.fare ?? prev.activeRide.fare,
        distance: rideData?.distance ?? prev.activeRide.distance,
        duration: rideData?.duration ?? prev.activeRide.duration,
        status: rideData?.status ?? prev.activeRide.status,
        captain: rideData?.captain ?? prev.activeRide.captain,
        otp: rideData?.otp ?? prev.activeRide.otp,
        captainLocation: prev.activeRide.captainLocation
      }
    }))
  }

  const setCaptainLocation = (location) => {
    setRide((prev) => ({
      ...prev,
      activeRide: {
        ...prev.activeRide,
        captainLocation: {
          lat: location?.lat ?? null,
          lng: location?.lng ?? null
        }
      }
    }))
  }

  const clearActiveRide = () => {
    setRide((prev) => ({
      ...prev,
      activeRide: {
        rideId: null,
        pickup: null,
        destination: null,
        vehicleType: null,
        fare: null,
        distance: null,
        duration: null,
        status: null,
        captain: null,
        otp: null,
        captainLocation: {
          lat: null,
          lng: null
        }
      }
    }))
  }

  return (
    <RideDataContext.Provider value={{
      ride,
      setRide,
      setPickup,
      setDestination,
      setSelectedVehicleType,
      setEstimate,
      clearEstimate,
      setActiveRide,
      clearActiveRide,
      setCaptainLocation
    }}>
      {children}
    </RideDataContext.Provider>
  )
}

export default RideContext