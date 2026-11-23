import { useState } from 'react'
import { Button } from '../atoms/Button'
import { Label } from '../atoms/Label'
import { Select } from '../atoms/Select'
import { createCategory, type Category, type CategoryKind } from '../../lib/categories'

type CategoryFieldProps = {
  kind: CategoryKind
  categories: Category[]
  value: string
  onChange: (categoryId: string) => void
  onCategoryCreated: (category: Category) => void
}

export function CategoryField({
  kind,
  categories,
  value,
  onChange,
  onCategoryCreated,
}: CategoryFieldProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const available = categories.filter((item) => item.kind === kind)

  async function handleCreate() {
    const name = newName.trim()

    if (!name) {
      setError('Escribe un nombre para la categoría.')
      return
    }

    setError(null)
    setIsSaving(true)

    try {
      const created = await createCategory(name, kind)
      onCategoryCreated(created)
      onChange(created.id)
      setNewName('')
      setIsCreating(false)
    } catch {
      setError('No pudimos crear la categoría. Inténtalo de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="transaction-category">Categoría</Label>
        {!isCreating && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="text-xs font-semibold text-brand-700 hover:text-brand-800"
          >
            + Nueva
          </button>
        )}
      </div>

      <Select
        id="transaction-category"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Sin categoría</option>
        {available.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>

      {isCreating && (
        <div className="space-y-2 pt-1">
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Nombre de la categoría"
              maxLength={40}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
            />
            <Button size="md" onClick={handleCreate} isLoading={isSaving}>
              Crear
            </Button>
          </div>
          {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
        </div>
      )}
    </div>
  )
}
