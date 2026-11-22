import type { LabelHTMLAttributes } from 'react'

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean
}

export function Label({ required = false, className = '', children, ...props }: LabelProps) {
  return (
    <label className={`block text-sm font-medium text-slate-700 ${className}`} {...props}>
      {children}
      {required && (
        <span className="ml-1 text-brand-600" aria-hidden="true">
          *
        </span>
      )}
    </label>
  )
}
