import { useEffect, useRef, useState } from 'react'
import { Button } from '../atoms/Button'
import { SettingsIcon } from '../atoms/Icons'
import { Tooltip } from '../molecules/Tooltip'

export type SettingsSection = 'scanner' | 'categories'

type SettingsMenuProps = {
  onSelect: (section: SettingsSection) => void
}

const options: { section: SettingsSection; label: string }[] = [
  { section: 'scanner', label: 'Lector de facturas' },
  { section: 'categories', label: 'Categorías' },
]

export function SettingsMenu({ onSelect }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function handleSelect(section: SettingsSection) {
    setIsOpen(false)
    onSelect(section)
  }

  return (
    <div ref={containerRef} className="relative" data-tour="settings">
      <Tooltip label="Configuración" disabled={isOpen}>
        <Button
          variant="ghost"
          onClick={() => setIsOpen((open) => !open)}
          aria-label="Configuración"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className="px-2.5 whitespace-nowrap sm:px-4"
        >
          <SettingsIcon className="size-5 sm:hidden" />
          <span className="hidden sm:inline">Configuración</span>
        </Button>
      </Tooltip>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-card"
        >
          {options.map((option) => (
            <button
              key={option.section}
              type="button"
              role="menuitem"
              onClick={() => handleSelect(option.section)}
              className="block w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
