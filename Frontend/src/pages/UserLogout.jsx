import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SocketDataContext } from '../context/SocketContext'
import api from '../services/api'

const UserLogout = () => {
  const navigate = useNavigate()
  const { disconnectSocket } = useContext(SocketDataContext)

  useEffect(() => {
    api.get('/users/logout')
      .then((response) => {
        if (response.status === 200) {
          localStorage.removeItem('token')
          disconnectSocket()
          navigate('/login')
        }
      })
      .catch(() => {
        localStorage.removeItem('token')
        disconnectSocket()
        navigate('/login')
      })
  }, [])

  return <></>
}

export default UserLogout