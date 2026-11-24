import { HelpIcon } from '../atoms/Icons'
import { Tooltip } from './Tooltip'

type SectionTourButtonProps = {
  label: string
  onClick: () => void
  variant?: 'outlined' | 'ghost'
}

const variants = {
  outlined:
    'border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-brand-700 focus-visible:ring-slate-300/40',
  ghost:
    'text-slate-400 hover:bg-slate-100 hover:text-brand-700 focus-visible:ring-slate-300/40',
}

export function SectionTourButton({ label, onClick, variant = 'outlined' }: SectionTourButtonProps) {
  return (
    <Tooltip label={label}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`grid size-10 place-items-center rounded-xl outline-none transition focus-visible:ring-4 ${variants[variant]}`}
      >
        <HelpIcon className="size-5" />
      </button>
    </Tooltip>
  )
}
