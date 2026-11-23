import { supabase } from './supabase'

export type ReceiptScanner = 'ocr' | 'ai'

export type Profile = {
  receiptScanner: ReceiptScanner
}

export async function getProfile(): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('receipt_scanner')
    .maybeSingle()

  if (error) throw new Error(error.message)

  return {
    receiptScanner: (data?.receipt_scanner as ReceiptScanner | undefined) ?? 'ocr',
  }
}

export async function updateReceiptScanner(value: ReceiptScanner) {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id

  if (!userId) throw new Error('No hay una sesión activa.')

  const { error } = await supabase
    .from('profiles')
    .update({ receipt_scanner: value })
    .eq('id', userId)

  if (error) throw new Error(error.message)
}
