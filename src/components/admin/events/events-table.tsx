'use client';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { DeleteConfirmDialog } from '@/components/admin/shared/delete-confirm-dialog';
import { deleteEvent } from '@/lib/actions/events';

interface Event { id: string; title_en: string; date: string; location: string; status: string; }

export function EventsTable({ events, userRole }: { events: Event[]; userRole: string }) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const canDelete = userRole === 'SUPER_ADMIN';

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteEvent(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (result.success) toast.success('Event deleted');
    else toast.error('Failed to delete');
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-text-secondary py-8">No events yet</TableCell></TableRow>
            )}
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.title_en}</TableCell>
                <TableCell className="text-text-secondary">{event.date ? new Date(event.date).toLocaleDateString('en-AU') : '—'}</TableCell>
                <TableCell className="text-text-secondary">{event.location || '—'}</TableCell>
                <TableCell><StatusBadge status={event.status} /></TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/events/${event.id}`}><Pencil className="w-4 h-4 mr-2" />Edit</Link>
                      </DropdownMenuItem>
                      {canDelete && (
                        <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(event.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        itemName="event"
      />
    </>
  );
}
