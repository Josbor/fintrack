import { Spinner } from '../atoms/Spinner'

export function FullScreenLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid min-h-dvh place-items-center bg-slate-50"
    >
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Spinner className="text-brand-600" />
        <span className="text-sm font-medium">Cargando…</span>
      </div>
    </div>
  )
}
