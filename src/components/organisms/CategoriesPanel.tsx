import { useState, type FormEvent } from 'react'
import { Button } from '../atoms/Button'
import { Input } from '../atoms/Input'
import { Label } from '../atoms/Label'
import { Select } from '../atoms/Select'
import { FormAlert } from '../molecules/FormAlert'
import {
  createCategory,
  deleteCategory,
  type Category,
  type CategoryKind,
} from '../../lib/categories'

type CategoriesPanelProps = {
  categories: Category[]
  onCategoryCreated: (category: Category) => void
  onCategoryDeleted: (categoryId: string) => void
}

const kindLabels: Record<CategoryKind, string> = {
  expense: 'Gastos',
  income: 'Ingresos',
}

const chipClasses: Record<CategoryKind, string> = {
  expense: 'bg-rose-50 text-rose-700 ring-rose-200',
  income: 'bg-brand-50 text-brand-700 ring-brand-200',
}

const removeClasses: Record<CategoryKind, string> = {
  expense: 'text-rose-400 hover:bg-rose-100 hover:text-rose-700',
  income: 'text-brand-400 hover:bg-brand-100 hover:text-brand-800',
}

export function CategoriesPanel({
  categories,
  onCategoryCreated,
  onCategoryDeleted,
}: CategoriesPanelProps) {
  const [name, setName] = useState('')
  const [kind, setKind] = useState<CategoryKind>('expense')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmed = name.trim()

    if (!trimmed) {
      setError('Escribe un nombre para la categoría.')
      return
    }

    const isDuplicate = categories.some(
      (category) =>
        category.kind === kind && category.name.toLowerCase() === trimmed.toLowerCase(),
    )

    if (isDuplicate) {
      setError('Ya tienes una categoría con ese nombre.')
      return
    }

    setError(null)
    setIsSaving(true)

    try {
      const created = await createCategory(trimmed, kind)
      onCategoryCreated(created)
      setName('')
    } catch {
      setError('No pudimos crear la categoría. Inténtalo de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `¿Eliminar la categoría "${category.name}"? Los movimientos que la usen quedarán sin categoría.`,
    )

    if (!confirmed) return

    setError(null)
    setDeletingId(category.id)

    try {
      await deleteCategory(category.id)
      onCategoryDeleted(category.id)
    } catch {
      setError('No pudimos eliminar la categoría. Inténtalo de nuevo.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="space-y-5">
      <div data-tour="categories">
        <h3 className="font-display text-base font-bold text-slate-900">Categorías</h3>
        <p className="text-xs text-slate-500">
          Clasifican tus ingresos y gastos. Necesitas al menos una para registrar movimientos.
        </p>
      </div>

      {categories.length === 0 && (
        <FormAlert tone="info">Aún no tienes categorías. Crea la primera aquí abajo.</FormAlert>
      )}

      <form
        data-tour="category-form"
        onSubmit={handleSubmit}
        className="space-y-3 rounded-xl border border-slate-200 p-3.5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="category-name">Nombre</Label>
            <Input
              id="category-name"
              value={name}
              maxLength={40}
              placeholder="Ej. Comida, Transporte, Salario"
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="space-y-2 sm:w-36">
            <Label htmlFor="category-kind">Tipo</Label>
            <Select
              id="category-kind"
              value={kind}
              onChange={(event) => setKind(event.target.value as CategoryKind)}
            >
              <option value="expense">Gasto</option>
              <option value="income">Ingreso</option>
            </Select>
          </div>

          <Button type="submit" isLoading={isSaving} className="sm:shrink-0">
            Agregar
          </Button>
        </div>

        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      </form>

      <div data-tour="category-list" className="space-y-4">
        {(Object.keys(kindLabels) as CategoryKind[]).map((categoryKind) => {
          const items = categories.filter((category) => category.kind === categoryKind)

          return (
            <div key={categoryKind} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {kindLabels[categoryKind]}
              </p>

              {items.length === 0 ? (
                <p className="text-xs text-slate-400">
                  {categoryKind === 'expense'
                    ? 'Sin categorías de gasto.'
                    : 'Sin categorías de ingreso.'}
                </p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {items.map((category) => (
                    <li
                      key={category.id}
                      className={`inline-flex max-w-full items-center gap-1 rounded-full py-1 pl-3 pr-1 text-xs font-semibold ring-1 ring-inset ${chipClasses[categoryKind]}`}
                    >
                      <span className="min-w-0 truncate">{category.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        disabled={deletingId === category.id}
                        aria-label={`Eliminar categoría ${category.name}`}
                        className={`grid size-5 shrink-0 place-items-center rounded-full text-sm leading-none transition disabled:opacity-50 ${removeClasses[categoryKind]}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
