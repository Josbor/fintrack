import { useState, type ChangeEvent } from 'react'
import { Button } from '../atoms/Button'
import { FormAlert } from './FormAlert'
import {
  RECEIPT_ACCEPT,
  isReadableImage,
  readReceipt,
  uploadReceipt,
  validateReceiptFile,
  type ReceiptDraft,
} from '../../lib/receipts'

type ReceiptFieldProps = {
  receiptName: string | null
  currency: string
  onAttached: (attachment: { path: string; name: string; draft: ReceiptDraft | null }) => void
  onRemove: () => void
}

export function ReceiptField({ receiptName, currency, onAttached, onRemove }: ReceiptFieldProps) {
  const [status, setStatus] = useState<string | null>(null)
  const [tone, setTone] = useState<'info' | 'error'>('info')
  const [isProcessing, setIsProcessing] = useState(false)

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const validationError = validateReceiptFile(file)
    if (validationError) {
      setTone('error')
      setStatus(validationError)
      return
    }

    const readable = isReadableImage(file)
    setIsProcessing(true)
    setTone('info')
    setStatus(readable ? 'Leyendo la factura en tu navegador…' : 'Subiendo la factura…')

    try {
      const draft = readable ? await readReceipt(file).catch(() => null) : null
      const path = await uploadReceipt(file)
      onAttached({ path, name: file.name, draft })

      if (!readable) {
        setStatus('PDF adjuntado. La lectura automática solo funciona con imágenes por ahora.')
        return
      }

      if (!draft) {
        setTone('error')
        setStatus('No pudimos leer la factura. Ingresa los datos manualmente.')
        return
      }

      const notes: string[] = []
      if (draft.currency && draft.currency !== currency) {
        notes.push(`La factura parece estar en ${draft.currency} y la cuenta usa ${currency}.`)
      }
      if (draft.confidence === 'low' || draft.amount === null) {
        notes.push('La lectura no fue clara. Revisa los datos antes de guardar.')
      }

      setTone(notes.length ? 'error' : 'info')
      setStatus(notes.length ? notes.join(' ') : 'Datos extraídos. Revísalos antes de guardar.')
    } catch (err) {
      setTone('error')
      setStatus(err instanceof Error ? err.message : 'No pudimos procesar la factura. Inténtalo de nuevo.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Factura (opcional)</p>
          <p className="text-xs text-slate-500">
            Sube una foto o PDF y prellenamos el formulario. Tú confirmas antes de guardar.
          </p>
        </div>

        {receiptName ? (
          <div className="flex items-center gap-2">
            <span className="max-w-48 truncate text-xs font-medium text-slate-600">
              {receiptName}
            </span>
            <Button
              variant="ghost"
              onClick={onRemove}
              disabled={isProcessing}
              className="px-2.5 py-1.5 text-xs"
            >
              Quitar
            </Button>
          </div>
        ) : (
          <label
            className={`inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 ${
              isProcessing ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            Subir factura
            <input
              type="file"
              accept={RECEIPT_ACCEPT}
              onChange={handleFile}
              disabled={isProcessing}
              className="sr-only"
            />
          </label>
        )}
      </div>

      {status && <FormAlert tone={tone === 'error' ? 'error' : 'info'}>{status}</FormAlert>}
    </div>
  )
}
