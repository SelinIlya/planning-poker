import { io, Socket } from 'socket.io-client'
import type { RoomState, VoteValue } from '@/types'

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001'

let socket: Socket | null = null

export function getSocket() {
  if (!socket) {
    socket = io(SERVER_URL, { autoConnect: false })
  }
  return socket
}

export function connectSocket() {
  const s = getSocket()
  if (!s.connected) s.connect()
  return s
}

export type ServerToClientEvents = {
  state: (state: RoomState | null) => void
}

export type ClientToServer = {
  create_room: (payload: { name: string; category: string }, cb: (res: { roomId: string; state: RoomState }) => void) => void
  join_room: (payload: { roomId: string; name: string; category: string }, cb: (res: { ok: boolean; error?: string; state?: RoomState | null }) => void) => void
  set_task: (payload: { roomId: string; task: string }) => void
  vote: (payload: { roomId: string; value: VoteValue }) => void
  reveal: (payload: { roomId: string }) => void
  new_round: (payload: { roomId: string }) => void
  reset_results: (payload: { roomId: string }) => void
  update_participant: (payload: { roomId: string; targetId: string; name?: string; category?: string }) => void
  set_host: (payload: { roomId: string; targetId: string }) => void
}


