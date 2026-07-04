import React, { useContext, useEffect, useRef, useState } from 'react'
import LiveMap from '../components/LiveMap'
import { Link } from 'react-router-dom'
import CaptainDetails from '../components/CaptainDetails'
import RidePopUp from '../components/RidePopUp'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import RideAccepted from '../components/RideAccepted'
import { SocketDataContext } from '../context/SocketContext'
import { CaptainDataContext } from '../context/CaptainContext'
import { RideDataContext } from '../context/RideContext'

const CaptainHome = () => {

  const { captain } = useContext(CaptainDataContext)

  const [ridePopUpPanel, setridePopUpPanel] = useState(false)
  const ridePopUpRef = useRef(null)

  const [captainLocation, setCaptainLocation] = useState(null)

  const [rideAccepted, setrideAccepted] = useState(false)
  const rideAcceptedRef = useRef(null)

  const { getSocket } = useContext(SocketDataContext)
  const { setActiveRide } = useContext(RideDataContext)

  const LOCATION_EMIT_INTERVAL_MS = 4000

const latestPositionRef = useRef(null)
const watchIdRef = useRef(null)
const emitIntervalRef = useRef(null)

useEffect(() => {
  if (!navigator.geolocation) {
    return
  }

  watchIdRef.current = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords

      const location = {
      lat: latitude,
      lng: longitude
    }

    latestPositionRef.current = location
    setCaptainLocation(location)
    },
    () => {

    },
    { enableHighAccuracy: true}
  )

  emitIntervalRef.current = setInterval(() => {
    const socket = getSocket()
    const latest = latestPositionRef.current

    if (socket && latest && captain?._id) {
      socket.emit('update-location-captain', {
        captainId: captain._id,
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
}, [getSocket, captain?._id])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) {
      return
    }

    const handleNewRide = (data) => {
      setActiveRide(data.ride)
      setridePopUpPanel(true)
    }

    socket.on('new-ride', handleNewRide)

    return () => {
      socket.off('new-ride', handleNewRide)
    }
  }, [getSocket, setActiveRide])

  useGSAP(()=>{
    if(ridePopUpPanel){
      gsap.to(ridePopUpRef.current,{
        translateY: '0%'
      })
    }else{
      gsap.to(ridePopUpRef.current,{
        translateY : '100%'
      })
    }
  },[ridePopUpPanel])

  useGSAP(()=>{
    if(rideAccepted){
      gsap.to(rideAcceptedRef.current,{
        translateY: '0%'
      })
    }else{
      gsap.to(rideAcceptedRef.current,{
        translateY : '100%'
      })
    }
  },[rideAccepted])

  return (
    <div className='h-screen'>

        <Link to='/captain_logout' className='fixed right-0 z-10 flex justify-center items-center rounded-full px-2 py-1 bg-white m-2'>
            <i className='text-2xl ri-logout-box-r-line'></i>
        </Link>

        <div className='h-2/3'>
          <LiveMap
            center={
                captainLocation
                ? [captainLocation.lat, captainLocation.lng]
                : undefined
            }
            captainLocation={captainLocation}
          />
      </div>

      <div className='h-1/3 p-4'>
        <CaptainDetails/>
      </div>

      <div ref={ridePopUpRef} className='fixed z-10 bottom-0 w-full translate-y-full bg-white px-4 py-6 rounded-t-2xl'>
        <RidePopUp setridePopUpPanel = {setridePopUpPanel} setrideAccepted = {setrideAccepted} />
      </div>

      <div ref={rideAcceptedRef} className='fixed z-10 bottom-0 w-full translate-y-full bg-white p-5 h-screen'>
        <RideAccepted setrideAccepted = {setrideAccepted} />
      </div>

    </div>
  )
}

export default CaptainHome