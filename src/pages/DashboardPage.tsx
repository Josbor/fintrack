import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useAccounts } from '../hooks/useAccounts'
import { usePageTitle } from '../hooks/usePageTitle'
import { TotalBalanceCard } from '../components/molecules/TotalBalanceCard'
import { AccountsPanel } from '../components/organisms/AccountsPanel'
import { DashboardLayout } from '../components/templates/DashboardLayout'

export function DashboardPage() {
  usePageTitle('FinTrack · Tu panel')

  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { accounts, isLoading, error, reload } = useAccounts()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim()
  const firstName = fullName?.split(' ')[0] ?? 'de nuevo'

  async function handleSignOut() {
    setIsSigningOut(true)
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <DashboardLayout onSignOut={handleSignOut} isSigningOut={isSigningOut}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
          Tu panel
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Hola, {firstName}
        </h1>
      </div>

      <TotalBalanceCard accounts={accounts} />

      <AccountsPanel accounts={accounts} isLoading={isLoading} error={error} onChanged={reload} />
    </DashboardLayout>
  )
}
