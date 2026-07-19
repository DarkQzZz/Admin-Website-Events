import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useEvents } from '@/hooks/use-events'
import { useLeaderboard, useSuspiciousVotes, useDeleteVote } from '@/hooks/use-voting'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, AlertTriangle, Trash, History } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

export default function VotingPage() {
  const { data: events, isLoading: eventsLoading } = useEvents()
  
  // Find active event, fallback to latest
  const activeEvent = events?.find(e => e.status === 'voting_open') || events?.[0]
  const eventId = activeEvent?.id
  
  const { data: leaderboard, isLoading: boardLoading } = useLeaderboard(eventId)
  const { data: suspiciousVotes, isLoading: suspLoading } = useSuspiciousVotes(eventId)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Voting</h1>
          <p className="text-muted-foreground mt-1">Live leaderboard and vote moderation.</p>
        </div>
        {activeEvent && (
          <div className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {activeEvent.title}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-none shadow-sm flex flex-col h-[600px]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" /> Live Leaderboard
                </CardTitle>
                <CardDescription>Rankings calculated by Borda count (3-2-1 points).</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            <Table>
              <TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-10">
                <TableRow>
                  <TableHead className="w-[60px] text-center">Rank</TableHead>
                  <TableHead>Artwork</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead className="text-center">Points</TableHead>
                  <TableHead className="text-right">Votes (1/2/3)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boardLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : leaderboard?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No votes recorded yet for this event.
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence>
                    {leaderboard?.map((entry, i) => (
                      <TableRow as={motion.tr} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} key={entry.id}>
                        <TableCell className="text-center font-bold">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded overflow-hidden bg-muted border flex-shrink-0">
                              {entry.image_url && <img src={entry.image_url} alt="" className="h-full w-full object-cover" />}
                            </div>
                            <span className="font-medium truncate max-w-[150px]">{entry.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{entry.username}</TableCell>
                        <TableCell className="text-center font-bold text-primary">{entry.total_points}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {entry.first_votes} / {entry.second_votes} / {entry.third_votes}
                        </TableCell>
                      </TableRow>
                    ))}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="md:col-span-1 border-none shadow-sm flex flex-col h-[600px]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Suspicious Activity
            </CardTitle>
            <CardDescription>Flagged self-votes or anomalies.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto px-6 pb-6">
            <div className="space-y-4">
              {suspLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))
              ) : suspiciousVotes?.length === 0 ? (
                <div className="text-center py-10 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center mb-3">
                    <History className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Looking good!</p>
                  <p className="text-xs text-muted-foreground mt-1">No suspicious votes detected.</p>
                </div>
              ) : (
                <AnimatePresence>
                  {suspiciousVotes?.map((vote, i) => (
                    <SuspiciousVoteRow key={vote.id} vote={vote} />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SuspiciousVoteRow({ vote }: { vote: any }) {
  const deleteVote = useDeleteVote()
  const { toast } = useToast()

  const handleRemove = async () => {
    try {
      await deleteVote.mutateAsync(vote.id)
      toast({ title: "Vote removed", description: "The leaderboard has been updated." })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex items-start gap-3 p-3 rounded-lg border border-destructive/20 bg-destructive/5">
      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">
          <span className="font-bold">{vote.voter_username}</span> voted for their own sub: <span className="italic">{vote.submission_title}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Rank {vote.rank} • {formatDistanceToNow(new Date(vote.created_at))} ago
        </p>
        <Button variant="outline" size="sm" className="h-7 text-xs mt-2 text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30" onClick={handleRemove} disabled={deleteVote.isPending}>
          {deleteVote.isPending ? 'Removing...' : 'Remove Vote'}
        </Button>
      </div>
    </motion.div>
  )
}
