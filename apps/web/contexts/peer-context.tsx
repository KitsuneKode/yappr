'use client'
import { useSocket } from '@/contexts/socket-context'
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react'

const PeerContext = createContext<{
  peer: RTCPeerConnection
  remoteStream: MediaStream | null
  remoteEmail: string | null
  createOffer: () => Promise<RTCSessionDescriptionInit>
  createAnswer: (
    offer: RTCSessionDescriptionInit,
  ) => Promise<RTCSessionDescriptionInit>
  setAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>
  sendStream: (stream: MediaStream) => void
  updateRemoteEmail: (email: string | null) => void
} | null>(null)

export const PeerProvider = ({ children }: { children: React.ReactNode }) => {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [remoteEmail, setRemoteEmail] = useState<string | null>(null)

  // Use ref to always have current value in event handlers
  const remoteEmailRef = useRef<string | null>(null)
  const addedTracks = useRef<RTCRtpSender[]>([])

  const { socket: webSocket } = useSocket()

  const updateRemoteEmail = useCallback(
    (newEmail: string | null) => {
      console.log('Updating remote email from:', remoteEmail, 'to:', newEmail)
      setRemoteEmail(newEmail)
      remoteEmailRef.current = newEmail // Keep ref in sync
    },
    [remoteEmail],
  )

  const peer = useMemo(
    () =>
      new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              'stun:stun.l.google.com:19302',
              'stun:stun1.l.google.com:19302',
              'stun:global.stun.twilio.com:3478',
              'stun:stun.stunprotocol.org:3478',
            ],
          },
          // {
          //   urls: 'turn:openrelay.metered.ca:80',
          //   credential: 'openrelayproject',
          //   username: 'openrelayproject',
          // },
        ],
      }),
    [],
  )

  const handleIceCandidate = useCallback(
    (event: RTCPeerConnectionIceEvent) => {
      console.log('New ICE candidate:', event.candidate)
      console.log('Peer connection state:', peer.connectionState)

      // Use ref to get current value
      const currentRemoteEmail = remoteEmailRef.current
      console.log('Current remote email:', currentRemoteEmail)

      if (event.candidate && currentRemoteEmail && webSocket) {
        try {
          webSocket.emit('ice-candidate', {
            email: currentRemoteEmail,
            iceCandidate: event.candidate,
          })
        } catch (error) {
          console.error('Failed to send ICE candidate:', error)
        }
      }
    },
    [peer, webSocket],
  )

  // const handleNegotiation = useCallback(async () => {
  //   console.log('Negotiation needed')
  //   const currentRemoteEmail = remoteEmailRef.current

  //   if (!currentRemoteEmail) {
  //     console.error('No remote email available for negotiation')
  //     return
  //   }

  //   if (!webSocket) {
  //     console.error('No websocket connection available')
  //     return
  //   }

  //   try {
  //     const offer = await createOffer()
  //     console.log('Negotiation needed, creating offer', offer)

  //     webSocket.emit('negotiation-needed', {
  //       email: currentRemoteEmail,
  //       offer,
  //     })
  //   } catch (error) {
  //     console.error('Failed to handle negotiation:', error)
  //   }
  // }, [webSocket]) // Remove peer and createOffer from deps to avoid circular dependency

  const createOffer = useCallback(async () => {
    const offer = await peer.createOffer()
    await peer.setLocalDescription(offer)
    return offer
  }, [peer])

  const createAnswer = useCallback(
    async (offer: RTCSessionDescriptionInit) => {
      await peer.setRemoteDescription(offer)
      const answer = await peer.createAnswer()
      await peer.setLocalDescription(answer)
      return answer
    },
    [peer],
  )

  const setAnswer = useCallback(
    async (answer: RTCSessionDescriptionInit) => {
      console.log('Setting remote description', answer)
      await peer.setRemoteDescription(answer)
    },
    [peer],
  )

  const sendStream = useCallback(
    async (stream: MediaStream) => {
      console.log('Sending stream:', stream.getTracks())

      // Remove previously added tracks
      addedTracks.current.forEach((sender) => {
        try {
          peer.removeTrack(sender)
        } catch (error) {
          console.warn('Failed to remove track:', error)
        }
      })
      addedTracks.current = []

      // Add new tracks
      stream.getTracks().forEach((track) => {
        const sender = peer.addTrack(track, stream)
        addedTracks.current.push(sender)
      })
    },
    [peer],
  )

  const handleTrackEvent = useCallback((event: RTCTrackEvent) => {
    console.log('Track event:', event)
    console.log('Streams:', event.streams)

    const remoteStream = event.streams[0] || null
    console.log('Remote stream received:', remoteStream)
    setRemoteStream(remoteStream)
  }, [])

  // Update ref whenever remoteEmail changes
  useEffect(() => {
    remoteEmailRef.current = remoteEmail
  }, [remoteEmail])

  useEffect(() => {
    peer.addEventListener('track', handleTrackEvent)
    peer.addEventListener('icecandidate', handleIceCandidate)

    return () => {
      peer.removeEventListener('track', handleTrackEvent)
      peer.removeEventListener('icecandidate', handleIceCandidate)
    }
  }, [peer, handleTrackEvent, handleIceCandidate])

  return (
    <PeerContext.Provider
      value={{
        peer,
        remoteEmail,
        createOffer,
        createAnswer,
        setAnswer,
        sendStream,
        remoteStream,
        updateRemoteEmail,
      }}
    >
      {children}
    </PeerContext.Provider>
  )
}

export const usePeer = () => {
  const context = useContext(PeerContext)
  if (!context) {
    throw new Error('usePeer must be used within a PeerProvider')
  }
  return context
}
