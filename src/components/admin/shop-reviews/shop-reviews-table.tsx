'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { MoreHorizontal, Pencil, Star, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { DeleteConfirmDialog } from '@/components/admin/shared/delete-confirm-dialog';
import { deleteShopReview } from '@/lib/actions/shop-reviews';

interface Row {
  id: string;
  name_ua: string;
  name_en: string;
  role_ua: string | null;
  role_en: string | null;
  rating: number;
  avatar: string | null;
  status: string;
  sort_order: number;
}

export function ShopReviewsTable({ reviews, userRole }: { reviews: Row[]; userRole: string }) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const canDelete = userRole === 'SUPER_ADMIN';

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteShopReview(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (result.success) toast.success('Review deleted');
    else toast.error('Failed to delete');
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-text-secondary">
                  No reviews yet
                </TableCell>
              </TableRow>
            )}
            {reviews.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  {r.avatar ? (
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-grey-40">
                      <Image src={r.avatar} alt={r.name_en} fill sizes="40px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-grey-40" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{r.name_en}</TableCell>
                <TableCell className="text-text-secondary">{r.role_en ?? '—'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-[#FFE766] text-[#FFE766]" aria-hidden />
                    <span>{r.rating}</span>
                  </div>
                </TableCell>
                <TableCell>{r.sort_order}</TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/shop-reviews/${r.id}`}>
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
        itemName="review"
      />
    </>
  );
}
