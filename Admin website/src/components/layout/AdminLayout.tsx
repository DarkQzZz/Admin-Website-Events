import { ReactNode } from 'react'
import { Link, useLocation } from 'wouter'
import { 
  LayoutDashboard, 
  CalendarDays, 
  Image as ImageIcon, 
  Vote, 
  Trophy, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Palette
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/auth'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Events', href: '/events', icon: CalendarDays },
  { name: 'Submissions', href: '/submissions', icon: ImageIcon },
  { name: 'Voting', href: '/voting', icon: Vote },
  { name: 'Results', href: '/results', icon: Trophy },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation()
  const { user } = useAdminAuth()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = import.meta.env.BASE_URL + 'login'
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      {/* Sidebar */}
      <div className="hidden w-64 flex-col border-r bg-sidebar md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Palette className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">Artopia Admin</span>
        </div>
        
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-1 px-4">
            {navigation.map((item) => {
              const isActive = location === item.href || 
                (item.href !== '/' && location.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover-elevate",
                    isActive 
                      ? "bg-secondary text-secondary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary uppercase">
                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">
                {user?.user_metadata?.full_name || 'Admin User'}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user?.email}
              </span>
            </div>
            <button 
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-6xl p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
