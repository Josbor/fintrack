import type { InputHTMLAttributes, ReactNode } from 'react'
import { CheckIcon } from './Icons'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode
}

export function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  return (
    <label className={`group inline-flex cursor-pointer items-center gap-2.5 select-none ${className}`}>
      <span className="relative grid size-5 shrink-0 place-items-center">
        <input
          type="checkbox"
          className="peer absolute inset-0 z-10 size-full cursor-pointer appearance-none rounded-md border border-slate-300 bg-white transition duration-150 checked:border-brand-600 checked:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        <CheckIcon
          className="pointer-events-none z-20 size-3.5 text-white opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
          strokeWidth={3}
        />
      </span>
      <span className="text-sm text-slate-600 transition-colors group-hover:text-slate-900">
        {label}
      </span>
    </label>
  )
}
