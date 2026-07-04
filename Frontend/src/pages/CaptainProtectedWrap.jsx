import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaptainDataContext } from '../context/CaptainContext'
import { SocketDataContext } from '../context/SocketContext'
import api from '../services/api'

const CaptainProtectedWrap = ({ children }) => {

  const token = localStorage.getItem('token')
  const navigate = useNavigate()
  const [isLoading, setisLoading] = useState(true)
  const { captain, setcaptain } = useContext(CaptainDataContext)
  const { connectSocket, emitJoin } = useContext(SocketDataContext)

  useEffect(() => {
    if (!token) {
      navigate('/captain_login')
      return
    }

    api.get('/captains/profile')
      .then((response) => {
        if (response.status === 200) {
          const data = response.data
          setcaptain(data)
          setisLoading(false)

          connectSocket()
          emitJoin(data._id, 'captain')
        }
      })
      .catch(() => {
        setisLoading(false)
        localStorage.removeItem('token')
        navigate('/captain_login')
      })

  }, [token])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    )
  }

  return (
    <>
      {children}
    </>
  )
}

export default CaptainProtectedWrap