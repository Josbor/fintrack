import type { ReactNode } from 'react'
import { AlertCircleIcon, CheckIcon } from '../atoms/Icons'

type FormAlertProps = {
  tone: 'success' | 'error' | 'info'
  children: ReactNode
}

const tones = {
  success: {
    wrapper: 'border-brand-200 bg-brand-50 text-brand-800',
    icon: 'bg-brand-600 text-white',
  },
  error: {
    wrapper: 'border-rose-200 bg-rose-50 text-rose-700',
    icon: 'bg-rose-500 text-white',
  },
  info: {
    wrapper: 'border-slate-200 bg-slate-50 text-slate-600',
    icon: 'bg-slate-600 text-white',
  },
}

export function FormAlert({ tone, children }: FormAlertProps) {
  const styles = tones[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-xs font-medium leading-relaxed ${styles.wrapper}`}
    >
      <span
        className={`mt-px grid size-5 shrink-0 place-items-center rounded-full ${styles.icon}`}
        aria-hidden="true"
      >
        {tone === 'success' ? (
          <CheckIcon className="size-3" strokeWidth={3} />
        ) : (
          <AlertCircleIcon className="size-3.5" />
        )}
      </span>
      <span>{children}</span>
    </div>
  )
}
