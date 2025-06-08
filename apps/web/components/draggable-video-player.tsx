'use client'
import { useState } from 'react'
import ReactPlayer from 'react-player'
import { motion } from 'framer-motion'
import { cn } from '@repo/ui/lib/utils'
import { Maximize2, Minimize2 } from 'lucide-react'

type Props = {
  user: {
    id: string
    videoRef: React.RefObject<HTMLVideoElement | null> | null
    isSelf: boolean
  }
  windowHeight: number | null
  windowWidth: number | null
  isEnlarged: boolean
  onEnlarge: () => void
  onShrink: () => void
  index: number
}

const TILE_HEIGHT = 130 // includes margin
export const VideoTile = ({
  user,
  isEnlarged,
  onEnlarge,
  onShrink,
  index,
}: Props) => {
  const [hover, setHover] = useState(false)

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.2}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ bottom: `${index * TILE_HEIGHT + 110}px`, right: '24px' }}
      className={cn(
        'fixed cursor-move rounded-xl bg-black p-1 text-white shadow-md',
        isEnlarged ? 'z-50 h-[400px] w-[600px]' : 'z-40 h-[120px] w-[160px]',
      )}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
    >
      <video
        autoPlay
        playsInline
        muted={user.isSelf}
        ref={user.videoRef}
        className="h-full w-full rounded-lg object-cover"
      />
      <div className="absolute right-1 top-1 z-10">
        {hover &&
          (isEnlarged ? (
            <button
              onClick={onShrink}
              className="rounded bg-white p-1 text-black"
            >
              <Minimize2 size={14} />
            </button>
          ) : (
            <button
              onClick={onEnlarge}
              className="rounded bg-white p-1 text-black"
            >
              <Maximize2 size={14} />
            </button>
          ))}
      </div>
    </motion.div>
  )
}
