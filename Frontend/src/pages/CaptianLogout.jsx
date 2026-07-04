import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SocketDataContext } from '../context/SocketContext'
import api from '../services/api'

const CaptianLogout = () => {
  const navigate = useNavigate()
  const { disconnectSocket } = useContext(SocketDataContext)

  useEffect(() => {
    api.get('/captains/logout')
      .then((response) => {
        if (response.status === 200) {
          localStorage.removeItem('token')
          disconnectSocket()
          navigate('/captain_login')
        }
      })
      .catch(() => {
        localStorage.removeItem('token')
        disconnectSocket()
        navigate('/captain_login')
      })
  }, [])

  return <></>
}

export default CaptianLogout