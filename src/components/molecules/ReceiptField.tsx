import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Button } from '../atoms/Button'
import { FormAlert } from './FormAlert'
import {
  RECEIPT_ACCEPT,
  isReadableImage,
  readReceipt,
  readReceiptWithAi,
  uploadReceipt,
  validateReceiptFile,
  type ReceiptDraft,
} from '../../lib/receipts'
import { useProfile } from '../../profile/useProfile'

type ReceiptFieldProps = {
  receiptPath: string | null
  receiptName: string | null
  currency: string
  categoryNames: string[]
  onAttached: (attachment: { path: string; name: string; draft: ReceiptDraft | null }) => void
  onDraft: (draft: ReceiptDraft) => void
  onRemove: () => void
  initialFile?: File | null
  onProcessingChange?: (isProcessing: boolean) => void
}

function draftNotes(draft: ReceiptDraft, currency: string) {
  const notes: string[] = []
  if (draft.currency && draft.currency !== currency) {
    notes.push(`La factura parece estar en ${draft.currency} y la cuenta usa ${currency}.`)
  }
  if (draft.confidence === 'low' || draft.amount === null) {
    notes.push('La lectura no fue clara. Revisa los datos antes de guardar.')
  }
  return notes
}

export function ReceiptField({
  receiptPath,
  receiptName,
  currency,
  categoryNames,
  onAttached,
  onDraft,
  onRemove,
  initialFile = null,
  onProcessingChange,
}: ReceiptFieldProps) {
  const { profile } = useProfile()
  const [status, setStatus] = useState<string | null>(null)
  const [tone, setTone] = useState<'info' | 'error'>('info')
  const [isProcessing, setIsProcessing] = useState(false)
  const handledFile = useRef<File | null>(null)

  useEffect(() => {
    onProcessingChange?.(isProcessing)
  }, [isProcessing, onProcessingChange])

  function showResult(draft: ReceiptDraft, label: string) {
    const notes = draftNotes(draft, currency)
    setTone(notes.length ? 'error' : 'info')
    setStatus(notes.length ? notes.join(' ') : `${label} Revísalos antes de guardar.`)
  }

  async function handleFileWithAi(file: File) {
    setStatus('Subiendo y leyendo la factura con IA…')
    const path = await uploadReceipt(file)
    const draft = await readReceiptWithAi(path, categoryNames).catch(() => null)
    onAttached({ path, name: file.name, draft })

    if (draft) {
      showResult(draft, 'Datos extraídos con IA.')
    } else {
      setTone('error')
      setStatus('No pudimos leer la factura con IA. Ingresa los datos manualmente.')
    }
  }

  async function handleFileWithOcr(file: File) {
    const readable = isReadableImage(file)
    setStatus(readable ? 'Leyendo la factura en tu navegador…' : 'Subiendo la factura…')

    const draft = readable ? await readReceipt(file).catch(() => null) : null
    const path = await uploadReceipt(file)
    onAttached({ path, name: file.name, draft })

    if (!readable) {
      setStatus('PDF adjuntado. Usa «Leer con IA» para extraer sus datos.')
      return
    }

    if (!draft) {
      setTone('error')
      setStatus('No pudimos leer la factura. Usa «Leer con IA» o ingresa los datos manualmente.')
      return
    }

    showResult(draft, 'Datos extraídos.')
  }

  async function processFile(file: File) {
    const validationError = validateReceiptFile(file)
    if (validationError) {
      setTone('error')
      setStatus(validationError)
      return
    }

    setIsProcessing(true)
    setTone('info')

    try {
      if (profile.receiptScanner === 'ai') {
        await handleFileWithAi(file)
      } else {
        await handleFileWithOcr(file)
      }
    } catch (err) {
      setTone('error')
      setStatus(err instanceof Error ? err.message : 'No pudimos procesar la factura. Inténtalo de nuevo.')
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (!initialFile || handledFile.current === initialFile) return
    handledFile.current = initialFile
    void processFile(initialFile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFile])

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) await processFile(file)
  }

  async function handleReadWithAi() {
    if (!receiptPath) return

    setIsProcessing(true)
    setTone('info')
    setStatus('Leyendo la factura con IA…')

    try {
      const draft = await readReceiptWithAi(receiptPath, categoryNames)
      onDraft(draft)
      showResult(draft, 'Datos extraídos con IA.')
    } catch (err) {
      setTone('error')
      setStatus(err instanceof Error ? err.message : 'No pudimos leer la factura con IA.')
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="max-w-48 truncate text-xs font-medium text-slate-600">
              {receiptName}
            </span>
            {receiptPath && (
              <Button
                variant="ghost"
                onClick={handleReadWithAi}
                isLoading={isProcessing}
                className="px-2.5 py-1.5 text-xs"
              >
                Leer con IA
              </Button>
            )}
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
