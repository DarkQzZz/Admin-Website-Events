import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (pErr) throw pErr

      const { data: submissions, error: sErr } = await supabase
        .from('submissions')
        .select('user_id')

      if (sErr) throw sErr

      return profiles.map(p => ({
        ...p,
        submission_count: submissions.filter(s => s.user_id === p.id).length
      }))
    }
  })
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_banned }: { id: string, is_banned: boolean }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_banned })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    }
  })
}
