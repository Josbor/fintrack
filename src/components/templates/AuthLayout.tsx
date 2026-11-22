import type { ReactNode } from 'react'
import { Logo } from '../atoms/Logo'
import { AuthFooter } from '../organisms/AuthFooter'
import styles from './AuthLayout.module.css'

type AuthLayoutProps = {
  aside: ReactNode
  children: ReactNode
}

export function AuthLayout({ aside, children }: AuthLayoutProps) {
  return (
    <div
      className={`min-h-dvh bg-slate-50 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] ${styles.shell}`}
    >
      <aside className={`hidden lg:block ${styles.aside}`}>{aside}</aside>

      <main
        className={`relative flex min-h-dvh flex-col overflow-hidden lg:min-h-0 ${styles.main}`}
      >
        <div className={styles.dots} aria-hidden="true" />

        <div
          className={`${styles.inner} relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col px-5 py-7 sm:px-8 sm:py-9`}
        >
          <div className="lg:hidden">
            <Logo />
          </div>

          <div
            data-auth-content
            className={`${styles.content} flex flex-1 items-center justify-center py-8 sm:py-10`}
          >
            {children}
          </div>

          <AuthFooter />
        </div>
      </main>
    </div>
  )
}
