/**
 * Segue o token semântico da superfície onde está (`text-foreground` por
 * omissão) — não uma cor fixa, para acompanhar o tema automaticamente.
 * `className` permite sobrepor caso alguma secção precise de outra cor.
 */
export function Logo({ className = 'text-foreground' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-lg font-black text-white shadow-lg shadow-violet-500/25">
        N
      </span>
      <span className="text-lg">
        next<span className="text-primary">level</span>
      </span>
    </div>
  )
}
