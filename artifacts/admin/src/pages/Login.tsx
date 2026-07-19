import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { useLocation } from 'wouter'
import { Palette, Loader2, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [, setLocation] = useLocation()
  const { toast } = useToast()

  const handleDiscordLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: window.location.origin + import.meta.env.BASE_URL
        }
      })
      if (error) throw error
    } catch (err: any) {
      toast({
        title: 'Authentication failed',
        description: err.message,
        variant: 'destructive'
      })
      setLoading(false)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // Verify the signed-in user is actually in the admins table
      const { data: adminRow } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', data.user.id)
        .single()

      if (!adminRow) {
        await supabase.auth.signOut()
        throw new Error('This account does not have admin access.')
      }

      setLocation('/')
    } catch (err: any) {
      toast({
        title: 'Sign in failed',
        description: err.message,
        variant: 'destructive'
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/30 blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-md border-none shadow-xl relative z-10">
        <CardContent className="pt-10 pb-10 px-8 flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
            <Palette className="h-8 w-8 text-primary-foreground" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome to Artopia</h1>
          <p className="text-muted-foreground mb-8 text-sm">
            Sign in to access the command center.
          </p>

          {!showEmail ? (
            <>
              <Button
                className="w-full h-12 text-md mb-4 bg-[#5865F2] hover:bg-[#4752C4] text-white"
                onClick={handleDiscordLogin}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                Sign in with Discord
              </Button>

              <Button
                variant="ghost"
                className="w-full text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setShowEmail(true)}
              >
                Use email instead
              </Button>
            </>
          ) : (
            <form onSubmit={handleEmailLogin} className="w-full space-y-4 text-left">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 mt-2"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Sign in
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm text-muted-foreground hover:text-foreground"
                onClick={() => { setShowEmail(false); setEmail(''); setPassword('') }}
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Back to Discord sign in
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
