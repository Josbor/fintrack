import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from './Spinner'

type ButtonVariant = 'primary' | 'social' | 'ghost'
type ButtonSize = 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  fullWidth?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

const base =
  'group inline-flex items-center justify-center gap-2.5 rounded-xl font-semibold outline-none transition-all duration-200 focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white shadow-lg shadow-brand-900/20 hover:bg-brand-700 hover:shadow-brand-900/30 focus-visible:ring-brand-500/25 active:translate-y-px',
  social:
    'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-300/40 active:translate-y-px',
  ghost:
    'text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-300/40',
}

const sizes: Record<ButtonSize, string> = {
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3.5 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  className = '',
  type = 'button',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={[base, variants[variant], sizes[size], fullWidth ? 'w-full' : '', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {isLoading ? (
        <Spinner />
      ) : leadingIcon ? (
        <span className="shrink-0 transition-transform duration-200 group-hover:scale-105">
          {leadingIcon}
        </span>
      ) : null}
      <span>{children}</span>
      {!isLoading && trailingIcon ? (
        <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
          {trailingIcon}
        </span>
      ) : null}
    </button>
  )
}
