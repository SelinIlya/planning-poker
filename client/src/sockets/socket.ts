import { io, Socket } from 'socket.io-client'
import type { RoomState, VoteValue } from '@/types'

// If VITE_SERVER_URL is not set, use same-origin (behind Nginx)
const RAW_URL = (import.meta as any)?.env?.VITE_SERVER_URL as string | undefined
const SERVER_URL = RAW_URL && RAW_URL.trim().length > 0 ? RAW_URL.trim() : undefined

let socket: Socket | null = null

export function getSocket() {
  if (!socket) {
    socket = io(SERVER_URL, {
      path: '/socket.io',   // путь проксирования через Nginx
      autoConnect: false,   // отключаем авто-подключение, подключаем вручную
      transports: ['websocket', 'polling'], // используем WebSocket с fallback на polling
    })
  }
  return socket
}

export function connectSocket() {
  const s = getSocket()
  if (!s.connected) s.connect()
  return s
}

// Типы событий от сервера к клиенту
export type ServerToClientEvents = {
  state: (state: RoomState | null) => void
}

// Типы событий от клиента к серверу
export type ClientToServer = {
  create_room: (
    payload: { name: string; category: string },
    cb: (res: { roomId: string; state: RoomState }) => void
  ) => void
  join_room: (
    payload: { roomId: string; name: string; category: string },
    cb: (res: { ok: boolean; error?: string; state?: RoomState | null }) => void
  ) => void
  set_task: (payload: { roomId: string; task: string }) => void
  vote: (payload: { roomId: string; value: VoteValue }) => void
  reveal: (payload: { roomId: string }) => void
  new_round: (payload: { roomId: string }) => void
  reset_results: (payload: { roomId: string }) => void
  update_participant: (
    payload: { roomId: string; targetId: string; name?: string; category?: string }
  ) => void
  set_host: (payload: { roomId: string; targetId: string }) => void
}


