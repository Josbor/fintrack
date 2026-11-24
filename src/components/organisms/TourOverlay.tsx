import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { Button } from '../atoms/Button'
import { Tooltip } from '../molecules/Tooltip'
import type { TourDefinition, TourStep } from '../../tour/types'

type TourOverlayProps = {
  tour: TourDefinition | null
  onClose: () => void
}

type TourRect = {
  top: number
  left: number
  width: number
  height: number
}

const CARD_WIDTH = 340
const CARD_ESTIMATED_HEIGHT = 250
const MARGIN = 16
const GAP = 14

function findTarget(target: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-tour="${target}"]`)
}

function measure(target: string): TourRect | null {
  const element = findTarget(target)
  if (!element) return null

  const rect = element.getBoundingClientRect()
  if (rect.width === 0 && rect.height === 0) return null

  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
}

function getPosition(rect: TourRect | null, placement: TourStep['placement']) {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const width = Math.min(CARD_WIDTH, viewportWidth - MARGIN * 2)

  if (!rect) {
    return {
      width,
      top: Math.max(MARGIN, viewportHeight / 2 - CARD_ESTIMATED_HEIGHT / 2),
      left: Math.max(MARGIN, (viewportWidth - width) / 2),
    }
  }

  const preferred = placement ?? 'bottom'
  let top: number
  let left: number

  if (preferred === 'top' || preferred === 'bottom') {
    left = rect.left + rect.width / 2 - width / 2
    top = preferred === 'top' ? rect.top - GAP - CARD_ESTIMATED_HEIGHT : rect.top + rect.height + GAP

    if (top + CARD_ESTIMATED_HEIGHT > viewportHeight - MARGIN) {
      top = rect.top - GAP - CARD_ESTIMATED_HEIGHT
    }
    if (top < MARGIN) {
      top = Math.min(
        rect.top + rect.height + GAP,
        viewportHeight - CARD_ESTIMATED_HEIGHT - MARGIN,
      )
    }
  } else if (preferred === 'right') {
    left = rect.left + rect.width + GAP
    top = rect.top + rect.height / 2 - CARD_ESTIMATED_HEIGHT / 2
    if (left + width > viewportWidth - MARGIN) left = rect.left - GAP - width
  } else {
    left = rect.left - GAP - width
    top = rect.top + rect.height / 2 - CARD_ESTIMATED_HEIGHT / 2
    if (left < MARGIN) left = rect.left + rect.width + GAP
  }

  left = Math.min(Math.max(left, MARGIN), viewportWidth - width - MARGIN)
  top = Math.min(
    Math.max(top, MARGIN),
    Math.max(MARGIN, viewportHeight - CARD_ESTIMATED_HEIGHT - MARGIN),
  )

  return { width, top, left }
}

export function TourOverlay({ tour, onClose }: TourOverlayProps) {
  if (!tour) return null
  return <TourRunner key={tour.id} tour={tour} onClose={onClose} />
}

function TourRunner({ tour, onClose }: { tour: TourDefinition; onClose: () => void }) {
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState<TourRect | null>(() => measure(tour.steps[0].target))
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  const step = tour.steps[index]
  const isFirst = index === 0
  const isLast = index === tour.steps.length - 1

  const remeasure = useCallback(() => {
    setRect(measure(step.target))
  }, [step.target])

  useLayoutEffect(() => {
    findTarget(step.target)?.scrollIntoView({ block: 'center', inline: 'nearest' })
    const frame = requestAnimationFrame(() => setRect(measure(step.target)))
    return () => cancelAnimationFrame(frame)
  }, [step.target])

  useEffect(() => {
    window.addEventListener('resize', remeasure)
    window.addEventListener('scroll', remeasure, true)
    return () => {
      window.removeEventListener('resize', remeasure)
      window.removeEventListener('scroll', remeasure, true)
    }
  }, [remeasure])

  useEffect(() => {
    dialogRef.current?.focus()
  }, [index])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopImmediatePropagation()
        onClose()
        return
      }
      if (event.key === 'ArrowRight') {
        setIndex((current) => Math.min(current + 1, tour.steps.length - 1))
      }
      if (event.key === 'ArrowLeft') {
        setIndex((current) => Math.max(current - 1, 0))
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [onClose, tour.steps.length])

  const position = getPosition(rect, step.placement)

  return (
    <div className="fixed inset-0 z-[60]" role="presentation">
      <div aria-hidden="true" className="absolute inset-0" />

      {rect ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-2xl ring-2 ring-brand-400/90 transition-[top,left,width,height] duration-200"
          style={{
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
            boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.62)',
          }}
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-slate-950/60" />
      )}

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="absolute max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-white p-5 shadow-card outline-none"
        style={{ top: position.top, left: position.left, width: position.width }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-700">
              {tour.title} · {index + 1}/{tour.steps.length}
            </p>
            <h2
              id={titleId}
              className="mt-1 font-display text-lg font-bold leading-tight text-slate-900"
            >
              {step.title}
            </h2>
          </div>
          <Tooltip label="Cerrar tour">
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar tour"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              ×
            </button>
          </Tooltip>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>

        <div className="mt-4 flex items-center gap-1.5" aria-hidden="true">
          {tour.steps.map((item, dotIndex) => (
            <span
              key={`${item.target}-${dotIndex}`}
              className={`h-1.5 rounded-full transition-all ${
                dotIndex === index ? 'w-5 bg-brand-600' : 'w-1.5 bg-slate-200'
              }`}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 transition hover:text-slate-600"
          >
            Saltar
          </button>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <Button
                variant="ghost"
                size="md"
                onClick={() => setIndex((current) => Math.max(current - 1, 0))}
              >
                Anterior
              </Button>
            )}
            <Button
              size="md"
              onClick={() => {
                if (isLast) onClose()
                else setIndex((current) => Math.min(current + 1, tour.steps.length - 1))
              }}
            >
              {isLast ? 'Finalizar' : 'Siguiente'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
