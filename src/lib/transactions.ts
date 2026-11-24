import { supabase } from './supabase'

export type TransactionType = 'income' | 'expense' | 'transfer' | 'opening'

export const CREATABLE_TRANSACTION_TYPES = [
  { value: 'expense', label: 'Gasto' },
  { value: 'income', label: 'Ingreso' },
] as const

export type CreatableTransactionType = (typeof CREATABLE_TRANSACTION_TYPES)[number]['value']

export type Transaction = {
  id: string
  type: TransactionType
  amount: number
  description: string
  payee: string | null
  notes: string | null
  occurredAt: string
  accountId: string
  transferAccountId: string | null
  categoryId: string | null
  receiptPath: string | null
}

export type UpdateTransactionInput = {
  description: string
  payee: string
  notes: string
  occurredOn: string
  categoryId: string | null
  receiptPath: string | null
}

export type CreateTransactionInput = {
  type: CreatableTransactionType | 'transfer'
  amount: number
  description: string
  payee: string
  notes: string
  occurredOn: string
  accountId: string
  transferAccountId: string | null
  categoryId: string | null
  receiptPath: string | null
}

type TransactionRow = {
  id: string
  type: TransactionType
  amount: string | number
  description: string
  payee: string | null
  notes: string | null
  occurred_at: string
  account_id: string
  transfer_account_id: string | null
  category_id: string | null
  receipt_path: string | null
}

export async function listTransactions(
  accountId: string | null = null,
  limit = 50,
): Promise<Transaction[]> {
  let query = supabase
    .from('transactions')
    .select(
      'id, type, amount, description, payee, notes, occurred_at, account_id, transfer_account_id, category_id, receipt_path',
    )
    .is('deleted_at', null)

  if (accountId) {
    query = query.or(`account_id.eq.${accountId},transfer_account_id.eq.${accountId}`)
  }

  const { data, error } = await query
    .order('occurred_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)

  return ((data ?? []) as TransactionRow[]).map((row) => ({
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    description: row.description,
    payee: row.payee,
    notes: row.notes,
    occurredAt: row.occurred_at,
    accountId: row.account_id,
    transferAccountId: row.transfer_account_id,
    categoryId: row.category_id,
    receiptPath: row.receipt_path,
  }))
}

export async function updateTransaction(id: string, input: UpdateTransactionInput) {
  const { error } = await supabase
    .from('transactions')
    .update({
      description: input.description.trim(),
      payee: input.payee.trim() || null,
      notes: input.notes.trim() || null,
      occurred_at: new Date(`${input.occurredOn}T12:00:00`).toISOString(),
      category_id: input.categoryId,
      receipt_path: input.receiptPath,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function createTransaction(input: CreateTransactionInput) {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id

  if (!userId) throw new Error('No hay una sesión activa.')

  const { error } = await supabase.from('transactions').insert({
    user_id: userId,
    type: input.type,
    amount: input.amount,
    description: input.description.trim(),
    payee: input.payee.trim() || null,
    notes: input.notes.trim() || null,
    occurred_at: new Date(`${input.occurredOn}T12:00:00`).toISOString(),
    account_id: input.accountId,
    transfer_account_id: input.type === 'transfer' ? input.transferAccountId : null,
    category_id: input.type === 'transfer' ? null : input.categoryId,
    receipt_path: input.receiptPath,
  })

  if (error) throw new Error(error.message)
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase
    .from('transactions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}
