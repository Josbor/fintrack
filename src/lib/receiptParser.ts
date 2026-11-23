import type { ReceiptDraft } from './receipts'

const CURRENCY_CODES = ['USD', 'EUR', 'MXN', 'PEN', 'COP', 'CLP', 'ARS', 'VES'] as const
const AMOUNT_PATTERN = /\d{1,3}(?:[.,' ]\d{3})+(?:[.,]\d{2})?|\d+[.,]\d{2}|\d+/g

function parseAmount(token: string) {
  const cleaned = token.replace(/\s/g, '')
  const decimal = cleaned.match(/[.,](\d{2})$/)

  if (decimal) {
    const integerPart = cleaned.slice(0, -3).replace(/[.,']/g, '')
    return Number(`${integerPart}.${decimal[1]}`)
  }

  return Number(cleaned.replace(/[.,']/g, ''))
}

function findTotal(lines: string[]) {
  const totalLines = lines.filter(
    (line) => /total/i.test(line) && !/sub\s?total/i.test(line) && !/\bkg\b/i.test(line),
  )

  for (let index = totalLines.length - 1; index >= 0; index -= 1) {
    const matches = totalLines[index].match(AMOUNT_PATTERN)
    if (!matches) continue

    const value = parseAmount(matches[matches.length - 1])
    if (Number.isFinite(value) && value > 0) return value
  }

  return null
}

function findDate(text: string) {
  const iso = text.match(/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/)
  if (iso) return toIsoDate(iso[1], iso[2], iso[3])

  const local = text.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4}|\d{2})\b/)
  if (local) {
    const year = local[3].length === 2 ? `20${local[3]}` : local[3]
    return toIsoDate(year, local[2], local[1])
  }

  return null
}

function toIsoDate(year: string, month: string, day: string) {
  const y = Number(year)
  const m = Number(month)
  const d = Number(day)
  const date = new Date(Date.UTC(y, m - 1, d))

  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return null
  }

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function findCurrency(text: string) {
  const code = CURRENCY_CODES.find((item) => new RegExp(`\\b${item}\\b`).test(text))
  if (code) return code
  if (/€/.test(text)) return 'EUR'
  if (/\bS\/\.?/.test(text)) return 'PEN'
  if (/\bBs\.?/.test(text)) return 'VES'
  return null
}

const NON_MERCHANT_WORDS =
  /factura|ticket|recibo|receipt|invoice|total|fecha|date|rfc|ruc|nit|rif|cliente|vendedor|telf|direc|nota de entrega|forma/i

function findMerchant(lines: string[]) {
  const candidate = lines.find(
    (line) => /[a-zA-ZáéíóúñÁÉÍÓÚÑ]{3,}/.test(line) && !NON_MERCHANT_WORDS.test(line),
  )

  return candidate ? candidate.slice(0, 60) : null
}

export function parseReceiptText(text: string, ocrConfidence: number): ReceiptDraft {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const amount = findTotal(lines)
  const date = findDate(text)
  const merchant = findMerchant(lines)

  let confidence: ReceiptDraft['confidence'] = 'low'
  if (amount !== null && ocrConfidence >= 80 && date) confidence = 'high'
  else if (amount !== null && ocrConfidence >= 60) confidence = 'medium'

  return {
    amount,
    currency: findCurrency(text),
    date,
    merchant,
    description: merchant ? `Compra en ${merchant}` : null,
    category: null,
    confidence,
  }
}
