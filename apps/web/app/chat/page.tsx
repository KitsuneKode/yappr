'use client'
import { cn } from '@repo/ui/lib/utils'
import React, { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Video, VideoOff, Eye, EyeOff } from 'lucide-react'

interface Participant {
  id: string
  name: string
  stream?: MediaStream
  videoEnabled: boolean
  audioEnabled: boolean
  avatarUrl?: string
  isSelf?: boolean
}

interface FullVideoRoomPageProps {
  participants: Participant[]
}

const VideoTile = React.memo(
  ({
    user,
    visible,
    toggleVisibility,
  }: {
    user: Participant
    visible: boolean
    toggleVisibility: (id: string) => void
  }) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    useEffect(() => {
      if (videoRef.current && user.stream) {
        videoRef.current.srcObject = user.stream
      }
    }, [user.stream])

    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-gray-600 bg-black',
          visible ? 'block' : 'hidden',
        )}
      >
        {user.videoEnabled && user.stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={user.isSelf}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-800 text-white">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="text-lg font-semibold">{user.name[0]}</div>
            )}
          </div>
        )}
        <div className="absolute bottom-0 flex w-full items-center justify-between bg-black bg-opacity-40 px-2 py-1 text-xs text-white">
          <span className="max-w-[120px] truncate">{user.name}</span>
          <div className="flex gap-1">
            {user.audioEnabled ? (
              <Mic size={14} className="text-green-400" />
            ) : (
              <MicOff size={14} className="text-red-400" />
            )}
            {user.videoEnabled ? (
              <Video size={14} className="text-green-400" />
            ) : (
              <VideoOff size={14} className="text-red-400" />
            )}
          </div>
        </div>
        <button
          onClick={() => toggleVisibility(user.id)}
          className="absolute right-1 top-1 z-10 rounded-full bg-white p-1 text-black"
        >
          {visible ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    )
  },
)

const FullVideoRoomPage: React.FC<FullVideoRoomPageProps> = ({
  participants,
}) => {
  const [visibleIds, setVisibleIds] = useState<string[]>([])

  useEffect(() => {
    setVisibleIds(participants.slice(0, 9).map((u) => u.id))
  }, [participants])

  const toggleVisibility = (id: string) => {
    setVisibleIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    )
  }

  return (
    <div className="grid h-screen w-full grid-cols-[1fr_250px] gap-4 bg-gray-900 p-4 text-white">
      {/* Video Grid */}
      <div className="grid grid-cols-2 gap-4 overflow-auto md:grid-cols-3 lg:grid-cols-4">
        {participants.map((user) => (
          <VideoTile
            key={user.id}
            user={user}
            visible={visibleIds.includes(user.id)}
            toggleVisibility={toggleVisibility}
          />
        ))}
      </div>
      {/* Sidebar with All Members */}
      <div className="space-y-3 overflow-y-auto rounded-xl bg-gray-800 p-4 shadow">
        <h2 className="mb-2 text-lg font-semibold">Participants</h2>
        {participants.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded bg-gray-700 p-2"
          >
            <div className="flex items-center gap-2">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-sm font-medium">
                  {user.name[0]}
                </div>
              )}
              <span className="truncate text-sm">{user.name}</span>
            </div>
            <button
              onClick={() => toggleVisibility(user.id)}
              className="text-sm text-blue-400 hover:underline"
            >
              {visibleIds.includes(user.id) ? 'Hide' : 'Show'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <FullVideoRoomPage
      participants={[
        {
          id: '1',
          name: 'Alice',
          videoEnabled: true,
          audioEnabled: true,
          isSelf: true,
        },
        { id: '2', name: 'Bob', videoEnabled: true, audioEnabled: true },
        { id: '3', name: 'Charlie', videoEnabled: true, audioEnabled: true },
        { id: '4', name: 'David', videoEnabled: true, audioEnabled: true },
        { id: '5', name: 'Eve', videoEnabled: true, audioEnabled: true },
        { id: '6', name: 'Frank', videoEnabled: true, audioEnabled: true },
        {
          id: '7',
          name: 'Grace',
          videoEnabled: true,
          audioEnabled: true,
          avatarUrl: 'https://example.com/avatar7.jpg',
        },
        { id: '8', name: 'Heidi', videoEnabled: true, audioEnabled: true },
        { id: '9', name: 'Ivan', videoEnabled: true, audioEnabled: true },
      ]}
    />
  )
}
