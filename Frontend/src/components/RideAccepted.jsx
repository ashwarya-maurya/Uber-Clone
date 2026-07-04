import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RideDataContext } from '../context/RideContext'
import api from '../services/api'

const RideAccepted = (props) => {

    const { ride, setActiveRide } = useContext(RideDataContext)
    const navigate = useNavigate()

    const [isConfirming, setIsConfirming] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const activeRide = ride.activeRide

    const confirmAccept = async () => {
        setErrorMessage('')

        if (!activeRide.rideId) {
            setErrorMessage('No ride to confirm.')
            return
        }

        setIsConfirming(true)

        try {
            const response = await api.post('/rides/accept', {
                rideId: activeRide.rideId
            })

            setActiveRide(response.data)

            navigate('/confirm_ride')
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Could not confirm this ride. It may have already been accepted by another captain.')
        } finally {
            setIsConfirming(false)
        }
    }

  return (
    <div>
        <h4 className='text-2xl font-bold mb-5'>Ride Accepted!</h4>

        <div className='flex flex-col justify-center items-center'>
            <div className='flex items-center justify-between w-full p-2 rounded-lg mb-2 border-3 border-yellow-500 '>
                <div className='flex gap-1 items-center'>
                    <img className='w-15 h-15 object-cover rounded-full' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6SccWXtO5el1MJFP_JcVKd1z-FKqBEZm6NQ&s" alt="User"/>
                    <p className='text-xl font-semibold'>New Rider</p>
                </div>
                <p className='text-xl font-semibold'>
                  {activeRide.distance !== null ? `${(activeRide.distance / 1000).toFixed(1)} Km` : '—'}
                </p>
            </div>

            <div className='w-full'>

                <div className='flex items-center gap-5 border-b mb-3 p-2 border-gray-400'>
                    <div><i className='text-xl ri-map-pin-4-fill'></i></div>
                    <div>
                        <h2 className='text-lg font-semibold'>Pickup</h2>
                        <p className='text-sm -mt-1 text-gray-600'>{activeRide.pickup || 'Not available'}</p>
                    </div>
                </div>

                <div className='flex items-center gap-5 border-b mb-3 p-2 border-gray-400'>
                    <div><i className='text-xl ri-square-fill'></i></div>
                    <div>
                        <h2 className='text-lg font-semibold'>Destination</h2>
                        <p className='text-sm -mt-1 text-gray-600'>{activeRide.destination || 'Not available'}</p>
                    </div>
                </div>

                <div className='flex items-center gap-5 mb-5 p-2'>
                    <div><i className='text-xl ri-cash-fill'></i></div>
                    <div>
                        <h2 className='text-lg font-semibold'>
                          {activeRide.fare !== null ? `₹${activeRide.fare}` : '—'}
                        </h2>
                        <p className='text-sm -mt-1 text-gray-600'>Payment Mode : Cash</p>
                    </div>
                </div>

            </div>

            <div className='w-full'>

                <div className='flex gap-2'>
                <button
                onClick={confirmAccept}
                disabled={isConfirming}
                className={`text-center w-1/2 text-white p-2 rounded ${isConfirming ? 'bg-green-400' : 'bg-green-700'}`}
                >
                  {isConfirming ? 'Confirming...' : 'Confirm'}
                </button>

                <button onClick={()=>{
                    props.setrideAccepted(false)
                }} 
                className='w-1/2 bg-red-700 text-white p-2 rounded'>Cancel</button>
                </div>
 
            </div>

        </div>
    </div>
  )
}

export default RideAccepted