'use client'

import { useRouter } from 'next/navigation'
import { Input } from '@yappr/ui/components/input'
import { Label } from '@yappr/ui/components/label'
import Image, { type ImageProps } from 'next/image'
import { Button } from '@yappr/ui/components/button'
import { useSocket } from '@/contexts/socket-context'
import { useCallback, useEffect, useState } from 'react'

type Props = Omit<ImageProps, 'src'> & {
  srcLight: string
  srcDark: string
}

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props

  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  )
}

export default function Home() {
  const [roomId, setRoomId] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const { socket: webSocket } = useSocket()
  const router = useRouter()

  const handleJoinRoom = useCallback(
    (data: { email: string; roomId: string }) => {
      console.log('Join-room', data.email)

      router.push(`/chat/${data.roomId}?email=${data.email}`)
    },
    [router],
  )

  useEffect(() => {
    webSocket.on('join-room', handleJoinRoom)

    return () => {
      webSocket.off('join-room', handleJoinRoom)
    }
  }, [webSocket, handleJoinRoom])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'room-id' | 'email',
  ) => {
    e.preventDefault()

    if (type === 'room-id') {
      setRoomId(e.target.value)
    } else {
      setEmail(e.target.value)
    }
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      webSocket.emit('join-room', { email, roomId })
    },
    [email, roomId, webSocket],
  )

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
        <p>
          {email} {roomId}
        </p>
        <form onSubmit={handleSubmit}>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              e.preventDefault()

              handleChange(e, 'email')
            }}
          />
          <Label htmlFor="room-id">RoomId</Label>
          <Input
            id="room-id"
            value={roomId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              e.preventDefault()

              handleChange(e, 'room-id')
            }}
          />
          <Button size="sm" type="submit">
            Button
          </Button>
        </form>
        <div className="flex h-screen w-screen items-center justify-center gap-x-5">
          <p className="animate-bounce text-4xl delay-500 duration-500">::</p>
          <p className="animate-bounce text-4xl delay-100 duration-500">::</p>
          <p className="animate-bounce text-4xl delay-500 duration-500">::</p>
          <p className="animate-bounce text-4xl delay-100 duration-500">::</p>
          <p className="animate-bounce text-4xl delay-500 duration-500">::</p>
          <p className="animate-bounce text-4xl delay-100 duration-500">::</p>
          <p className="animate-bounce text-4xl delay-500 duration-500">::</p>
        </div>
      </div>
    </div>
  )
}
