import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import ParticipantList from '@/components/ParticipantList'
import CardGrid from '@/components/CardGrid'
import Controls from '@/components/Controls'
import type { RoomState, VoteValue, Participant } from '@/types'
import { connectSocket, getSocket } from '@/sockets/socket'

export default function RoomPage() {
  const { roomId = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation() as any
  const initialName: string | undefined = location?.state?.name
  const initialCategory: string | undefined = location?.state?.category

  const [state, setState] = useState<RoomState | null>(null)
  const [name, setName] = useState(initialName ?? '')
  const [taskInput, setTaskInput] = useState('')
  const [selected, setSelected] = useState<VoteValue>(null)
  const [copied, setCopied] = useState(false)
  const [category, setCategory] = useState<string>(initialCategory ?? '')
  const [joined, setJoined] = useState<boolean>(!!(initialName && initialCategory))
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)

  const socket = useMemo(() => connectSocket(), [])

  // Name and category are collected via inline form when missing; no prompts

  useEffect(() => {
    const handleState = (s: RoomState | null) => setState(s)
    socket.on('state', handleState)
    const handleReconnect = () => {
      if (joined && name && category) {
        socket.emit('join_room', { roomId, name, category }, () => {})
      }
    }
    socket.on('connect', handleReconnect)
    return () => {
      socket.off('state', handleState)
      socket.off('connect', handleReconnect)
    }
  }, [socket])

  // Keep task input in sync with server state
  useEffect(() => {
    if (state?.task !== undefined) {
      setTaskInput(state.task)
    }
  }, [state?.task])

  // Reset selected card when starting new round or resetting
  useEffect(() => {
    if (state && !state.revealed) {
      // Check if current user has voted in this round
      const myId = getSocket().id || ''
      const myParticipant = state.participants.find(p => p.id === myId)
      if (!myParticipant || !myParticipant.vote) {
        setSelected(null)
      }
    }
  }, [state?.revealed, state?.participants])

  useEffect(() => {
    if (!joined) return
    if (!name || !category) return
    socket.emit('join_room', { roomId, name, category }, (res: any) => {
      if (!res?.ok) {
        alert('Комната не найдена')
        navigate('/', { replace: true })
        return
      }
      setState(res.state || null)
      setTaskInput(res.state?.task ?? '')
    })
  }, [joined, name, category, roomId])

  const isHost = state?.hostId === (getSocket().id || '')

  const onPick = (v: VoteValue) => {
    setSelected(v)
    socket.emit('vote', { roomId, value: v })
  }

  const onSetTask = () => {
    socket.emit('set_task', { roomId, task: taskInput })
  }

  const onReveal = () => socket.emit('reveal', { roomId })
  const onNewRound = () => {
    setSelected(null)
    socket.emit('new_round', { roomId })
  }
  const onReset = () => {
    setSelected(null)
    socket.emit('reset_results', { roomId })
  }

  const onEditParticipant = (participant: Participant) => {
    setEditingParticipant(participant)
  }

  const onSetHost = (participant: Participant) => {
    socket.emit('set_host', { roomId, targetId: participant.id })
  }

  const onSaveEdit = (newName: string, newCategory: string) => {
    if (!editingParticipant) return
    socket.emit('update_participant', { 
      roomId, 
      targetId: editingParticipant.id, 
      name: newName, 
      category: newCategory 
    })
    setEditingParticipant(null)
  }
  const onCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  if (!joined) {
    return (
      <div className="min-h-full p-6">
        <div className="max-w-md mx-auto space-y-4">
          <h2 className="text-xl font-semibold">Вход в комнату</h2>
          <input
            className="w-full px-4 py-3 rounded bg-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            className="w-full px-4 py-3 rounded bg-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Выберите категорию</option>
            <option value="Front">Front</option>
            <option value="Back">Back</option>
            <option value="QA">QA</option>
            <option value="Mobile">Mobile</option>
            <option value="Visitor">Visitor</option>
          </select>
          <button
            className="w-full px-4 py-3 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
            disabled={!name.trim() || !category}
            onClick={() => {
              if (!name.trim() || !category) return
              setName(name.trim())
              setJoined(true)
            }}
          >
            Войти
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
        <div className="col-span-12 flex items-center justify-between">
          <div className="flex items-center gap-3 w-full">
            <input
              className="flex-1 px-4 py-3 rounded bg-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Название задачи"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              disabled={!isHost}
            />
            {isHost && (
              <div className="flex gap-2">
                <button className="px-4 py-3 rounded bg-indigo-600 hover:bg-indigo-500" onClick={onSetTask}>Сохранить</button>
                <button className="px-4 py-3 rounded bg-amber-600 hover:bg-amber-500" onClick={onReset}>Сбросить результаты</button>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 md:col-span-3">
          {state && <ParticipantList participants={state.participants} hostId={state.hostId} myId={getSocket().id || ''} onEdit={onEditParticipant} onSetHost={onSetHost} />}
        </div>

        <div className="col-span-12 md:col-span-9 space-y-6">
          <div>
            <CardGrid onPick={onPick} selected={selected} disabled={!state || state.revealed} />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-slate-400 space-x-4">
              {state?.revealed && state?.average != null && (
                <span>Среднее: <span className="font-semibold text-slate-100">{state.average}</span></span>
              )}
              {state?.revealed && state?.byCategory && (
                <span>Сумма средних: <span className="font-semibold text-slate-100">{
                  Object.values(state.byCategory).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0).toFixed(2)
                }</span></span>
              )}
            </div>
            <Controls
              isHost={!!isHost}
              onReveal={onReveal}
              onNewRound={onNewRound}
              onCopyLink={onCopyLink}
              revealed={!!state?.revealed}
              copied={copied}
            />
          </div>
          {state?.revealed && state?.byCategory && (
            <div className="bg-slate-900 border border-slate-800 rounded p-3 text-sm text-slate-300">
              <div className="mb-2 text-slate-400">Среднее по категориям:</div>
              <div className="flex flex-wrap gap-3">
                {Object.entries(state.byCategory).map(([k, v]) => (
                  <span key={k} className="px-2 py-1 rounded bg-slate-800 border border-slate-700">{k}: <span className="text-slate-100 font-semibold">{v}</span></span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {editingParticipant && (
        <EditParticipantModal
          participant={editingParticipant}
          onSave={onSaveEdit}
          onCancel={() => setEditingParticipant(null)}
        />
      )}
    </div>
  )
}

function EditParticipantModal({ participant, onSave, onCancel }: { participant: Participant; onSave: (name: string, category: string) => void; onCancel: () => void }) {
  const [name, setName] = useState(participant.name)
  const [category, setCategory] = useState(participant.category)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Редактировать участника</h3>
        <div className="space-y-4">
          <input
            className="w-full px-4 py-3 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            className="w-full px-4 py-3 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Выберите категорию</option>
            <option value="Front">Front</option>
            <option value="Back">Back</option>
            <option value="QA">QA</option>
            <option value="Mobile">Mobile</option>
            <option value="Visitor">Visitor</option>
          </select>
          <div className="flex gap-3">
            <button
              className="flex-1 px-4 py-3 rounded bg-indigo-600 hover:bg-indigo-500"
              onClick={() => onSave(name, category)}
            >
              Сохранить
            </button>
            <button
              className="flex-1 px-4 py-3 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700"
              onClick={onCancel}
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}