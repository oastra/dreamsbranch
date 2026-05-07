'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { MoreHorizontal, Pencil, Search, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { DeleteConfirmDialog } from '@/components/admin/shared/delete-confirm-dialog';
import { deleteShopPhotoReport } from '@/lib/actions/shop-photo-reports';

interface Row {
  id: string;
  slug: string;
  title_en: string;
  title_ua?: string;
  report_date: string;
  images: unknown[];
  status: string;
}

type StatusFilter = 'ALL' | 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export function PhotoReportsTable({ reports, userRole }: { reports: Row[]; userRole: string }) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const canDelete = userRole === 'SUPER_ADMIN';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (!q) return true;
      const hay = `${r.title_en ?? ''} ${r.title_ua ?? ''} ${r.slug ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [reports, search, statusFilter]);

  const counts = useMemo(() => {
    const c = { ALL: reports.length, DRAFT: 0, ACTIVE: 0, ARCHIVED: 0 } as Record<StatusFilter, number>;
    for (const x of reports) {
      if (x.status === 'DRAFT' || x.status === 'ACTIVE' || x.status === 'ARCHIVED') c[x.status]++;
    }
    return c;
  }, [reports]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteShopPhotoReport(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (result.success) toast.success('Photo report deleted');
    else toast.error('Failed to delete');
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or slug"
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

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Images</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-text-secondary">
                  {reports.length === 0 ? 'No photo reports yet' : 'No photo reports match your filters'}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((r) => {
              const title = r.title_en || r.title_ua || '(untitled)';
              return (
                <TableRow key={r.id} className="hover:bg-surface-tertiary/40">
                  <TableCell className="font-medium">
                    {r.report_date ? new Date(r.report_date).toLocaleDateString('en-AU') : '—'}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/shop-photo-reports/${r.id}`} className="hover:underline">
                      {title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-body-sm text-text-secondary">{r.slug}</TableCell>
                  <TableCell>{Array.isArray(r.images) ? r.images.length : 0}</TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/shop-photo-reports/${r.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />Edit
                          </Link>
                        </DropdownMenuItem>
                        {canDelete && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteId(r.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />Delete
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

      {reports.length > 0 && (
        <p className="text-xs text-text-secondary mt-3">
          Showing {filtered.length} of {reports.length}
        </p>
      )}

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        itemName="photo report"
      />
    </>
  );
}
