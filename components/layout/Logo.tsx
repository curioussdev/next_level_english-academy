export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className={`flex items-center gap-2 font-bold tracking-tight ${light ? 'text-white' : 'text-slate-950'}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-lg font-black text-white shadow-lg shadow-violet-500/25">
        N
      </span>
      <span className="text-lg">
        next<span className="text-violet-600">level</span>
      </span>
    </div>
  )
}
