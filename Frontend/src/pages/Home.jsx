import React, { useContext, useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import 'remixicon/fonts/remixicon.css'
import LocationSearchPanel from '../components/LocationSearchPanel'
import VehiclePanel from '../components/VehiclePanel'
import ConfirmRide from '../components/ConfirmRide'
import LookingDriver from '../components/LookingDriver'
import WatingForDriver from '../components/WatingForDriver'
import LiveMap from '../components/LiveMap'
import { Link } from 'react-router-dom'
import { RideDataContext } from '../context/RideContext'
import { SocketDataContext } from '../context/SocketContext'
import useDebounce from '../hooks/useDebounce'
import api from '../services/api'

const Home = () => {

  const submitHandler = (e) => {
    e.preventDefault()
  }

  const { ride, setPickup, setDestination, setEstimate, clearEstimate, setSelectedVehicleType, setActiveRide } = useContext(RideDataContext)
  const { getSocket } = useContext(SocketDataContext)

  const [pickup, setPickupInput] = useState('')
  const [dropoff, setDropoffInput] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [vehiclePanelOpen, setvehiclePanelOpen] = useState(false)
  const [confirmRidePanelOpen, setconfirmRidePanelOpen] = useState(false)
  const [lookingVehicle, setlookingVehicle] = useState(false)
  const [watingForDriver, setwatingForDriver] = useState(false)

  const [activeField, setActiveField] = useState(null)

  const [mapCenter, setMapCenter] = useState(null)

  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const activeQuery = activeField === 'pickup' ? pickup : activeField === 'dropoff' ? dropoff : ''
  const debouncedQuery = useDebounce(activeQuery, 400)

  const panelRef = useRef(null)
  const findTrip = useRef(null)
  const panelClose = useRef(null)
  const vehiclePanle = useRef(null)
  const confirmRidePanle = useRef(null)
  const lookingVehicleRef = useRef(null)
  const watingForDriverRef = useRef(null)

  // -------------------------------------------------------------------
  // pickupEditedRef — true as soon as the user has touched the pickup
  // field themselves (typing or selecting a suggestion). A ref, not
  // state, because:
  //   1. Setting it should never trigger a re-render.
  //   2. It must be read synchronously inside the pending reverse-geocode
  //      request's .then()/.catch() below without a stale-closure risk —
  //      a ref always reflects the latest value, a captured state value
  //      from effect-creation time would not.
  // -------------------------------------------------------------------
  const pickupEditedRef = useRef(false)

  // -------------------------------------------------------------------
  // Geolocation — runs once on mount.
  //
  // UPDATED (race-condition guard): the reverse-geocode call
  // (GET /maps/get-address) is async and can resolve after the user has
  // already started typing or selected a pickup location themselves. This
  // effect now checks pickupEditedRef.current at TWO points:
  //   1. Before firing the request at all — skips entirely if the user
  //      already edited pickup in the (unlikely but possible) window
  //      between mount and the geolocation callback firing.
  //   2. Again inside .then()/.catch(), right before applying the result —
  //      this is the case that actually matters in practice, since the
  //      network round-trip gives the user a real window to type or pick
  //      a suggestion before this resolves.
  // If the user has edited pickup by either checkpoint, this effect does
  // nothing further — it does not touch the pickup input OR RideContext,
  // leaving whatever the user entered/selected fully intact.
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setMapCenter([latitude, longitude])

        if (pickupEditedRef.current) {
          return
        }

        api.get('/maps/get-address', { params: { lat: latitude, lng: longitude } })
          .then((response) => {
            if (pickupEditedRef.current) {
              return
            }
            const { address } = response.data
            setPickupInput(address)
            setPickup({ address, lat: latitude, lng: longitude })
          })
          .catch(() => {
            if (pickupEditedRef.current) {
              return
            }
            // Reverse geocoding failed — keep coordinates for map centering
            // only; address/input stay blank, same as prior behavior.
            setPickup({ address: '', lat: latitude, lng: longitude })
          })
      },
      () => {
        // Permission denied or unavailable — pickup field stays empty,
        // exactly as it already does today. No error UI for this phase.
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!activeField || !debouncedQuery || debouncedQuery.trim().length < 3) {
      setSuggestions([])
      return
    }

    let isCurrent = true
    setIsSearching(true)

    api.get('/maps/get-suggestions', { params: { input: debouncedQuery } })
      .then((response) => {
        if (isCurrent) {
          setSuggestions(response.data)
        }
      })
      .catch(() => {
        if (isCurrent) {
          setSuggestions([])
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsSearching(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [debouncedQuery, activeField])

  const onSelectLocation = async (place) => {
    const address = place.displayName

    if (activeField === 'pickup') {
      pickupEditedRef.current = true
      setPickupInput(address)
    } else if (activeField === 'dropoff') {
      setDropoffInput(address)
    }

    try {
      const response = await api.get('/maps/get-coordinates', { params: { address } })
      const coords = response.data

      if (activeField === 'pickup') {
        setPickup({ address, lat: coords.lat, lng: coords.lng })
      } else if (activeField === 'dropoff') {
        setDestination({ address, lat: coords.lat, lng: coords.lng })
      }
    } catch (error) {
      // Coordinate resolution failed — address text is still set above,
      // but RideContext coordinates won't update. Surfacing this to the
      // user with proper UI feedback belongs to a later hardening phase.
    }

    setSuggestions([])
  }

  useEffect(() => {
    const pickupAddress = ride.pickup.address
    const destinationAddress = ride.destination.address

    if (!pickupAddress || !destinationAddress) {
      clearEstimate()
      return
    }

    let isCurrent = true

    api.get('/rides/get-fare', {
      params: { pickup: pickupAddress, destination: destinationAddress }
    })
      .then((response) => {
        if (isCurrent) {
          setEstimate(response.data)
        }
      })
      .catch(() => {
        if (isCurrent) {
          clearEstimate()
        }
      })

    return () => {
      isCurrent = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ride.pickup.address, ride.destination.address])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) {
      return
    }

    const handleRideConfirmed = (rideData) => {
      setActiveRide(rideData)
      setlookingVehicle(false)
      setwatingForDriver(true)
    }

    socket.on('ride-confirmed', handleRideConfirmed)

    return () => {
      socket.off('ride-confirmed', handleRideConfirmed)
    }
  }, [getSocket, setActiveRide])

  useGSAP(() => {

    if (panelOpen) {
      gsap.to(panelRef.current, {
        height: '70vh',
        paddingRight: '15px',
        paddingLeft: '15px',
        paddingTop: '20px',
        paddingBottom: '20px'
      })

      gsap.to(findTrip.current, {
        borderRadius: '0px'
      })

      gsap.to(panelClose.current, {
        opacity: 1
      })

    } else {

      gsap.to(panelRef.current, {
        height: '0vh',
        paddingRight: '0px',
        paddingLeft: '0px',
        paddingTop: '0px',
        paddingBottom: '0px'
      })

      gsap.to(panelClose.current, {
        opacity: 0
      })

      gsap.to(findTrip.current, {
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px'
      })
    }

  }, [panelOpen])

  useGSAP(()=>{
    if(vehiclePanelOpen){
      gsap.to(vehiclePanle.current,{
        translateY: '0%'
      })
    }else{
      gsap.to(vehiclePanle.current,{
        translateY : '100%'
      })
    }
  },[vehiclePanelOpen])

  useGSAP(()=>{
    if(confirmRidePanelOpen){
      gsap.to(confirmRidePanle.current,{
        translateY: '0%'
      })
    }else{
      gsap.to(confirmRidePanle.current,{
        translateY : '100%'
      })
    }
  },[confirmRidePanelOpen])

    useGSAP(()=>{
    if(lookingVehicle){
      gsap.to(lookingVehicleRef.current,{
        translateY: '0%'
      })
    }else{
      gsap.to(lookingVehicleRef.current,{
        translateY : '100%'
      })
    }
  },[lookingVehicle])

    useGSAP(()=>{
    if(watingForDriver){
      gsap.to(watingForDriverRef.current,{
        translateY: '0%'
      })
    }else{
      gsap.to(watingForDriverRef.current,{
        translateY : '100%'
      })
    }
  },[watingForDriver])

  return (
    <div className='h-screen w-screen relative overflow-hidden'>

      <Link to='/logout' className='fixed z-10 right-3 top-3 flex justify-center items-center rounded-full px-2 py-1 bg-white'>
          <i className='text-2xl ri-logout-box-r-line'></i>
      </Link>

      <div className='h-[75%]'>
        <LiveMap
          center={mapCenter}
          pickup={ride.pickup.lat ? ride.pickup : null}
          destination={ride.destination.lat ? ride.destination : null}
        />
      </div>

      <div className='flex flex-col justify-end absolute w-full bottom-0'>

        <div ref={findTrip} className='h-[30vh] bg-white p-6 rounded-t-2xl relative'>
          <i ref={panelClose}
            onClick={() => setPanelOpen(false)}
            className="absolute right-[48%] top-0 opacity-0 text-3xl ri-arrow-down-wide-fill cursor-pointer"
          ></i>

          <h4 className='text-2xl font-semibold'>Find a trip</h4>

          <form
            onSubmit={(e)=>{
              submitHandler(e)
            }}
            className='flex flex-col'
          >

            <div className='bg-black h-12 w-0.75 rounded-full absolute left-10 top-23.75'></div>

            <input
              onFocus={() => {
                setPanelOpen(true)
                setActiveField('pickup')
              }}
              onChange={(e) => {
                pickupEditedRef.current = true
                setPickupInput(e.target.value)
              }}
              value={pickup}
              className='bg-[#EEEEEE] text-base px-12 py-2 mt-5 w-full rounded-lg outline-none focus:ring-2 focus:ring-black'
              type='text'
              placeholder='Add a pick-up location'
            />

            <input
              onFocus={() => {
                setPanelOpen(true)
                setActiveField('dropoff')
              }}
              onChange={(e) => setDropoffInput(e.target.value)}
              value={dropoff}
              className='bg-[#EEEEEE] text-base px-12 py-2 mt-3 w-full rounded-lg outline-none focus:ring-2 focus:ring-black'
              type='text'
              placeholder='Enter your destination'
            />

          </form>
        </div>

        <div ref={panelRef} className='h-0 bg-white overflow-auto'>
          <LocationSearchPanel
            suggestions={suggestions}
            isLoading={isSearching}
            onSelectLocation={onSelectLocation}
            setvehiclePanelOpen={setvehiclePanelOpen}
            setPanelOpen={setPanelOpen}
          />
        </div>

      </div>

    <div ref={vehiclePanle}  className='fixed z-10 bottom-0 translate-y-full w-full bg-white px-4 py-6 rounded-t-2xl'>
      <VehiclePanel
        estimate={ride.estimate}
        setSelectedVehicleType={setSelectedVehicleType}
        setconfirmRidePanelOpen={setconfirmRidePanelOpen}
        setvehiclePanelOpen={setvehiclePanelOpen}
      />
    </div>

    <div ref={confirmRidePanle}  className='fixed z-10 bottom-0 translate-y-full w-full bg-white px-4 py-6 rounded-t-2xl'>
      <ConfirmRide setconfirmRidePanelOpen={setconfirmRidePanelOpen} setvehiclePanelOpen={setvehiclePanelOpen} setlookingVehicle={setlookingVehicle} />
    </div>

    <div ref={lookingVehicleRef}  className='fixed z-10 bottom-0 translate-y-full w-full bg-white px-4 py-6 rounded-t-2xl'>
      <LookingDriver setlookingVehicle={setlookingVehicle}/>
    </div>
    
    <div ref={watingForDriverRef} className='fixed z-10 bottom-0 w-full translate-y-full bg-white px-4 py-6 rounded-t-2xl'>
      <WatingForDriver setwatingForDriver={setwatingForDriver}/>
    </div>

  </div>
  )
}

export default Home