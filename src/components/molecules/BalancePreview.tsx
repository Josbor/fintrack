import { TrendingUpIcon } from '../atoms/Icons'

const bars = [38, 52, 44, 68, 58, 82, 74, 96]
const months = ['Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep']

export function BalancePreview() {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-brand-950/40 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-100/60">
            Balance total
          </p>
          <p className="mt-1.5 font-display text-[1.75rem] font-bold leading-none text-white">
            $48,320<span className="text-lg text-brand-200/70">.00</span>
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-inset ring-emerald-300/25">
          <TrendingUpIcon className="size-3.5" strokeWidth={2.4} />
          12.4%
        </span>
      </div>

      <div className="mt-6 flex h-20 items-end gap-1.5" aria-hidden="true">
        {bars.map((height, index) => (
          <span
            key={months[index]}
            className={`flex-1 rounded-t-[3px] ${
              index === bars.length - 1 ? 'bg-brand-300' : 'bg-white/20'
            }`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <div className="mt-3 flex justify-between text-[9px] font-medium uppercase tracking-wider text-brand-100/40">
        {months.map((month) => (
          <span key={month}>{month}</span>
        ))}
      </div>
    </div>
  )
}
