'use client';
import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Archive, ArchiveRestore, MoreHorizontal, Pencil, Search, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { DeleteConfirmDialog } from '@/components/admin/shared/delete-confirm-dialog';
import { EditedByCell } from '@/components/admin/shared/edited-by-cell';
import { deleteEvent, setEventStatus } from '@/lib/actions/events';

interface Event {
  id: string;
  title_en: string;
  title_ua: string;
  event_date: string | null;
  location: string | null;
  status: string;
  created_at?: string | null;
  created_by_admin_id?: string | null;
  updated_at?: string | null;
  updated_by_admin_id?: string | null;
}

type StatusFilter = 'ALL' | 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export function EventsTable({
  events,
  userRole,
  admins,
}: {
  events: Event[];
  userRole: string;
  admins: Record<string, string>;
}) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [, startTransition] = useTransition();
  const canDelete = userRole === 'SUPER_ADMIN';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((e) => {
      if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
      if (!q) return true;
      const hay = `${e.title_en ?? ''} ${e.title_ua ?? ''} ${e.location ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [events, search, statusFilter]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteEvent(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (result.success) toast.success('Event deleted');
    else toast.error('Failed to delete');
  }

  function handleSetStatus(id: string, next: 'ACTIVE' | 'ARCHIVED') {
    startTransition(async () => {
      const result = await setEventStatus(id, next);
      if (result.success) toast.success(next === 'ARCHIVED' ? 'Event archived' : 'Event restored');
      else toast.error(result.error ?? 'Failed to update status');
    });
  }

  const counts = useMemo(() => {
    const c = { ALL: events.length, DRAFT: 0, ACTIVE: 0, ARCHIVED: 0 } as Record<StatusFilter, number>;
    for (const e of events) {
      if (e.status === 'DRAFT' || e.status === 'ACTIVE' || e.status === 'ARCHIVED') c[e.status]++;
    }
    return c;
  }, [events]);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or location"
            className="pl-8"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <TabsList>
            <TabsTrigger value="ALL">All ({counts.ALL})</TabsTrigger>
            <TabsTrigger value="DRAFT">Draft ({counts.DRAFT})</TabsTrigger>
            <TabsTrigger value="ACTIVE">Active ({counts.ACTIVE})</TabsTrigger>
            <TabsTrigger value="ARCHIVED">Archived ({counts.ARCHIVED})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-32">Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Edited</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-text-secondary py-8">
                  {events.length === 0 ? 'No events yet' : 'No events match your filters'}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((event) => {
              const title = event.title_en || event.title_ua || '(untitled)';
              const isArchived = event.status === 'ARCHIVED';
              return (
                <TableRow key={event.id} className="hover:bg-surface-tertiary/40">
                  <TableCell className="font-medium">
                    <Link href={`/admin/events/${event.id}`} className="hover:underline">
                      {title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {event.event_date
                      ? new Date(event.event_date).toLocaleDateString('en-AU')
                      : '—'}
                  </TableCell>
                  <TableCell className="w-32 max-w-32 truncate text-text-secondary" title={event.location ?? undefined}>
                    {event.location || '—'}
                  </TableCell>
                  <TableCell><StatusBadge status={event.status} /></TableCell>
                  <TableCell>
                    <EditedByCell
                      kind="created"
                      createdBy={event.created_by_admin_id}
                      createdAt={event.created_at}
                      admins={admins}
                    />
                  </TableCell>
                  <TableCell>
                    <EditedByCell
                      kind="edited"
                      createdBy={event.created_by_admin_id}
                      createdAt={event.created_at}
                      updatedBy={event.updated_by_admin_id}
                      updatedAt={event.updated_at}
                      admins={admins}
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/events/${event.id}`}><Pencil className="w-4 h-4 mr-2" />Edit</Link>
                        </DropdownMenuItem>
                        {isArchived ? (
                          <DropdownMenuItem onClick={() => handleSetStatus(event.id, 'ACTIVE')}>
                            <ArchiveRestore className="w-4 h-4 mr-2" />Restore to active
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleSetStatus(event.id, 'ARCHIVED')}>
                            <Archive className="w-4 h-4 mr-2" />Archive
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(event.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {events.length > 0 && (
        <p className="text-xs text-text-secondary mt-3">
          Showing {filtered.length} of {events.length}
        </p>
      )}

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
