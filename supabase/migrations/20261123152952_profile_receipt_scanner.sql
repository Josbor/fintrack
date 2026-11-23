-- ============================================================
-- FinTrack · Preferencia de lectura de facturas
-- 'ocr' = Tesseract en el navegador (privado) · 'ai' = Gemini (Edge Function)
-- ============================================================

alter table public.profiles
  add column if not exists receipt_scanner text not null default 'ocr'
    check (receipt_scanner in ('ocr', 'ai'));
