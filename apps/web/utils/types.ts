export interface ServerToClientEvents {
  'user-joined': (data: UserData) => void
  'incoming-call': (data: IncomingCallData) => void
  'ice-candidate': (data: IceCandidateData) => void
  'call-accepted': (data: CallAcceptedData) => void
  'join-room': (data: JoinRoomData) => void
  noArg: () => void
  basicEmit: (a: number, b: string, c: Buffer) => void
  withAck: (d: string, callback: (e: number) => void) => void
}

export interface ClientToServerEvents {
  hello: () => void
  'ice-candidate': (data: IceCandidateData) => void
  'join-room': (data: JoinRoomData) => void
  'call-accepted': (data: CallAcceptedData) => void
  'call-user': (data: CallUserData) => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface IceCandidateData {
  iceCandidate: RTCIceCandidateInit
  email: string
}
export interface SocketData {
  name: string
  age: number
}
export interface JoinRoomData {
  email: string
  roomId: string
}
export interface IncomingCallData {
  fromEmail: string
  offer: RTCSessionDescriptionInit
}

export interface CallUserData {
  email: string
  offer: RTCSessionDescriptionInit
}

export interface CallAcceptedData {
  email: string
  answer: RTCSessionDescriptionInit
}
export interface UserData {
  email: string
  socketId: string
}
