'use client'
import { motion } from 'framer-motion'
import { cn } from '@yappr/ui/lib/utils'
import { Maximize2, Minimize2 } from 'lucide-react'

type Props = {
  user: {
    id: string
    videoRef: React.RefObject<HTMLVideoElement | null> | null
    isSelf: boolean
  }
  windowHeight: number
  windowWidth: number
  isEnlarged: boolean
  onEnlarge: () => void
  onShrink: () => void
  index: number
}

const BASE_HEIGHT = 120
const BASE_WIDTH = 160
const TILE_MARGIN = 10
const TOP_OFFSET = 110
const SIDE_MARGIN = 24

export const VideoTile = ({
  user,
  isEnlarged,
  onEnlarge,
  windowHeight,
  windowWidth,
  onShrink,
  index,
}: Props) => {
  const height = isEnlarged ? 400 : BASE_HEIGHT
  const width = isEnlarged ? 600 : BASE_WIDTH

  //tile's initial position
  //    - y0: distance from top
  //    - x0: distance from left
  const y0 = index * (BASE_HEIGHT + TILE_MARGIN) + TOP_OFFSET
  const x0 = windowWidth - SIDE_MARGIN - width

  // 3) Build viewport-based constraints relative to that origin
  const constraints = {
    left: -x0, // can't go further left than -x0
    top: -y0, // can't go above initial top
    right: windowWidth - x0 - width, // max positive x-offset
    bottom: windowHeight - y0 - height, // max positive y-offset
  }

  return (
    <motion.div
      drag
      dragConstraints={constraints} // 🚩 apply viewport bounds
      dragElastic={0.2} // 🚩 allow 20% overshoot
      dragTransition={{
        // 🚩 snap‑back bounce settings
        bounceStiffness: 300,
        bounceDamping: 30,
      }}
      dragMomentum={false}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        top: `${y0}px`, // anchor at y0
        left: `${x0}px`, // anchor at x0
        width: `${width}px`,
        height: `${height}px`,
      }}
      className={cn(
        'cursor-move rounded-2xl bg-black p-1 text-white shadow-md',
        isEnlarged ? 'z-50' : 'z-40',
      )}
    >
      hi
      <video
        autoPlay
        playsInline
        muted={user.isSelf}
        ref={user.videoRef}
        className="h-full w-full rounded-lg object-cover"
      />
      <div className="absolute right-1 top-1 z-10">
        {isEnlarged ? (
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
        )}
      </div>
    </motion.div>
  )
}
