import { useEffect, useId, type ReactNode } from 'react'
import { SectionTourButton } from './SectionTourButton'
import { Tooltip } from './Tooltip'

type ModalProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  size?: 'md' | 'lg'
  onGuide?: () => void
  guideLabel?: string
}

export function Modal({
  open,
  title,
  onClose,
  children,
  size = 'md',
  onGuide,
  guideLabel = 'Guía',
}: ModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const maxWidth = size === 'lg' ? 'max-w-2xl' : 'max-w-md'

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-card ${maxWidth}`}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 id={titleId} className="font-display text-lg font-bold text-slate-900">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {onGuide && (
              <SectionTourButton label={guideLabel} onClick={onGuide} variant="ghost" />
            )}
            <Tooltip label="Cerrar">
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="grid size-10 place-items-center rounded-xl text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </Tooltip>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
