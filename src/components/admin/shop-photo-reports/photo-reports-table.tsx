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
import { deleteShopPhotoReport } from '@/lib/actions/shop-photo-reports';

interface Row {
  id: string;
  slug: string;
  title_en: string;
  report_date: string;
  images: unknown[];
  status: string;
}

export function PhotoReportsTable({ reports, userRole }: { reports: Row[]; userRole: string }) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const canDelete = userRole === 'SUPER_ADMIN';

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
            {reports.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-text-secondary">
                  No photo reports yet
                </TableCell>
              </TableRow>
            )}
            {reports.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.report_date}</TableCell>
                <TableCell>{r.title_en}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>
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
