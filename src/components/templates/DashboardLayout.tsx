import type { ReactNode } from 'react'
import { Button } from '../atoms/Button'
import { LogOutIcon } from '../atoms/Icons'
import { Logo } from '../atoms/Logo'

type DashboardLayoutProps = {
  children: ReactNode
  headerActions?: ReactNode
  onSignOut: () => void
  isSigningOut: boolean
}

export function DashboardLayout({
  children,
  headerActions,
  onSignOut,
  isSigningOut,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            {headerActions}
            <Button
              variant="ghost"
              onClick={onSignOut}
              isLoading={isSigningOut}
              aria-label="Cerrar sesión"
              className="px-2.5 whitespace-nowrap sm:px-4"
            >
              <LogOutIcon className="size-5 sm:hidden" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-5 py-10 sm:px-8 sm:py-14">
        {children}
      </main>
    </div>
  )
}
