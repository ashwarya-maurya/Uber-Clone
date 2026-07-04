import React, { useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RideDataContext } from '../context/RideContext'
import { SocketDataContext } from '../context/SocketContext'
import LiveMap from '../components/LiveMap'

const Riding = () => {

  const { ride, setCaptainLocation } = useContext(RideDataContext)
  const { getSocket } = useContext(SocketDataContext)
  const navigate = useNavigate()

  const activeRide = ride.activeRide
  const captain = activeRide.captain

  useEffect(() => {
    const socket = getSocket()
    if (!socket) {
      return
    }

    const handleRideEnded = () => {
      navigate('/user_payment')
    }

    socket.on('ride-ended', handleRideEnded)

    return () => {
      socket.off('ride-ended', handleRideEnded)
    }
  }, [getSocket, navigate])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) {
      return
    }

    const handleCaptainLocation = (data) => {
      setCaptainLocation(data.location)
    }

    socket.on('captain-location', handleCaptainLocation)

    return () => {
      socket.off('captain-location', handleCaptainLocation)
    }
  }, [getSocket, setCaptainLocation])

  return (
    <div className='h-screen'>

        <Link to='/home' className='fixed right-0 z-20 flex justify-center items-center rounded-full px-2 py-1 bg-white m-2'>
            <i className='text-2xl ri-home-5-line'></i>
        </Link>

        <div className='h-[62%]'>
            <LiveMap
            center={ride.pickup.lat ? [ride.pickup.lat, ride.pickup.lng] : null}
            pickup={ride.pickup.lat ? ride.pickup : null}
            destination={ride.destination.lat ? ride.destination : null}
            captainLocation={ride.activeRide.captainLocation?.lat ? ride.activeRide.captainLocation : null}
            />
        </div>

        <div className='h-[38%] p-2 overflow-auto'>
                <div className='flex items-center justify-between mb-1'>
                <img className='h-15' src="https://www.asaproadworthys.com.au/wp-content/uploads/2021/11/Select.jpeg" alt="Car" />
                <div className='text-right'>
                    <h2 className='text-lg font-medium'>
                      {captain ? `${captain.fullname?.firstname || ''} ${captain.fullname?.lastname || ''}`.trim() : 'Driver'}
                    </h2>
                    <h4 className='text-xl font-semibold -mt-1 -mb-1'>{captain?.vehicle?.plate || 'Plate pending'}</h4>
                    <p className='text-sm text-gray-600'>{captain?.vehicle?.color ? `${captain.vehicle.color} ${captain.vehicle.vehicleType}` : 'Vehicle pending'}</p>
                </div>
            </div>

            <div className='w-full'>

                <div className='flex items-center gap-5 border-b mb-1 p-2 border-gray-400'>
                    <div><i className='text-xl ri-square-fill'></i></div>
                    <div>
                        <h2 className='text-lg font-semibold'>Destination</h2>
                        <p className='text-sm -mt-1 text-gray-600'>{activeRide.destination || ride.destination.address || 'Not available'}</p>
                    </div>
                </div>

                <div className='flex items-center gap-5 mb-1 p-2'>
                    <div><i className='text-xl ri-cash-fill'></i></div>
                    <div>
                        <h2 className='text-lg font-semibold'>
                          {activeRide.fare !== null ? `₹${activeRide.fare}` : '—'}
                        </h2>
                        <p className='text-sm -mt-1 text-gray-600'>Payment Mode : Cash</p>
                    </div>
                </div>

                <p className='text-xs text-gray-400 px-2 mb-1'>
                  Live driver tracking on the map isn't available yet — pickup and destination are shown as fixed points.
                </p>
 
            </div>

        </div>

    </div>
  )
}

export default Riding