import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const [eventsRes, submissionsRes, usersRes, votesRes, activeEventRes] = await Promise.all([
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('submissions').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('votes').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('*').in('status', ['submission_open', 'voting_open']).order('created_at', { ascending: false }).limit(1).maybeSingle()
      ])
      
      return {
        totalEvents: eventsRes.count || 0,
        totalSubmissions: submissionsRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalVotes: votesRes.count || 0,
        activeEvent: activeEventRes.data
      }
    }
  })
}

export function useSubmissionsPerDay() {
  return useQuery({
    queryKey: ['admin', 'stats', 'submissions-per-day'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { data, error } = await supabase
        .from('submissions')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        
      if (error) throw error
      
      const countsByDay: Record<string, number> = {}
      for (const sub of data) {
        const date = new Date(sub.created_at).toISOString().split('T')[0]
        countsByDay[date] = (countsByDay[date] || 0) + 1
      }
      
      return Object.entries(countsByDay)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
    }
  })
}

export function useRecentSubmissions() {
  return useQuery({
    queryKey: ['admin', 'stats', 'recent-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('id, title, status, created_at, image_url, profiles(username)')
        .order('created_at', { ascending: false })
        .limit(10)
        
      if (error) throw error
      return data
    }
  })
}

export function useUpdateEventStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { data, error } = await supabase
        .from('events')
        .update({ status })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
    }
  })
}
