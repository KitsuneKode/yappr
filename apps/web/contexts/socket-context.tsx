import { io, type Socket } from 'socket.io-client'
import { createContext, useContext, useEffect, useMemo } from 'react'
import { ClientToServerEvents, ServerToClientEvents } from '@/utils/types'

type SocketContextType = {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>
}
const WebSocketContext = createContext<SocketContextType | null>(null)

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const socket: SocketContextType['socket'] = useMemo(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_SERVER_URL
    return io(wsUrl)
  }, [])

  // const webSocketRef = useRef<WebSocket | null>(null)
  // useEffect(() => {
  //   const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_SERVER_URL!)
  //
  //   console.log(process.env.NEXT_PUBLIC_WS_SERVER_URL)
  //   webSocketRef.current = socket
  // socket.onopen = () => {
  //   webSocketRef.current = socket
  // }
  //
  // socket.onclose = () => {
  //   console.log('WebSocket disconnected')
  // }
  //
  // socket.onerror = (err) => {
  //   console.error('WebSocket error', err)
  // }
  //
  //   return () => {
  //     socket.close()
  //   }
  // }, [])
  //
  useEffect(() => {
    return () => {
      socket.close()
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ socket }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export const useSocket = () => {
  const socket = useContext(WebSocketContext)
  if (!socket) {
    throw new Error('WebSocketContext must be used within a WebSocketProvider')
  }
  return socket
}
