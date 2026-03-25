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
import { deleteReport } from '@/lib/actions/reports';

interface Report { id: string; year: number; title_en: string; pdf_url: string | null; status: string; }

export function ReportsTable({ reports, userRole }: { reports: Report[]; userRole: string }) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const canDelete = userRole === 'SUPER_ADMIN';

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
            {reports.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-text-secondary py-8">No reports yet</TableCell></TableRow>
            )}
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.year}</TableCell>
                <TableCell>{report.title_en}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>
      <DeleteConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleting} itemName="report" />
    </>
  );
}
