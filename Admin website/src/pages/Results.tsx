import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEvents } from '@/hooks/use-events'
import { useLeaderboard } from '@/hooks/use-voting'
import { useUpdateEventStatus } from '@/hooks/use-dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, Download, Award, Share } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function ResultsPage() {
  const { data: events, isLoading: eventsLoading } = useEvents()
  
  // Find event in voting_closed or results_published
  const targetEvent = events?.find(e => ['voting_closed', 'results_published'].includes(e.status)) || events?.[0]
  const eventId = targetEvent?.id
  
  const { data: leaderboard, isLoading: boardLoading } = useLeaderboard(eventId)
  const updateStatus = useUpdateEventStatus()
  const { toast } = useToast()
  const [publishing, setPublishing] = useState(false)

  const handlePublish = async () => {
    if (!targetEvent) return
    setPublishing(true)
    try {
      await updateStatus.mutateAsync({ id: targetEvent.id, status: 'results_published' })
      toast({ title: "Results Published!", description: "The winners are now visible on the public site." })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setPublishing(false)
    }
  }

  const exportCSV = () => {
    if (!leaderboard) return
    
    const headers = ['Rank', 'Title', 'Artist', 'Total Points', '1st Votes', '2nd Votes', '3rd Votes']
    const rows = leaderboard.map((l, i) => [
      i + 1,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.username}"`,
      l.total_points,
      l.first_votes,
      l.second_votes,
      l.third_votes
    ])
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `results_${targetEvent?.title || 'event'}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (eventsLoading || boardLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  if (!targetEvent) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Trophy className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-bold">No Completed Events</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          Close voting on an active event to generate and view results here.
        </p>
      </div>
    )
  }

  const winners = leaderboard?.slice(0, 3) || []

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Results Generation</h1>
          <p className="text-muted-foreground mt-1">Review winners and publish to the community.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} disabled={!leaderboard?.length}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          {targetEvent.status !== 'results_published' && (
            <Button onClick={handlePublish} disabled={publishing || !winners.length} className="bg-primary hover:bg-primary/90">
              <Share className="h-4 w-4 mr-2" /> Publish Results
            </Button>
          )}
        </div>
      </div>

      {targetEvent.status === 'results_published' && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-4 flex items-center gap-3 text-green-800 dark:text-green-300">
          <Award className="h-5 w-5" />
          <div>
            <p className="font-semibold">Results are live!</p>
            <p className="text-sm opacity-90">The community can now see the winners for {targetEvent.title}.</p>
          </div>
        </div>
      )}

      {!winners.length ? (
        <Card className="border-dashed border-2 bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
            <p className="text-lg font-medium">No results generated yet.</p>
            <p className="text-sm text-muted-foreground">Make sure the event has votes.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3 items-end">
          {/* 2nd Place */}
          {winners[1] && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="order-2 md:order-1">
              <WinnerCard rank={2} item={winners[1]} height="h-[380px]" />
            </motion.div>
          )}
          
          {/* 1st Place */}
          {winners[0] && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="order-1 md:order-2 z-10 relative shadow-2xl shadow-yellow-500/20 rounded-xl">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-950 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider shadow-md">
                Grand Prize
              </div>
              <WinnerCard rank={1} item={winners[0]} height="h-[440px]" highlight />
            </motion.div>
          )}

          {/* 3rd Place */}
          {winners[2] && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="order-3">
              <WinnerCard rank={3} item={winners[2]} height="h-[340px]" />
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

function WinnerCard({ rank, item, height, highlight = false }: { rank: number, item: any, height: string, highlight?: boolean }) {
  const icon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'
  const colors = rank === 1 ? 'border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10' : 
                 rank === 2 ? 'border-slate-300 bg-slate-50/50 dark:bg-slate-800/50' : 
                 'border-amber-700/30 bg-amber-50/50 dark:bg-amber-900/10'

  return (
    <Card className={`overflow-hidden border-2 transition-all hover-elevate ${colors} ${height} flex flex-col`}>
      <div className="relative h-1/2 w-full bg-muted overflow-hidden group">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-500" />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted/80">
            <Trophy className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-2 left-2 text-4xl drop-shadow-md filter">{icon}</div>
      </div>
      <CardContent className="p-6 flex-1 flex flex-col justify-center text-center space-y-4">
        <div>
          <h3 className={`font-bold line-clamp-2 ${highlight ? 'text-2xl' : 'text-xl'}`}>{item.title}</h3>
          <p className="text-muted-foreground mt-1 font-medium">by {item.username}</p>
        </div>
        <div className="mt-auto">
          <div className="inline-flex items-center justify-center bg-background rounded-full px-4 py-1.5 border shadow-sm">
            <span className="font-bold text-primary mr-1">{item.total_points}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Points</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
