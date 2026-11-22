import type { ReactNode } from 'react'
import styles from './AuthCard.module.css'

type AuthCardProps = {
  children: ReactNode
  size?: 'default' | 'wide'
}

const widths = {
  default: 'max-w-[27rem]',
  wide: 'max-w-[29rem]',
}

export function AuthCard({ children, size = 'default' }: AuthCardProps) {
  return (
    <div
      data-auth-card
      className={`${styles.card} w-full ${widths[size]} rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-900/5 sm:p-8`}
    >
      {children}
    </div>
  )
}
