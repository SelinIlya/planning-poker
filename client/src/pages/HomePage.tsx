import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { connectSocket, getSocket } from '@/sockets/socket'

export default function HomePage() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<'Front' | 'Back' | 'QA' | 'Mobile' | 'TMC' | 'Visitor' | ''>('')
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

  const onCreate = () => {
    if (!name.trim() || !category) return
    setCreating(true)
    const socket = connectSocket()
    socket.emit('create_room', { name, category }, ({ roomId }: { roomId: string }) => {
      try { localStorage.setItem(`pp_host_${roomId}`, '1') } catch {}
      navigate(`/room/${roomId}`, { state: { name, category } })
    })
  }

  const onJoin = () => {
    if (!name.trim() || !category) return
    const url = prompt('Вставьте ссылку на комнату или введите ID комнаты:')
    if (!url) return
    const roomId = extractRoomId(url)
    if (!roomId) return alert('Некорректная ссылка/ID')
    navigate(`/room/${roomId}`, { state: { name: name.trim(), category } })
  }

  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-semibold text-center">Planning Poker</h1>
        <input
          className="w-full px-4 py-3 rounded bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Ваше имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="w-full px-4 py-3 rounded bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
        >
          <option value="">Выберите категорию</option>
          <option value="Front">Front</option>
          <option value="Back">Back</option>
          <option value="QA">QA</option>
          <option value="Mobile">Mobile</option>
          <option value="TMC">TMC</option>
          <option value="Visitor">Visitor</option>
        </select>
        <div className="flex gap-3">
          <button
            className="flex-1 px-4 py-3 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
            onClick={onCreate}
            disabled={!name.trim() || !category || creating}
          >
            Создать комнату
          </button>
          <button
            className="flex-1 px-4 py-3 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-50"
            onClick={onJoin}
            disabled={!name.trim() || !category}
          >
            Присоединиться
          </button>
        </div>
      </div>
    </div>
  )
}

function extractRoomId(input: string) {
  try {
    const url = new URL(input)
    const parts = url.pathname.split('/')
    return parts[2] || null
  } catch {
    // maybe it's already an id
    return input.trim()
  }
}


