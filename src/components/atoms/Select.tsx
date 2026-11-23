import type { SelectHTMLAttributes } from 'react'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean
}

export function Select({ hasError = false, className = '', children, ...props }: SelectProps) {
  return (
    <div
      className={[
        'flex items-center rounded-xl border bg-white px-3.5 transition duration-200 focus-within:ring-4',
        hasError
          ? 'border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-500/10'
          : 'border-slate-200 hover:border-slate-300 focus-within:border-brand-500 focus-within:ring-brand-500/10',
        'has-[:disabled]:bg-slate-50 has-[:disabled]:opacity-70',
      ].join(' ')}
    >
      <select
        className={`min-w-0 flex-1 cursor-pointer bg-transparent py-3 text-sm text-slate-900 outline-none disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
