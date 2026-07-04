import React, { useState } from 'react'
import qrImage from '../assets/qrImage.png'
import { Link } from 'react-router-dom'
const CaptainPayment = () => {

  const [method, setMethod] = useState('cash')
  const [cashReceived, setCashReceived] = useState(false)
  const [upiPaid, setUpiPaid] = useState(false)

  const handleCash = () => {
    setCashReceived(true)
  }

  const handleUpi = () => {
    setUpiPaid(true)
  }

  return (
    <div className='min-h-screen w-full bg-white flex flex-col'>

      <div className='flex-1 p-6 flex flex-col justify-between'>

        <div className='mb-5'>
          <Link
          to="/captain_home"
          className='fixed right-5 top-7 inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-100'
          >
          <i className="ri-arrow-right-line text-xl"></i>
          </Link>

          <h2 className='text-2xl font-bold text-gray-900'>
            Payment Collection
          </h2>

          <p className='text-sm text-gray-500'>
            Choose payment type for this ride
          </p>

        </div>

        <div className='bg-gray-100 p-4 rounded-2xl mb-5 flex justify-between items-center'>

          <div>
            <h3 className='font-semibold text-gray-900'>
              Ride Completed
            </h3>

            <p className='text-sm text-gray-500 mt-1'>
              Dwarka → Connaught Place
            </p>
          </div>

          <div className='text-right'>
            <h3 className='text-2xl font-bold text-black'>
              ₹193
            </h3>
            <p className='text-xs text-gray-500'>
              Total Fare
            </p>
          </div>

        </div>

        <h3 className='font-semibold mb-3 text-gray-800'>
          Select Payment Mode
        </h3>

        <div className='flex flex-col gap-3 mb-5'>

          <div
            onClick={() => setMethod('cash')}
            className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center ${
              method === 'cash'
                ? 'border-black bg-gray-50'
                : 'border-gray-200'
            }`}
          >
            <div>
              <p className='font-medium'>Cash Payment</p>
              <p className='text-xs text-gray-500'>Collect from rider</p>
            </div>

            <i className='ri-money-rupee-circle-line text-xl'></i>
          </div>

          <div
            onClick={() => setMethod('upi')}
            className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center ${
              method === 'upi'
                ? 'border-black bg-gray-50'
                : 'border-gray-200'
            }`}
          >
            <div>
              <p className='font-medium'>UPI / QR</p>
              <p className='text-xs text-gray-500'>Digital payment</p>
            </div>

            <i className='ri-qr-code-line text-xl'></i>
          </div>

        </div>

        {method === 'cash' && (
          <div className='mb-5 p-4 border rounded-2xl'>

            <p className='font-medium mb-2'>
              Cash Collection Status
            </p>

            <span className={`text-xs px-3 py-1 rounded-full ${
              cashReceived
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {cashReceived ? 'Received' : 'Pending'}
            </span>

          </div>
        )}

        {method === 'upi' && (
            <div className='mb-5 p-4 border rounded-2xl text-center'>

              <p className='font-medium mb-3'>
                Scan QR to Pay
              </p>

            <div className='w-48 h-48 mx-auto mb-3'>
            <img
              src={qrImage}
              alt="UPI QR Code"
              className='w-full h-full object-contain rounded-xl border'
            />
            </div>

            <p className='text-xs text-gray-500 mb-3'>
              Ask the rider to scan and complete payment
            </p>

            <span
            className={`text-xs px-3 py-1 rounded-full ${
              upiPaid
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
             }`}
             >
            {upiPaid ? 'Paid' : 'Pending'}
            </span>

          </div>
        )}

        {method === 'cash' ? (
          <button
            onClick={handleCash}
            disabled={cashReceived}
            className={`w-full p-4 rounded-2xl font-semibold transition ${
              cashReceived
                ? 'bg-green-500 text-white cursor-not-allowed'
                : 'bg-green-700 text-white hover:bg-green-800'
            }`}
          >
            {cashReceived ? 'Cash Received' : 'Mark Cash Received'}
          </button>
        ) : (
          <button
            onClick={handleUpi}
            disabled={upiPaid}
            className={`w-full p-4 rounded-2xl font-semibold transition ${
              upiPaid
                ? 'bg-black text-white cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-900'
            }`}
          >
            {upiPaid ? 'Payment Done' : 'Mark UPI Payment Done'}
          </button>
        )}

        <p className='text-center text-xs text-gray-400 mt-4'>
          Captain can confirm either Cash or UPI payment
        </p>

      </div>
    </div>
  )
}

export default CaptainPayment