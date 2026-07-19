import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useUsers, useUpdateUserStatus } from '@/hooks/use-users'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, ShieldAlert, ShieldCheck, Mail, Calendar, Image as ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'

const MotionTableRow = motion(TableRow)

export default function UsersPage() {
  const { data: users, isLoading } = useUsers()
  const [search, setSearch] = useState('')

  const filteredUsers = users?.filter(user => 
    user.username?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1">Manage platform members and permissions.</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by username or email..." 
          className="pl-9 bg-background border-none shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-center">Submissions</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence>
                  {filteredUsers?.map((user, i) => (
                    <UserRow key={user.id} user={user} index={i} />
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

function UserRow({ user, index }: { user: any, index: number }) {
  const updateStatus = useUpdateUserStatus()
  const { toast } = useToast()

  const handleToggleBan = async () => {
    const action = user.is_banned ? 'unban' : 'ban'
    if (confirm(`Are you sure you want to ${action} ${user.username}?`)) {
      try {
        await updateStatus.mutateAsync({ id: user.id, is_banned: !user.is_banned })
        toast({ title: `User ${action}ned successfully` })
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" })
      }
    }
  }

  return (
    <MotionTableRow initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback>{user.username?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium leading-none">{user.username || 'Unknown'}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-3 w-3" /> {user.email || 'No email'}
        </div>
      </TableCell>
      <TableCell className="text-center font-medium">
        <div className="flex items-center justify-center gap-1.5">
          <ImageIcon className="h-3 w-3 text-muted-foreground" /> {user.submission_count || 0}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" /> {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'Unknown'}
        </div>
      </TableCell>
      <TableCell>
        {user.is_banned ? (
          <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">Banned</Badge>
        ) : (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30">Active</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleToggleBan}
          className={user.is_banned ? "text-green-600 hover:text-green-700" : "text-destructive hover:text-destructive"}
        >
          {user.is_banned ? <ShieldCheck className="h-4 w-4 mr-1.5" /> : <ShieldAlert className="h-4 w-4 mr-1.5" />}
          {user.is_banned ? 'Unban' : 'Ban'}
        </Button>
      </TableCell>
    </MotionTableRow>
  )
}
