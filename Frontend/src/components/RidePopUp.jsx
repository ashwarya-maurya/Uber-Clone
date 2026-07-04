import React, { useContext } from 'react'
import { RideDataContext } from '../context/RideContext'

const RidePopUp = (props) => {

  const { ride } = useContext(RideDataContext)
  const activeRide = ride.activeRide

  return (
    <div>
        <h5 onClick={()=>{
            props.setridePopUpPanel(false)
        }} className='text-center absolute top-0 w-[95%]' ><i className=" text-2xl text-gray-300 ri-arrow-down-wide-line"></i></h5>

        <h4 className='text-2xl font-bold mb-2'>New Ride Available!</h4>

        <div className='flex flex-col justify-center items-center'>
            <div className='flex items-center justify-between w-full p-2 rounded-lg mb-2 bg-yellow-500 '>
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

                <div className='flex items-center gap-5 mb-3 p-2'>
                    <div><i className='text-xl ri-cash-fill'></i></div>
                    <div>
                        <h2 className='text-lg font-semibold'>
                          {activeRide.fare !== null ? `₹${activeRide.fare}` : '—'}
                        </h2>
                        <p className='text-sm -mt-1 text-gray-600'>Payment Mode : Cash{activeRide.vehicleType ? ` · ${activeRide.vehicleType}` : ''}</p>
                    </div>
                </div>

            </div>

            <div className='flex w-full gap-2' >
            <button onClick={()=>{
                props.setrideAccepted(true)
            }} 
            className='w-1/2 bg-green-700 text-white p-2 rounded'>Accept</button>

            <button onClick={()=>{
                props.setridePopUpPanel(false)
            }} 
            className='w-1/2 bg-red-700 text-white p-2 rounded'>Ignore</button>
            </div>

        </div>
    </div>
  )
}

export default RidePopUp