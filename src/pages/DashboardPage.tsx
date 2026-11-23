import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useAccounts } from '../hooks/useAccounts'
import { useCategories } from '../hooks/useCategories'
import { usePageTitle } from '../hooks/usePageTitle'
import { useTransactions } from '../hooks/useTransactions'
import { TotalBalanceCard } from '../components/molecules/TotalBalanceCard'
import { AccountsPanel } from '../components/organisms/AccountsPanel'
import { TransactionsPanel } from '../components/organisms/TransactionsPanel'
import { DashboardLayout } from '../components/templates/DashboardLayout'

export function DashboardPage() {
  usePageTitle('FinTrack · Tu panel')

  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const accountsData = useAccounts()
  const transactionsData = useTransactions()
  const { categories, setCategories, isLoading: isLoadingCategories } = useCategories()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim()
  const firstName = fullName?.split(' ')[0] ?? 'de nuevo'

  function refreshData() {
    accountsData.reload()
    transactionsData.reload()
  }

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

      <TotalBalanceCard accounts={accountsData.accounts} />

      <AccountsPanel
        accounts={accountsData.accounts}
        isLoading={accountsData.isLoading}
        error={accountsData.error}
        onChanged={refreshData}
      />

      <TransactionsPanel
        transactions={transactionsData.transactions}
        accounts={accountsData.accounts}
        categories={categories}
        isLoading={transactionsData.isLoading || isLoadingCategories}
        error={transactionsData.error}
        onCategoryCreated={(category) =>
          setCategories((current) =>
            [...current, category].sort((a, b) => a.name.localeCompare(b.name)),
          )
        }
        onChanged={refreshData}
      />
    </DashboardLayout>
  )
}
