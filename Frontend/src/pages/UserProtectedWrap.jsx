import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserDataContext } from '../context/UserContext'
import { SocketDataContext } from '../context/SocketContext'
import api from '../services/api'

const UserProtectedWrap = ({ children }) => {

  const token = localStorage.getItem('token')
  const navigate = useNavigate()
  const { user, setuser } = useContext(UserDataContext)
  const { connectSocket, emitJoin } = useContext(SocketDataContext)
  const [isLoading, setisLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    api.get('/users/profile')
      .then((response) => {
        if (response.status === 200) {
          const data = response.data
          setuser(data)
          setisLoading(false)

          connectSocket()
          emitJoin(data._id, 'user')
        }
      })
      .catch(() => {
        setisLoading(false)
        localStorage.removeItem('token')
        navigate('/login')
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

export default UserProtectedWrap