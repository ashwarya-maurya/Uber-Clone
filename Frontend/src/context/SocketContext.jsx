import React, { createContext, useCallback, useRef, useState } from 'react'
import { io } from 'socket.io-client'

export const SocketDataContext = createContext()

const SocketContext = ({ children }) => {

  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)

  const connectSocket = useCallback(() => {
    if (socketRef.current) {
      return socketRef.current
    }

    const socket = io(import.meta.env.VITE_BASE_URL, {
      withCredentials: true,
      autoConnect: true
    })

    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socketRef.current = socket
    return socket
  }, [])

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [])

  const emitJoin = useCallback((userId, userType) => {
    const socket = socketRef.current
    if (socket && userId && userType) {
      socket.emit('join', { userId, userType })
    }
  }, [])

  const getSocket = useCallback(() => socketRef.current, [])

  return (
    <SocketDataContext.Provider value={{
      isConnected,
      connectSocket,
      disconnectSocket,
      emitJoin,
      getSocket
    }}>
      {children}
    </SocketDataContext.Provider>
  )
}


export default SocketContext