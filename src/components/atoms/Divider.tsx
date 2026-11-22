type DividerProps = {
  label: string
  className?: string
}

export function Divider({ label, className = '' }: DividerProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`} role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-slate-200" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  )
}
