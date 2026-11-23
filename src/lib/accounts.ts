import { supabase } from './supabase'

export const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Cuenta corriente' },
  { value: 'savings', label: 'Ahorro' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'credit', label: 'Tarjeta de crédito' },
  { value: 'investment', label: 'Inversión' },
] as const

export const CURRENCIES = ['USD', 'EUR', 'VES', 'MXN', 'PEN', 'COP', 'CLP', 'ARS'] as const

export type AccountType = (typeof ACCOUNT_TYPES)[number]['value']

export type Account = {
  id: string
  name: string
  type: AccountType
  currency: string
  balance: number
}

export type CreateAccountInput = {
  name: string
  type: AccountType
  currency: string
  initialBalance: number
}

type AccountRow = {
  id: string
  name: string
  type: AccountType
  currency: string
}

type TransactionRow = {
  account_id: string
  transfer_account_id: string | null
  type: 'income' | 'expense' | 'transfer' | 'opening'
  amount: string | number
}

export function accountTypeLabel(type: AccountType) {
  return ACCOUNT_TYPES.find((item) => item.value === type)?.label ?? type
}

export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('es', { style: 'currency', currency }).format(amount)
}

function roundCents(value: number) {
  return Math.round(value * 100) / 100
}

function computeBalance(accountId: string, transactions: TransactionRow[]) {
  return transactions.reduce((total, tx) => {
    const amount = Number(tx.amount)

    if (tx.account_id === accountId) {
      return tx.type === 'expense' || tx.type === 'transfer' ? total - amount : total + amount
    }

    if (tx.type === 'transfer' && tx.transfer_account_id === accountId) {
      return total + amount
    }

    return total
  }, 0)
}

export async function listAccounts(): Promise<Account[]> {
  const [accountsResult, transactionsResult] = await Promise.all([
    supabase
      .from('accounts')
      .select('id, name, type, currency')
      .eq('is_archived', false)
      .order('created_at', { ascending: true }),
    supabase
      .from('transactions')
      .select('account_id, transfer_account_id, type, amount')
      .is('deleted_at', null),
  ])

  if (accountsResult.error) throw new Error(accountsResult.error.message)
  if (transactionsResult.error) throw new Error(transactionsResult.error.message)

  const accounts = (accountsResult.data ?? []) as AccountRow[]
  const transactions = (transactionsResult.data ?? []) as TransactionRow[]

  return accounts.map((account) => ({
    ...account,
    balance: roundCents(computeBalance(account.id, transactions)),
  }))
}

export async function createAccount(input: CreateAccountInput) {
  const { error } = await supabase.rpc('create_account', {
    p_name: input.name.trim(),
    p_type: input.type,
    p_currency: input.currency,
    p_initial_balance: input.initialBalance,
  })

  if (error) throw new Error(error.message)
}
