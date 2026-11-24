import { supabase } from './supabase'

export type CategoryKind = 'income' | 'expense'

export type Category = {
  id: string
  name: string
  kind: CategoryKind
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, kind')
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []) as Category[]
}

export async function createCategory(name: string, kind: CategoryKind): Promise<Category> {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id

  if (!userId) throw new Error('No hay una sesión activa.')

  const { data, error } = await supabase
    .from('categories')
    .insert({ user_id: userId, name: name.trim(), kind })
    .select('id, name, kind')
    .single()

  if (error) throw new Error(error.message)

  return data as Category
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id)

  if (error) throw new Error(error.message)
}
