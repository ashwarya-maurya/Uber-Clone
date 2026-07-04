import React, { useContext, useEffect, useRef, useState } from 'react'
import RideComplete from '../components/RideComplete'
import LiveMap from '../components/LiveMap'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { RideDataContext } from '../context/RideContext'
import { SocketDataContext } from '../context/SocketContext'
import api from '../services/api'

const LOCATION_EMIT_INTERVAL_MS = 4000

const CaptainRiding = () => {

  const { ride, setActiveRide, setCaptainLocation } = useContext(RideDataContext)
  const { getSocket } = useContext(SocketDataContext)
  const activeRide = ride.activeRide

  const [otp, setOtp] = useState('')
  const [isStarting, setIsStarting] = useState(false)
  const [startError, setStartError] = useState('')

  const [rideCompletePanel, setrideCompletePanel] = useState(false)
  const rideCompleteRef = useRef(null)

  const [isFinishing, setIsFinishing] = useState(false)
  const [finishError, setFinishError] = useState('')

  const [captainOwnPosition, setCaptainOwnPosition] = useState(null)

  const latestPositionRef = useRef(null)
  const watchIdRef = useRef(null)
  const emitIntervalRef = useRef(null)

  const isOngoing = activeRide.status === 'ongoing'

  const submitOtp = async (e) => {
    e.preventDefault()
    setStartError('')

    if (!activeRide.rideId) {
      setStartError('No active ride found.')
      return
    }

    if (otp.length !== 6) {
      setStartError('OTP must be 6 digits.')
      return
    }

    setIsStarting(true)

    try {
      const response = await api.post('/rides/start', {
        rideId: activeRide.rideId,
        otp
      })

      setActiveRide(response.data)
    } catch (error) {
      setStartError(error.response?.data?.message || 'Invalid OTP. Please check with the rider and try again.')
    } finally {
      setIsStarting(false)
    }
  }

  useEffect(() => {
    if (!isOngoing) {
      return
    }

    if (!navigator.geolocation) {
      return
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        latestPositionRef.current = { lat: latitude, lng: longitude }
        setCaptainOwnPosition({ lat: latitude, lng: longitude })
        setCaptainLocation({ lat: latitude, lng: longitude })
      },
      () => {

      },
      { enableHighAccuracy: true }
    )

    emitIntervalRef.current = setInterval(() => {
      const socket = getSocket()
      const latest = latestPositionRef.current

      if (socket && latest && activeRide.captain?._id) {
        socket.emit('update-location-captain', {
          captainId: activeRide.captain._id,
          location: latest
        })
      }
    }, LOCATION_EMIT_INTERVAL_MS)

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      if (emitIntervalRef.current !== null) {
        clearInterval(emitIntervalRef.current)
        emitIntervalRef.current = null
      }
    }

  }, [isOngoing, activeRide.captain?._id, getSocket, setCaptainLocation])

  const finishRide = async () => {
    setFinishError('')

    if (!activeRide.rideId) {
      setFinishError('No active ride found.')
      return
    }

    setIsFinishing(true)

    try {
      const response = await api.post('/rides/end', {
        rideId: activeRide.rideId
      })

      setActiveRide(response.data)
      setrideCompletePanel(true)
    } catch (error) {
      setFinishError(error.response?.data?.message || 'Could not end the ride. Please try again.')
    } finally {
      setIsFinishing(false)
    }
  }

  useGSAP(()=>{
    if(rideCompletePanel){
      gsap.to(rideCompleteRef.current,{
        translateY: '0%'
      })
    }else{
      gsap.to(rideCompleteRef.current,{
        translateY : '100%'
      })
    }
  },[rideCompletePanel])

  if (!isOngoing) {
    return (
      <div className='h-screen flex flex-col justify-center p-6'>
        <h4 className='text-2xl font-bold mb-2'>Enter Rider's OTP</h4>
        <p className='text-sm text-gray-600 mb-5'>Ask the rider for their 6-digit OTP to start the trip.</p>

        <form onSubmit={submitOtp}>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className='w-full text-lg font-mono rounded p-4 mb-5 bg-gray-200 tracking-widest text-center'
            type="text"
            placeholder='••••••'
          />

          {startError && (
            <p className='text-sm text-red-600 mb-3'>{startError}</p>
          )}

          <button
            type='submit'
            disabled={isStarting}
            className={`w-full text-white p-3 rounded font-semibold ${isStarting ? 'bg-green-400' : 'bg-green-700'}`}
          >
            {isStarting ? 'Verifying...' : 'Start Ride'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className='h-screen'>

      <div className='h-[88%]'>
        <LiveMap
          center={captainOwnPosition ? [captainOwnPosition.lat, captainOwnPosition.lng] : null}
          pickup={null}
          destination={null}
          captainLocation={captainOwnPosition}
        />
      </div>

      <div className='h-[12%] flex flex-col justify-center items-center w-full bg-yellow-500 p-3'>
        {finishError && (
          <p className='text-sm text-red-800 mb-1'>{finishError}</p>
        )}
        <div className='flex justify-between items-center w-full'>
          <h3 className='text-lg font-semibold'>{activeRide.destination || 'Destination'}</h3>
          <button
            onClick={finishRide}
            disabled={isFinishing}
            className={`text-white p-2 rounded w-1/2 ${isFinishing ? 'bg-green-500' : 'bg-green-700'}`}
          >
            {isFinishing ? 'Finishing...' : 'Finish Ride'}
          </button>
        </div>
      </div>

      <div ref={rideCompleteRef} className='fixed z-10 bottom-0 w-full translate-y-full bg-white p-5 h-screen'>
        <RideComplete setrideCompletePanel = {setrideCompletePanel} />
      </div>

    </div>
  )
}

export default CaptainRiding