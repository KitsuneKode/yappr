import { motion } from 'framer-motion'
import React, { useEffect, useRef } from 'react'
import { Mic, MicOff, Video, VideoOff } from 'lucide-react'

export interface Participant {
  id: string
  name: string
  isSelf?: boolean
  videoEnabled: boolean
  audioEnabled: boolean
  avatarUrl?: string
  stream?: MediaStream
}

interface GroupVideoGridProps {
  participants: Participant[]
  maxVisible?: number
}

const Tile = React.memo(({ user }: { user: Participant }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (videoRef.current && user.stream) {
      videoRef.current.srcObject = user.stream
    }
  }, [user.stream])

  return (
    <motion.div
      layout
      className="relative h-[150px] w-[200px] overflow-hidden rounded-xl border border-gray-700 bg-black shadow-lg"
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
    </motion.div>
  )
})

export const GroupVideoGrid: React.FC<GroupVideoGridProps> = ({
  participants,
  maxVisible = 9,
}) => {
  const visibleUsers = participants.slice(0, maxVisible)
  const hiddenCount = participants.length - maxVisible

  return (
    <div className="fixed right-6 top-6 z-50 flex flex-col gap-4">
      {visibleUsers.map((user) => (
        <Tile key={user.id} user={user} />
      ))}
      {hiddenCount > 0 && (
        <div className="flex h-[150px] w-[200px] items-center justify-center rounded-xl border border-gray-600 bg-gray-700 text-sm font-medium text-white">
          +{hiddenCount} others
        </div>
      )}
    </div>
  )
}
