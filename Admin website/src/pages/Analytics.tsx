import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useStats } from '@/hooks/use-dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { HardDrive, Activity, Users, Image as ImageIcon } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))']

// Mock data for charts that would normally come from complex aggregations
const mockEventsData = [
  { name: 'Spring Jam', submissions: 120 },
  { name: 'Summer Heat', submissions: 250 },
  { name: 'Autumn Colors', submissions: 180 },
  { name: 'Winter Frost', submissions: 310 },
  { name: 'New Year', submissions: 210 },
]

const mockStatusData = [
  { name: 'Approved', value: 450 },
  { name: 'Pending', value: 85 },
  { name: 'Rejected', value: 32 },
]

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useStats()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Platform metrics and storage usage.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Users" value={stats?.totalUsers} icon={Users} loading={isLoading} trend="+12% this month" />
        <MetricCard title="Total Artworks" value={stats?.totalSubmissions} icon={ImageIcon} loading={isLoading} trend="+24% this month" />
        <MetricCard title="Total Engagement" value={stats?.totalVotes} icon={Activity} loading={isLoading} trend="Active now" />
        
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">4.2 GB <span className="text-sm text-muted-foreground font-normal">/ 10 GB</span></div>
            <Progress value={42} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Historical Submissions</CardTitle>
            <CardDescription>Volume of entries across recent events.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockEventsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.5)' }} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="submissions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Moderation Status</CardTitle>
            <CardDescription>Breakdown of all submission states.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="h-[300px] w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold">{stats?.totalSubmissions || 0}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Total</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon: Icon, loading, trend }: { title: string, value?: number, icon: any, loading: boolean, trend: string }) {
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
          <>
            <div className="text-3xl font-bold">{value?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{trend}</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
