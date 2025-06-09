'use client'
import { motion } from 'framer-motion'
import { cn } from '@repo/ui/lib/utils'
import { useEffect, useRef, useState } from 'react'
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

const TILE_HEIGHT = 130 // includes margin
export const VideoTile = ({
  user,
  isEnlarged,
  onEnlarge,
  windowHeight,
  windowWidth,
  onShrink,
  index,
}: Props) => {
  const [hover, setHover] = useState(false)
  const motionDivRef = useRef<HTMLDivElement | null>(null)
  const boundaryMap = {
    top: 70,
    left: 70,
    right: windowWidth - 24,
    bottom: windowHeight - 24,
  }
  const [position, setPosition] = useState<{
    pos: { x: number; y: number }
    boundDisrespected: string[]
  } | null>(null)
  useEffect(() => {
    console.log(position)
  }, [position])

  useEffect(() => {
    console.log(windowHeight, windowWidth)
  }, [])
  return (
    <motion.div
      ref={motionDivRef}
      drag
      dragMomentum={false}
      dragElastic={0.2}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{
        opacity: 1,
        y: 0,
        ...(position &&
          position.boundDisrespected.length > 0 && {
            x: position.boundDisrespected.includes('left')
              ? boundaryMap.left - windowWidth + 140 // Move to left boundary
              : position.boundDisrespected.includes('right')
                ? boundaryMap.right - windowWidth + 20 // Move to right boundary
                : undefined,
            y: position.boundDisrespected.includes('top')
              ? boundaryMap.top - windowHeight + (1.6 * TILE_HEIGHT + 100) // Move to top boundary
              : position.boundDisrespected.includes('bottom')
                ? boundaryMap.bottom - (windowHeight - (TILE_HEIGHT + 110)) // Move to bottom boundary
                : 0,
          }),
      }}
      transition={{ duration: 0.3 }}
      style={{ bottom: `${index * TILE_HEIGHT + 110}px`, right: '24px' }}
      className={cn(
        'fixed cursor-move rounded-xl bg-black p-1 text-white shadow-md',
        isEnlarged ? 'z-50 h-[400px] w-[600px]' : 'z-40 h-[120px] w-[160px]',
      )}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      onDragEnd={(_, info) => {
        if (
          info.point.x < boundaryMap.left ||
          info.point.x > boundaryMap.right ||
          info.point.y < boundaryMap.top ||
          info.point.y > boundaryMap.bottom
        ) {
          console.log(info.point.x, info.point.y)
          const boundDisrespected = []
          if (info.point.x < boundaryMap.left) {
            boundDisrespected.push('left')
          } else if (info.point.x > boundaryMap.right) {
            boundDisrespected.push('right')
          }
          if (info.point.y < boundaryMap.top) {
            boundDisrespected.push('top')
          } else if (info.point.y > boundaryMap.bottom) {
            boundDisrespected.push('bottom')
          }
          console.log(boundDisrespected)
          setPosition({ pos: info.point, boundDisrespected })
          return
        }
        setPosition(null)
      }}
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
        {hover &&
          position === null &&
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
