import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { getAdminUser } from '@/lib/auth'
import { useLocation } from 'wouter'
import { Skeleton } from '@/components/ui/skeleton'

interface AdminAuthContextType {
  user: User | null
  loading: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType>({ user: null, loading: true })

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useLocation()

  useEffect(() => {
    let mounted = true
    const initAuth = async () => {
      try {
        const adminUser = await getAdminUser()
        if (mounted) {
          setUser(adminUser)
          setLoading(false)
          if (!adminUser && location !== '/login') {
             setLocation('/login')
          }
        }
      } catch (err) {
        if (mounted) setLoading(false)
      }
    }
    initAuth()
  }, [location, setLocation])

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
    )
  }

  return (
    <AdminAuthContext.Provider value={{ user, loading }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)
