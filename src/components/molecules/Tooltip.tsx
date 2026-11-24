import type { ReactNode } from 'react'

type TooltipProps = {
  label: string
  children: ReactNode
  disabled?: boolean
  className?: string
}

export function Tooltip({ label, children, disabled = false, className = '' }: TooltipProps) {
  return (
    <span className={`group relative inline-flex ${className}`}>
      {children}
      {!disabled && (
        <span
          role="tooltip"
          className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-max max-w-48 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition group-focus-within:opacity-100 group-hover:opacity-100"
        >
          {label}
        </span>
      )}
    </span>
  )
}
