import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useEvents() {
  return useQuery({
    queryKey: ['admin', 'events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, submissions(count)')
        .order('created_at', { ascending: false })
        
      if (error) throw error
      return data
    }
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (eventData: any) => {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
    }
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const { data: res, error } = await supabase
        .from('events')
        .update(data)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    }
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
    }
  })
}
