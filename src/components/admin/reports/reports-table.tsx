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
import { deleteReport } from '@/lib/actions/reports';

interface Report {
  id: string;
  year: number;
  title_en: string;
  title_ua?: string;
  pdf_url: string | null;
  status: string;
}

type StatusFilter = 'ALL' | 'DRAFT' | 'PUBLISHED';

export function ReportsTable({ reports, userRole }: { reports: Report[]; userRole: string }) {
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
      const hay = `${r.title_en ?? ''} ${r.title_ua ?? ''} ${r.year}`.toLowerCase();
      return hay.includes(q);
    });
  }, [reports, search, statusFilter]);

  const counts = useMemo(() => {
    const c = { ALL: reports.length, DRAFT: 0, PUBLISHED: 0 } as Record<StatusFilter, number>;
    for (const x of reports) {
      if (x.status === 'DRAFT' || x.status === 'PUBLISHED') c[x.status]++;
    }
    return c;
  }, [reports]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteReport(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (result.success) toast.success('Report deleted');
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
            placeholder="Search by title or year"
            className="pl-8"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <TabsList>
            <TabsTrigger value="ALL">All ({counts.ALL})</TabsTrigger>
            <TabsTrigger value="DRAFT">Draft ({counts.DRAFT})</TabsTrigger>
            <TabsTrigger value="PUBLISHED">Published ({counts.PUBLISHED})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Year</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>PDF</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-text-secondary py-8">
                  {reports.length === 0 ? 'No reports yet' : 'No reports match your filters'}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((report) => {
              const title = report.title_en || report.title_ua || '(untitled)';
              return (
                <TableRow key={report.id} className="hover:bg-surface-tertiary/40">
                  <TableCell className="font-medium">{report.year}</TableCell>
                  <TableCell>
                    <Link href={`/admin/reports/${report.id}`} className="hover:underline">
                      {title}
                    </Link>
                  </TableCell>
                  <TableCell>{report.pdf_url ? <a href={report.pdf_url} target="_blank" rel="noreferrer" className="text-brand-blue underline text-body-sm">PDF</a> : '—'}</TableCell>
                  <TableCell><StatusBadge status={report.status} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/reports/${report.id}`}><Pencil className="w-4 h-4 mr-2" />Edit</Link>
                        </DropdownMenuItem>
                        {canDelete && (
                          <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(report.id)}>
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

      {reports.length > 0 && (
        <p className="text-xs text-text-secondary mt-3">
          Showing {filtered.length} of {reports.length}
        </p>
      )}

      <DeleteConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleting} itemName="report" />
    </>
  );
}
