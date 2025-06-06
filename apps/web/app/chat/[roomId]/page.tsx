'use client'

import ReactPlayer from 'react-player'
import { cn } from '@repo/ui/lib/utils'
import { Socket } from 'socket.io-client'
import { Button } from '@repo/ui/components/button'
import { useSocket } from '@/contexts/socket-context'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
interface Props {
  params: Promise<{ roomId: string }>
}

export default function ChatPage() {
  const { roomId } = useParams()
  const webSocket = useSocket()
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const handleUserJoined = useCallback(
    (data: { email: string; socketId: string }) => {
      console.log(data)
      console.log('User joined', data.email, data.socketId)
      setRemoteSocketId(data.socketId)
    },
    [],
  )

  const handleCallUser = useCallback(async () => {
    const myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    })

    setStream(myStream)
  }, [])

  useEffect(() => {
    webSocket.on('user-joined', handleUserJoined)
    return () => {
      webSocket.off('user-joined', handleUserJoined)
      stream?.getTracks().forEach((track) => {
        track.stop()
      })
    }
  }, [webSocket, handleUserJoined])

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      Chat Room: {roomId}
      {!remoteSocketId ? <p>You are alone in this room</p> : <p>Connected</p>}
      <Button
        className={cn(!remoteSocketId && 'hidden', 'block')}
        onClick={handleCallUser}
      >
        Call
      </Button>
      {stream && (
        <ReactPlayer playing muted height="100" width="100" url={stream} />
      )}
    </div>
  )
}
