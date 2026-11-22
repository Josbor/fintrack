import type { InputHTMLAttributes, ReactNode } from 'react'
import styles from './Input.module.css'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean
  leadingIcon?: ReactNode
  trailing?: ReactNode
}

export function Input({
  hasError = false,
  leadingIcon,
  trailing,
  className = '',
  ...props
}: InputProps) {
  return (
    <div
      className={[
        'group flex items-center gap-3 rounded-xl border bg-white px-3.5 transition duration-200 focus-within:ring-4',
        hasError
          ? 'border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-500/10'
          : 'border-slate-200 hover:border-slate-300 focus-within:border-brand-500 focus-within:ring-brand-500/10',
        'has-[:disabled]:bg-slate-50 has-[:disabled]:opacity-70',
      ].join(' ')}
    >
      {leadingIcon && (
        <span
          className={`shrink-0 transition-colors ${
            hasError
              ? 'text-rose-400'
              : 'text-slate-400 group-focus-within:text-brand-600'
          }`}
        >
          {leadingIcon}
        </span>
      )}
      <input
        className={`${styles.input} min-w-0 flex-1 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {trailing}
    </div>
  )
}
