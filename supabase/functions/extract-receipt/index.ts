import { createClient } from 'npm:@supabase/supabase-js@2'
import { encodeBase64 } from 'jsr:@std/encoding@1/base64'

const MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-3.5-flash-lite'
const MAX_BYTES = 8 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const PROMPT = `Extrae los datos de esta factura o recibo.
- amount: el TOTAL pagado (no subtotal ni impuestos por separado), como número positivo.
- currency: código ISO de 3 letras (USD, EUR, MXN, PEN, COP, CLP, ARS, VES) o null si no se ve.
- date: fecha de compra en formato YYYY-MM-DD o null. Las fechas suelen ser día/mes/año.
- merchant: nombre del comercio o null.
- description: descripción corta en español (máximo 60 caracteres).
- category: si una de las categorías disponibles encaja claramente, devuelve exactamente su nombre; si no, null.
- confidence: "high", "medium" o "low" según la legibilidad de la factura.
Si un dato no es legible o no aparece, usa null. No inventes valores.`

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function sanitizeDraft(raw: Record<string, unknown>, categories: string[]) {
  const text = (value: unknown) =>
    typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : null
  const amount = typeof raw.amount === 'number' && raw.amount > 0 ? raw.amount : null
  const currency = typeof raw.currency === 'string' && /^[A-Z]{3}$/.test(raw.currency)
    ? raw.currency
    : null
  const date = typeof raw.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.date)
    ? raw.date
    : null
  const category = typeof raw.category === 'string' &&
    categories.some((item) => item.toLowerCase() === (raw.category as string).toLowerCase())
    ? (raw.category as string)
    : null
  const confidence = ['high', 'medium', 'low'].includes(raw.confidence as string)
    ? (raw.confidence as 'high' | 'medium' | 'low')
    : 'low'

  return {
    amount,
    currency,
    date,
    merchant: text(raw.merchant),
    description: text(raw.description),
    category,
    confidence,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
  )

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return json({ error: 'No autorizado.' }, 401)

  const body = (await req.json().catch(() => null)) as {
    path?: unknown
    categories?: unknown
  } | null

  const path = body?.path
  if (
    typeof path !== 'string' ||
    path.includes('..') ||
    !path.startsWith(`${userData.user.id}/`)
  ) {
    return json({ error: 'Ruta de archivo no válida.' }, 400)
  }

  const categories = Array.isArray(body?.categories)
    ? body.categories.filter((item): item is string => typeof item === 'string').slice(0, 100)
    : []

  const { data: file, error: downloadError } = await supabase.storage
    .from('receipts')
    .download(path)

  if (downloadError || !file) return json({ error: 'No encontramos la factura.' }, 404)
  if (file.size > MAX_BYTES) return json({ error: 'La factura supera 8 MB.' }, 413)
  if (!ALLOWED_TYPES.includes(file.type)) {
    return json({ error: 'Formato no soportado. Usa JPG, PNG, WEBP o PDF.' }, 415)
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) {
    console.error('GEMINI_API_KEY no está configurada')
    return json({ error: 'La lectura con IA no está disponible.' }, 503)
  }

  const prompt = categories.length
    ? `${PROMPT}\nCategorías disponibles: ${categories.join(', ')}`
    : PROMPT

  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: file.type,
                  data: encodeBase64(new Uint8Array(await file.arrayBuffer())),
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              amount: { type: 'NUMBER', nullable: true },
              currency: { type: 'STRING', nullable: true },
              date: { type: 'STRING', nullable: true },
              merchant: { type: 'STRING', nullable: true },
              description: { type: 'STRING', nullable: true },
              category: { type: 'STRING', nullable: true },
              confidence: { type: 'STRING', enum: ['high', 'medium', 'low'] },
            },
            required: ['amount', 'confidence'],
          },
        },
      }),
    },
  )

  if (geminiResponse.status === 429) {
    return json({ error: 'Llegaste al límite de lectura con IA. Inténtalo más tarde.' }, 429)
  }

  if (!geminiResponse.ok) {
    console.error('Gemini respondió', geminiResponse.status, await geminiResponse.text())
    return json({ error: 'No pudimos leer la factura con IA. Ingresa los datos manualmente.' }, 502)
  }

  const result = await geminiResponse.json()
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text

  try {
    const raw = JSON.parse(text) as Record<string, unknown>
    return json({ draft: sanitizeDraft(raw, categories) })
  } catch {
    console.error('Respuesta de Gemini no válida:', text)
    return json({ error: 'No pudimos leer la factura con IA. Ingresa los datos manualmente.' }, 502)
  }
})
