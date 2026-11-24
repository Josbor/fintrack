import { useState } from 'react'
import { Label } from '../atoms/Label'
import { Select } from '../atoms/Select'
import { FormAlert } from '../molecules/FormAlert'
import type { ReceiptScanner } from '../../lib/profile'
import { useProfile } from '../../profile/useProfile'

export function PreferencesPanel() {
  const { profile, isLoading, setReceiptScanner } = useProfile()
  const [error, setError] = useState<string | null>(null)

  async function handleChange(value: ReceiptScanner) {
    setError(null)
    const failure = await setReceiptScanner(value)
    if (failure) setError(failure)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="receipt-scanner">Leer facturas con</Label>
        <Select
          id="receipt-scanner"
          data-tour="scanner-select"
          value={profile.receiptScanner}
          disabled={isLoading}
          onChange={(event) => handleChange(event.target.value as ReceiptScanner)}
        >
          <option value="ocr">OCR en tu navegador (privado, más lento)</option>
          <option value="ai">Inteligencia artificial (Gemini, más rápido)</option>
        </Select>
        <p data-tour="scanner-note" className="text-xs text-slate-400">
          Con IA, la factura se envía a Google para leerla. Con OCR, nunca sale de tu equipo.
        </p>
      </div>

      {error && <FormAlert tone="error">{error}</FormAlert>}
    </div>
  )
}
