import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Button } from '../components/atoms/Button'
import { Logo } from '../components/atoms/Logo'
import { usePageTitle } from '../hooks/usePageTitle'

export function DashboardPage() {
  usePageTitle('FinTrack · Tu panel')

  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim()
  const firstName = fullName?.split(' ')[0] ?? 'de nuevo'

  async function handleSignOut() {
    setIsSigningOut(true)
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Logo />
          <Button variant="ghost" onClick={handleSignOut} isLoading={isSigningOut}>
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
          Tu panel
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Hola, {firstName}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
          Tu cuenta ya está conectada a Supabase. Desde aquí construiremos cuentas,
          transacciones y presupuestos.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Sesión iniciada como
            </p>
            <p className="mt-2 truncate text-sm font-semibold text-slate-900">
              {user?.email}
            </p>
            <p className="mt-1 truncate text-xs text-slate-500">ID: {user?.id}</p>
          </section>

          <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Siguiente paso
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Crear las tablas de cuentas y transacciones con políticas RLS.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
