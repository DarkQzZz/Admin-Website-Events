import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/use-events'
import { useUpdateEventStatus } from '@/hooks/use-dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, MoreVertical, Edit, Trash, Play, SquareSquare, ChevronRight, Archive, Trophy, Search, Vote } from 'lucide-react'
import { format } from 'date-fns'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'

const MotionTableRow = motion(TableRow)

const statusMap: Record<string, { label: string, variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  'draft': { label: 'Draft', variant: 'outline' },
  'submission_open': { label: 'Submissions Open', variant: 'default' },
  'submission_closed': { label: 'Submissions Closed', variant: 'secondary' },
  'voting_open': { label: 'Voting Open', variant: 'default' },
  'voting_closed': { label: 'Voting Closed', variant: 'secondary' },
  'results_published': { label: 'Results Published', variant: 'outline' },
  'archived': { label: 'Archived', variant: 'secondary' }
}

export default function EventsPage() {
  const { data: events, isLoading } = useEvents()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground mt-1">Manage competitions, themes, and timelines.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New Event
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead className="text-right">Submissions</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-8 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                    </TableRow>
                  ))
                ) : events?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No events found. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence>
                    {events?.map((event, i) => (
                      <EventRow 
                        key={event.id} 
                        event={event} 
                        index={i} 
                        onEdit={() => { setSelectedEvent(event); setIsCreateOpen(true); }}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EventDialog 
        open={isCreateOpen} 
        onOpenChange={(v) => { setIsCreateOpen(v); if(!v) setSelectedEvent(null); }} 
        initialData={selectedEvent} 
      />
    </div>
  )
}

function EventRow({ event, index, onEdit }: { event: any, index: number, onEdit: () => void }) {
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null)
  const updateStatus = useUpdateEventStatus()
  const deleteEvent = useDeleteEvent()
  const { toast } = useToast()

  const handleStatusChange = async () => {
    if (!confirmStatus) return
    try {
      await updateStatus.mutateAsync({ id: event.id, status: confirmStatus })
      toast({ title: "Status updated", description: `Event is now ${statusMap[confirmStatus]?.label}` })
      setConfirmStatus(null)
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this event? This cannot be undone.")) {
      try {
        await deleteEvent.mutateAsync(event.id)
        toast({ title: "Event deleted" })
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" })
      }
    }
  }

  return (
    <>
      <MotionTableRow initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="group">
        <TableCell>
          <div className="flex flex-col">
            <span className="font-medium">{event.title}</span>
            <span className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">{event.description}</span>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={statusMap[event.status]?.variant || 'default'}>
            {statusMap[event.status]?.label || event.status}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="text-sm text-muted-foreground flex flex-col">
            <span>{event.start_date ? format(new Date(event.start_date), 'MMM d, yyyy') : 'TBD'} -</span>
            <span>{event.end_date ? format(new Date(event.end_date), 'MMM d, yyyy') : 'TBD'}</span>
          </div>
        </TableCell>
        <TableCell className="text-right font-medium">
          {event.submissions?.[0]?.count || 0}
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={onEdit}><Edit className="h-4 w-4 mr-2" /> Edit Details</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Status Controls</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setConfirmStatus('submission_open')} disabled={event.status === 'submission_open'}><Play className="h-4 w-4 mr-2" /> Open Submissions</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setConfirmStatus('submission_closed')} disabled={event.status === 'submission_closed'}><SquareSquare className="h-4 w-4 mr-2" /> Close Submissions</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setConfirmStatus('voting_open')} disabled={event.status === 'voting_open'}><Vote className="h-4 w-4 mr-2" /> Open Voting</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setConfirmStatus('voting_closed')} disabled={event.status === 'voting_closed'}><SquareSquare className="h-4 w-4 mr-2" /> Close Voting</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setConfirmStatus('results_published')} disabled={event.status === 'results_published'}><Trophy className="h-4 w-4 mr-2" /> Publish Results</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setConfirmStatus('archived')} disabled={event.status === 'archived'}><Archive className="h-4 w-4 mr-2" /> Archive Event</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive"><Trash className="h-4 w-4 mr-2" /> Delete Event</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </MotionTableRow>

      <Dialog open={!!confirmStatus} onOpenChange={(v) => !v && setConfirmStatus(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Event Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the status to <strong>{confirmStatus ? statusMap[confirmStatus]?.label : ''}</strong>?
              This will instantly affect what users see on the public website.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmStatus(null)}>Cancel</Button>
            <Button onClick={handleStatusChange} disabled={updateStatus.isPending}>
              {updateStatus.isPending ? 'Updating...' : 'Confirm Change'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function EventDialog({ open, onOpenChange, initialData }: { open: boolean, onOpenChange: (v: boolean) => void, initialData: any }) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const { toast } = useToast()

  // Reset when opened
  if (open && initialData && title === '' && initialData.title !== '') {
    setTitle(initialData.title)
    setDescription(initialData.description || '')
  }

  const handleSave = async () => {
    try {
      if (initialData) {
        await updateEvent.mutateAsync({ id: initialData.id, data: { title, description } })
        toast({ title: "Event updated" })
      } else {
        await createEvent.mutateAsync({ title, description, status: 'draft' })
        toast({ title: "Event created" })
      }
      onOpenChange(false)
      setTitle('')
      setDescription('')
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Event' : 'Create Event'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update event details below.' : 'Configure a new competition event.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Summer Showcase 2024" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Event rules, theme description, etc." className="h-32" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={createEvent.isPending || updateEvent.isPending || !title}>
            Save Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
