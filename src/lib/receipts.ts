import { supabase } from './supabase'
import { parseReceiptText } from './receiptParser'

export const RECEIPT_MAX_BYTES = 8 * 1024 * 1024

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

export const RECEIPT_ACCEPT = Object.keys(EXTENSIONS).join(',')

export type ReceiptDraft = {
  amount: number | null
  currency: string | null
  date: string | null
  merchant: string | null
  description: string | null
  category: string | null
  confidence: 'high' | 'medium' | 'low'
}

export function validateReceiptFile(file: File) {
  if (!EXTENSIONS[file.type]) return 'Formato no soportado. Usa JPG, PNG, WEBP o PDF.'
  if (file.size > RECEIPT_MAX_BYTES) return 'La factura supera 8 MB.'
  return null
}

export async function uploadReceipt(file: File): Promise<string> {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id

  if (!userId) throw new Error('No hay una sesión activa.')

  const path = `${userId}/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`
  const { error } = await supabase.storage
    .from('receipts')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) throw new Error(error.message)

  return path
}

export async function getReceiptUrl(path: string) {
  const { data, error } = await supabase.storage.from('receipts').createSignedUrl(path, 300)

  if (error || !data) throw new Error('No pudimos abrir la factura.')

  return data.signedUrl
}

export async function removeReceipt(path: string) {
  const { error } = await supabase.storage.from('receipts').remove([path])

  if (error) throw new Error(error.message)
}

export function isReadableImage(file: File) {
  return file.type.startsWith('image/')
}

async function rotateImage(file: File, degrees: 90 | 270): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.height
  canvas.height = bitmap.width

  const context = canvas.getContext('2d')
  if (!context) throw new Error('No se pudo procesar la imagen.')

  context.translate(canvas.width / 2, canvas.height / 2)
  context.rotate((degrees * Math.PI) / 180)
  context.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2)
  bitmap.close()

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('rotate'))), 'image/png'),
  )
}

const CONFIDENCE_RANK = { high: 3, medium: 2, low: 1 } as const

function draftScore(draft: ReceiptDraft) {
  return (draft.amount !== null ? 10 : 0) + CONFIDENCE_RANK[draft.confidence]
}

export async function readReceipt(file: File): Promise<ReceiptDraft> {
  const { default: Tesseract } = await import('tesseract.js')
  const worker = await Tesseract.createWorker(['spa', 'eng'])

  try {
    let best: ReceiptDraft | null = null

    for (const degrees of [0, 90, 270] as const) {
      const input = degrees === 0 ? file : await rotateImage(file, degrees)
      const { data } = await worker.recognize(input)
      const draft = parseReceiptText(data.text, data.confidence)

      if (!best || draftScore(draft) > draftScore(best)) best = draft
      if (draft.confidence === 'high') break
    }

    return best as ReceiptDraft
  } finally {
    await worker.terminate()
  }
}
