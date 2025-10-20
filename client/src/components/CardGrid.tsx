import type { VoteValue } from '@/types'

const VALUES: VoteValue[] = [1, 2, 4, 8, 16, 32, 64, 128, '☕️', '?']

export default function CardGrid({ onPick, selected, disabled }: { onPick: (v: VoteValue) => void; selected: VoteValue; disabled?: boolean }) {
  return (
    <div className="grid grid-cols-10 gap-3">
      {VALUES.map((v) => (
        <button
          key={String(v)}
          onClick={() => onPick(v)}
          disabled={disabled}
          className={
            `aspect-[3/4] rounded-lg border text-2xl font-bold flex items-center justify-center ` +
            (selected === v ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-900 border-slate-800 hover:bg-slate-800')
          }
        >
          {v}
        </button>
      ))}
    </div>
  )
}


