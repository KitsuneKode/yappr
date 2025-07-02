'use client'
import dynamic from 'next/dynamic'
import { cn } from '@yappr/ui/lib/utils'
import { usePeer } from '@/contexts/peer-context'
import { Button } from '@yappr/ui/components/button'
import { useSocket } from '@/contexts/socket-context'
import { useParams, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CallAcceptedData,
  IceCandidateData,
  IncomingCallData,
  UserData,
} from '@/utils/types'

interface Props {
  params: Promise<{ roomId: string }>
}

const VideoCallGrid = dynamic(() => import('@/components/video-call-grid'), {
  ssr: false,
})

export default function ChatPage() {
  const { roomId } = useParams()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const { socket: webSocket } = useSocket()
  const {
    peer,
    remoteStream,
    remoteEmail,
    createOffer,
    createAnswer,
    setAnswer,
    sendStream,
    updateRemoteEmail,
  } = usePeer()

  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCallInProgress, setIsCallInProgress] = useState(false)

  const getMediaStream = useCallback(async () => {
    const mystream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    })

    return mystream
  }, [])

  const handleUserJoined = useCallback(
    (data: UserData) => {
      console.log('User joined:', data)
      updateRemoteEmail(data.email)
    },
    [updateRemoteEmail],
  )
  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream
    }
  }, [stream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  const handleCallUser = useCallback(async () => {
    if (!remoteEmail || !webSocket) {
      alert(
        'You are alone in the room or not connected. Please wait for someone to join.',
      )
      return
    }

    if (isCallInProgress) {
      console.log('Call already in progress')
      return
    }

    try {
      setIsCallInProgress(true)

      // Get media stream FIRST
      const myStream = await getMediaStream()
      setStream(myStream)

      // Add tracks to peer connection BEFORE creating offer
      sendStream(myStream)

      // Small delay to ensure tracks are added
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Create and send offer
      const offer = await createOffer()
      webSocket.emit('call-user', { email: remoteEmail, offer })
    } catch (error) {
      console.error('Failed to initiate call:', error)
      alert('Failed to start video call. Please try again.')
      setIsCallInProgress(false)
    }
  }, [
    createOffer,
    remoteEmail,
    webSocket,
    sendStream,
    getMediaStream,
    isCallInProgress,
  ])

  const handleIncomingCall = useCallback(
    async (data: IncomingCallData) => {
      try {
        console.log('Incoming call from', data.fromEmail, data.offer)

        // Update remote email first
        updateRemoteEmail(data.fromEmail)

        // Get media stream
        const myStream = await getMediaStream()
        setStream(myStream)

        // Add tracks before creating answer
        sendStream(myStream)

        // Small delay to ensure tracks are added
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Create answer
        const answer = await createAnswer(data.offer)
        console.log('Answer', answer)

        // Send answer
        webSocket.emit('call-accepted', { email: data.fromEmail, answer })
        setIsCallInProgress(true)
      } catch (error) {
        console.error('Failed to handle incoming call:', error)
        alert('Failed to accept call. Please try again.')
      }
    },
    [createAnswer, webSocket, updateRemoteEmail, sendStream, getMediaStream],
  )

  const handleCallAccepted = useCallback(
    async (data: CallAcceptedData) => {
      const { email, answer } = data
      console.log('Call accepted by', email, answer)

      try {
        await setAnswer(answer)
        updateRemoteEmail(email)
        setIsCallInProgress(true)

        // Stream should already be sent when we created the offer
        console.log('Call established successfully')
      } catch (error) {
        console.error('Failed to complete call setup:', error)
        setIsCallInProgress(false)
      }
    },
    [setAnswer, updateRemoteEmail],
  )

  // const handleNegotiationNeeded = useCallback(
  //   async (data: { email: string; offer: RTCSessionDescriptionInit }) => {
  //     console.log('Negotiation needed from', data.email, data.offer)
  //     try {
  //       const answer = await createAnswer(data.offer)
  //       console.log('Negotiation answer', answer)

  //       webSocket.emit('negotiation-needed:answer', {
  //         email: data.email,
  //         answer,
  //       })
  //     } catch (error) {
  //       console.error('Failed to handle negotiation:', error)
  //     }
  //   },
  //   [createAnswer, webSocket],
  // )

  // const handleNegotiationNeededAnswer = useCallback(
  //   async (data: { email: string; answer: RTCSessionDescriptionInit }) => {
  //     console.log('Negotiation needed answer from', data.email, data.answer)
  //     try {
  //       await setAnswer(data.answer)
  //     } catch (error) {
  //       console.error('Failed to handle negotiation answer:', error)
  //     }
  //   },
  //   [setAnswer],
  // )

  const handleIceCandidate = useCallback(
    (data: IceCandidateData) => {
      console.log('New ICE candidate:', data.iceCandidate)

      if (data.iceCandidate && peer) {
        peer.addIceCandidate(data.iceCandidate).catch((error) => {
          console.log('Failed to add ICE candidate:', error)
        })
      }
    },
    [peer],
  )

  // Connection state monitoring
  useEffect(() => {
    const handleConnectionStateChange = () => {
      console.log('Connection state:', peer.connectionState)
      console.log('ICE connection state:', peer.iceConnectionState)

      if (
        peer.connectionState === 'failed' ||
        peer.iceConnectionState === 'failed'
      ) {
        console.error('Connection failed')
        setIsCallInProgress(false)
      }
    }

    peer.addEventListener('connectionstatechange', handleConnectionStateChange)
    peer.addEventListener(
      'iceconnectionstatechange',
      handleConnectionStateChange,
    )

    return () => {
      peer.removeEventListener(
        'connectionstatechange',
        handleConnectionStateChange,
      )
      peer.removeEventListener(
        'iceconnectionstatechange',
        handleConnectionStateChange,
      )
    }
  }, [peer])

  useEffect(() => {
    if (!webSocket) return

    webSocket.on('user-joined', handleUserJoined)
    webSocket.on('incoming-call', handleIncomingCall)
    webSocket.on('call-accepted', handleCallAccepted)
    webSocket.on('ice-candidate', handleIceCandidate)

    return () => {
      webSocket.off('user-joined', handleUserJoined)
      webSocket.off('incoming-call', handleIncomingCall)
      webSocket.off('call-accepted', handleCallAccepted)
      webSocket.off('ice-candidate', handleIceCandidate)
    }
  }, [
    webSocket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleIceCandidate,
  ])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => {
        track.stop()
      })
    }
  }, [stream])

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Chat Room: {roomId}</h1>
        <p>Email: {email}</p>
        {!remoteEmail ? (
          <p className="text-gray-500">You are alone in this room</p>
        ) : (
          <p className="text-green-600">Connected to {remoteEmail}</p>
        )}
        {isCallInProgress && (
          <p className="font-semibold text-blue-600">Call in progress...</p>
        )}
      </div>

      <Button
        className={cn(!remoteEmail && 'hidden')}
        onClick={handleCallUser}
        disabled={isCallInProgress}
      >
        {isCallInProgress ? 'Calling...' : 'Start Video Call'}
      </Button>

      <div className="flex flex-row space-x-8">
        {/* Local Stream */}
        <div className="flex flex-col items-center">
          <h3 className="mb-2 text-lg font-semibold">You</h3>
          {/* {stream ? ( 
            <ReactPlayer playing muted height="200" width="300" url={stream} />
          ) : (
            <div className="flex h-[200px] w-[300px] items-center justify-center bg-gray-200">
              <p>No video</p>
            </div>
          )} */}
        </div>

        {/* Remote Stream */}
        <div className="flex flex-col items-center">
          <h3 className="mb-2 text-lg font-semibold">
            Remote {remoteEmail ? `(${remoteEmail})` : ''}
          </h3>
        </div>
      </div>

      {/* Debug Info */}
      <div className="max-w-md text-xs text-gray-500">
        <p>Connection State: {peer.connectionState}</p>
        <p>ICE State: {peer.iceConnectionState}</p>
        <p>Remote Stream Tracks: {remoteStream?.getTracks().length || 0}</p>
      </div>
      {remoteEmail && (
        <VideoCallGrid
          participants={[
            { id: email, videoRef: localVideoRef, isSelf: true },
            {
              id: remoteEmail,
              videoRef: remoteVideoRef,
              isSelf: false,
            },
          ]}
        />
      )}
    </div>
  )
}
