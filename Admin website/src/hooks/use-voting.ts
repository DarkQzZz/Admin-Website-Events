import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useLeaderboard(eventId?: string) {
  return useQuery({
    queryKey: ['admin', 'leaderboard', eventId],
    enabled: !!eventId,
    queryFn: async () => {
      // Supabase RPC or complex query. For this exercise, we can do a simpler join approach or a custom postgres function.
      // However since it's asked to query this way, we'll run a standard select then process in JS or call an RPC.
      // Assuming no RPC for safety in mockup:
      const { data: submissions, error: sErr } = await supabase
        .from('submissions')
        .select('id, title, image_url, status, profiles(username)')
        .eq('event_id', eventId)
        .eq('status', 'approved')

      if (sErr) throw sErr

      const { data: votes, error: vErr } = await supabase
        .from('votes')
        .select('submission_id, rank, voter_id')
      
      if (vErr) throw vErr

      const results = submissions.map(sub => {
        const subVotes = votes.filter(v => v.submission_id === sub.id)
        const first = subVotes.filter(v => v.rank === 1).length
        const second = subVotes.filter(v => v.rank === 2).length
        const third = subVotes.filter(v => v.rank === 3).length
        const total = (first * 3) + (second * 2) + (third * 1)
        
        return {
          id: sub.id,
          title: sub.title,
          image_url: sub.image_url,
          username: (sub.profiles as any)?.username,
          first_votes: first,
          second_votes: second,
          third_votes: third,
          total_points: total
        }
      }).sort((a, b) => b.total_points - a.total_points)

      return results
    }
  })
}

export function useSuspiciousVotes(eventId?: string) {
  return useQuery({
    queryKey: ['admin', 'suspicious-votes', eventId],
    enabled: !!eventId,
    queryFn: async () => {
      // Find votes where voter_id matches submission user_id
      const { data: submissions, error: sErr } = await supabase
        .from('submissions')
        .select('id, user_id, title')
        .eq('event_id', eventId)
      
      if (sErr) throw sErr
      
      const { data: votes, error: vErr } = await supabase
        .from('votes')
        .select('id, submission_id, voter_id, rank, created_at, profiles!votes_voter_id_fkey(username)')
      
      if (vErr) throw vErr

      const suspicious = votes.filter(vote => {
        const sub = submissions.find(s => s.id === vote.submission_id)
        return sub && sub.user_id === vote.voter_id
      }).map(vote => {
        const sub = submissions.find(s => s.id === vote.submission_id)
        return {
          ...vote,
          submission_title: sub?.title,
          voter_username: (vote.profiles as any)?.username
        }
      })

      return suspicious
    }
  })
}

export function useDeleteVote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'leaderboard'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'suspicious-votes'] })
    }
  })
}
