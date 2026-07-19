import { supabase } from './supabase'

export const getAdminUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('admins').select('*').eq('user_id', user.id).single()
  return data ? user : null
}

export const signOut = () => supabase.auth.signOut()
