import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useStats, useSubmissionsPerDay, useRecentSubmissions } from '@/hooks/use-dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { CalendarDays, Image as ImageIcon, Users, Vote, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'wouter'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useStats()
  const { data: submissionsData, isLoading: subChartLoading } = useSubmissionsPerDay()
  const { data: recentSubmissions, isLoading: recentLoading } = useRecentSubmissions()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and recent activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Events" 
          value={stats?.totalEvents} 
          icon={CalendarDays} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Total Submissions" 
          value={stats?.totalSubmissions} 
          icon={ImageIcon} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers} 
          icon={Users} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Total Votes" 
          value={stats?.totalVotes} 
          icon={Vote} 
          loading={statsLoading} 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Submissions (Last 30 Days)</CardTitle>
            <CardDescription>Daily submission volume across all active events.</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            {subChartLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="w-full h-full rounded-xl" />
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={submissionsData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-sm)' }}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Latest artworks awaiting review.</CardDescription>
            </div>
            <Link href="/submissions" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View all <ExternalLink className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto px-6 pb-6">
            <div className="space-y-5">
              {recentLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))
              ) : recentSubmissions?.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No recent submissions found.
                </div>
              ) : (
                recentSubmissions?.map((sub, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={sub.id} 
                    className="flex items-center gap-4"
                  >
                    <div className="h-12 w-12 rounded-md bg-muted overflow-hidden border">
                      {sub.image_url ? (
                        <img src={sub.image_url} alt={sub.title} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground m-auto mt-3" />
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden space-y-1">
                      <p className="text-sm font-medium leading-none truncate">{sub.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {(sub.profiles as any)?.username || 'Unknown user'} • {formatDistanceToNow(new Date(sub.created_at))} ago
                      </p>
                    </div>
                    <div>
                      <Badge variant={sub.status === 'approved' ? 'default' : sub.status === 'pending' ? 'secondary' : 'destructive'} className="capitalize">
                        {sub.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, loading }: { title: string, value?: number, icon: any, loading: boolean }) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16 mt-1" />
        ) : (
          <div className="text-3xl font-bold">{value?.toLocaleString()}</div>
        )}
      </CardContent>
    </Card>
  )
}
