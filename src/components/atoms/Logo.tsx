import { TrendingUpIcon } from './Icons'

type LogoProps = {
  tone?: 'light' | 'dark'
  compact?: boolean
  className?: string
}

export function Logo({ tone = 'dark', compact = false, className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-lg shadow-brand-950/30 ring-1 ring-inset ring-white/25">
        <TrendingUpIcon className="size-5" strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={`font-display text-lg font-extrabold tracking-tight ${
              tone === 'light' ? 'text-white' : 'text-slate-900'
            }`}
          >
            FinTrack
          </span>
          <span
            className={`mt-1 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.22em] ${
              tone === 'light' ? 'text-brand-200/70' : 'text-slate-400'
            }`}
          >
            Finanzas claras
          </span>
        </span>
      )}
    </span>
  )
}
