import type { Participant } from '@/types'
import { useState } from 'react'

export default function ParticipantList({ participants, hostId, myId, onEdit, onSetHost }: { participants: Participant[]; hostId: string; myId?: string; onEdit?: (p: Participant) => void; onSetHost?: (p: Participant) => void }) {
  const groups = groupByCategory(participants)
  return (
    <div className="space-y-4">
      <h3 className="text-sm uppercase tracking-wide text-slate-400">Участники</h3>
      {Object.keys(groups).sort().map((cat) => (
        <div key={cat} className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-slate-500">{cat}</div>
          <ul className="space-y-1">
            {groups[cat].map((p) => (
              <li key={p.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded px-3 py-2">
                <span className="truncate">
                  {p.name} <span className="text-xs text-slate-400">[{p.category}]</span> {p.id === hostId && <span className="text-xs text-indigo-400">(Host)</span>} {p.id === myId && <span className="text-xs text-emerald-400">(Вы)</span>}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {p.vote === '•' ? '•' : p.vote ?? ''}
                  </span>
                  {(onEdit || onSetHost) && (hostId === myId || p.id === myId) && (
                    <MenuButton onClick={() => onEdit && onEdit(p)} onSetHost={onSetHost} participant={p} isHost={hostId === myId} />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function groupByCategory(list: Participant[]): Record<string, Participant[]> {
  const out: Record<string, Participant[]> = {}
  for (const p of list) {
    const k = p.category || 'Visitor'
    if (!out[k]) out[k] = []
    out[k].push(p)
  }
  return out
}

function MenuButton({ onClick, onSetHost, participant, isHost }: { onClick: () => void; onSetHost?: (p: Participant) => void; participant: Participant; isHost: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        className="text-slate-400 hover:text-slate-200 text-sm"
        onClick={() => setOpen(!open)}
      >
        ⋯
      </button>
      {open && (
        <div className="absolute right-0 top-6 bg-slate-800 border border-slate-700 rounded shadow-lg z-10 min-w-32">
          <button
            className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-700"
            onClick={() => { onClick(); setOpen(false) }}
          >
            Редактировать
          </button>
          {isHost && onSetHost && (
            <button
              className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-700"
              onClick={() => { onSetHost(participant); setOpen(false) }}
            >
              Назначить ведущим
            </button>
          )}
        </div>
      )}
    </div>
  )
}


