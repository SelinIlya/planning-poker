export default function Controls({ isHost, onReveal, onNewRound, onCopyLink, revealed, copied }: { isHost: boolean; onReveal: () => void; onNewRound: () => void; onCopyLink: () => void; revealed: boolean; copied?: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="relative">
        <button className="px-4 py-2 rounded bg-slate-800 border border-slate-700" onClick={onCopyLink}>Скопировать ссылку</button>
        {copied && (
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200">
            Скопировано
          </div>
        )}
      </div>
      {isHost && (
        <>
          {!revealed ? (
            <button className="px-4 py-2 rounded bg-green-600 hover:bg-green-500" onClick={onReveal}>Показать результаты</button>
          ) : (
            <button className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500" onClick={onNewRound}>Новый раунд</button>
          )}
        </>
      )}
    </div>
  )
}


