import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useSettings() {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
      
      if (error) throw error
      
      const settingsMap = data.reduce((acc, curr) => {
        acc[curr.key] = curr.value
        return acc
      }, {} as Record<string, string>)
      
      return settingsMap
    }
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (settings: Record<string, string>) => {
      const updates = Object.entries(settings).map(([key, value]) => ({ key, value }))
      
      const { error } = await supabase
        .from('settings')
        .upsert(updates, { onConflict: 'key' })
      
      if (error) throw error
      return settings
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] })
    }
  })
}
