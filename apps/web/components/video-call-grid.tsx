'use client'

import { createPortal } from 'react-dom'
import React, { useState, useEffect } from 'react'
import { VideoTile } from '@/components/draggable-video-player'

import useWindowSize from '@/hooks/useWindowSize'

const MAX_VISIBLE_VIDEOS = 4

type User = {
  id: string
  videoRef: React.RefObject<HTMLVideoElement | null> | null
  isSelf: boolean
}

type Props = {
  participants: User[]
}

const VideoCallGrid = ({ participants }: Props) => {
  const [enlargedUserId, setEnlargedUserId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const { width, height } = useWindowSize()

  const visibleUsers = participants.slice(0, MAX_VISIBLE_VIDEOS)
  const hiddenCount = participants.length - MAX_VISIBLE_VIDEOS

  const handleEnlarge = (id: string) => setEnlargedUserId(id)
  const handleShrink = () => setEnlargedUserId(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      {visibleUsers
        .sort((a, b) => (a.isSelf ? -1 : 1))
        .map((user, idx) =>
          createPortal(
            <VideoTile
              key={user.id}
              user={user}
              index={idx}
              windowHeight={height}
              windowWidth={width}
              isEnlarged={user.id === enlargedUserId}
              onEnlarge={() => handleEnlarge(user.id)}
              onShrink={handleShrink}
            />,
            document.body,
          ),
        )}
      {hiddenCount > 0 && (
        <div className="fixed bottom-4 right-6 z-50 flex h-[80px] w-[120px] items-center justify-center rounded-xl bg-black p-2 text-lg font-semibold text-white">
          <span>+{hiddenCount} others</span>
        </div>
      )}
    </>
  )
}

export default VideoCallGrid
