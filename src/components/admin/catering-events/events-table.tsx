'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { MoreHorizontal, Pencil, Search, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeleteConfirmDialog } from '@/components/admin/shared/delete-confirm-dialog';
import { deleteCateringEvent } from '@/lib/actions/catering-events';
import type { CateringEvent } from '@/types/database';

export function CateringEventsTable({
  events,
  userRole,
}: {
  events: CateringEvent[];
  userRole: string;
}) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const canDelete = userRole === 'SUPER_ADMIN';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => {
      const hay =
        `${e.title_en} ${e.title_ua} ${e.location_en} ${e.location_ua}`.toLowerCase();
      return hay.includes(q);
    });
  }, [events, search]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteCateringEvent(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (result.success) toast.success('Event deleted');
    else toast.error('Failed to delete');
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or location"
            className="pl-8"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Cover</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Photos</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-text-secondary">
                  {events.length === 0 ? 'No events yet' : 'No events match your search'}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((e) => {
              const cover = e.images?.[0] ?? null;
              const displayTitle = e.title_en || e.title_ua;
              const altTitle =
                e.title_en && e.title_ua && e.title_en !== e.title_ua
                  ? e.title_ua
                  : null;
              const displayLocation = e.location_en || e.location_ua;
              return (
                <TableRow key={e.id} className="hover:bg-surface-tertiary/40">
                  <TableCell>
                    {cover ? (
                      <div className="relative h-12 w-16 overflow-hidden rounded-md bg-grey-40">
                        <Image
                          src={cover}
                          alt={displayTitle}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-16 rounded-md bg-grey-40" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/catering-page/events/${e.id}`}
                      className="hover:underline"
                    >
                      {displayTitle}
                    </Link>
                    {altTitle && (
                      <span className="block text-xs font-normal text-text-secondary">
                        {altTitle}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {displayLocation || '—'}
                  </TableCell>
                  <TableCell>{e.images?.length ?? 0}</TableCell>
                  <TableCell>{e.sort_order}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/catering-page/events/${e.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {canDelete && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteId(e.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
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
        <p className="mt-3 text-xs text-text-secondary">
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
