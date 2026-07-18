import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useSubmissions, useUpdateSubmissionStatus, useDeleteSubmission } from '@/hooks/use-submissions'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Filter, CheckCircle2, XCircle, Trash, Image as ImageIcon, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function SubmissionsPage() {
  const { data: submissions, isLoading } = useSubmissions()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredSubmissions = submissions?.filter(sub => {
    const matchesSearch = sub.title.toLowerCase().includes(search.toLowerCase()) || 
                          ((sub.profiles as any)?.username || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Submissions</h1>
          <p className="text-muted-foreground mt-1">Review and moderate artwork submissions.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by title or artist..." 
            className="pl-9 bg-background border-none shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground ml-1" />
          <select 
            className="h-10 rounded-md border-none bg-background px-3 py-2 text-sm shadow-sm flex-1 sm:w-[150px] outline-none ring-offset-background focus-visible:ring-1 focus-visible:ring-ring"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[80px]">Artwork</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : filteredSubmissions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No submissions found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence>
                  {filteredSubmissions?.map((sub, i) => (
                    <SubmissionRow key={sub.id} sub={sub} index={i} />
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

function SubmissionRow({ sub, index }: { sub: any, index: number }) {
  const updateStatus = useUpdateSubmissionStatus()
  const deleteSub = useDeleteSubmission()
  const { toast } = useToast()
  const [viewImage, setViewImage] = useState(false)

  const handleStatus = async (status: string) => {
    try {
      await updateStatus.mutateAsync({ id: sub.id, status })
      toast({ title: "Status updated", description: `Submission is now ${status}` })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  const handleDelete = async () => {
    if (confirm("Delete this submission permanently?")) {
      try {
        await deleteSub.mutateAsync(sub.id)
        toast({ title: "Submission deleted" })
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" })
      }
    }
  }

  return (
    <>
      <TableRow as={motion.tr} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="group">
        <TableCell>
          <button 
            onClick={() => setViewImage(true)}
            className="h-12 w-12 rounded-md bg-muted overflow-hidden border relative flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            {sub.image_url ? (
              <img src={sub.image_url} alt={sub.title} className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </TableCell>
        <TableCell>
          <span className="font-medium block max-w-[200px] truncate">{sub.title}</span>
          <span className="text-xs text-muted-foreground block max-w-[200px] truncate">{sub.description || 'No description'}</span>
        </TableCell>
        <TableCell className="font-medium text-sm">
          {(sub.profiles as any)?.username || 'Unknown'}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(sub.created_at))} ago
        </TableCell>
        <TableCell>
          <Badge variant={sub.status === 'approved' ? 'default' : sub.status === 'pending' ? 'secondary' : 'destructive'} className="capitalize">
            {sub.status}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {sub.status !== 'approved' && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30" onClick={() => handleStatus('approved')}>
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
            {sub.status !== 'rejected' && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30" onClick={() => handleStatus('rejected')}>
                <XCircle className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={handleDelete}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <Dialog open={viewImage} onOpenChange={setViewImage}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black/95 border-none">
          <DialogHeader className="p-4 absolute top-0 w-full bg-gradient-to-b from-black/80 to-transparent z-10">
            <DialogTitle className="text-white">{sub.title}</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            {sub.image_url ? (
              <img src={sub.image_url} alt={sub.title} className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-white flex flex-col items-center">
                <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
                <p>No image available</p>
              </div>
            )}
          </div>
          <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent z-10 flex justify-between items-center text-white">
            <div className="text-sm">
              <span className="font-semibold">Artist:</span> {(sub.profiles as any)?.username}
            </div>
            {sub.image_url && (
              <Button variant="secondary" size="sm" asChild>
                <a href={sub.image_url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 mr-2" /> Open Original</a>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
