'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { MoreHorizontal, Pencil, Search, Star, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  section: string | null;
}

const SECTION_LABELS: Record<string, string> = {
  handmade: 'Handmade',
  from_ukraine: 'From Ukraine',
  cuisine: 'Cuisine',
  catering: 'Catering',
};

type StatusFilter = 'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export function ShopReviewsTable({ reviews, userRole }: { reviews: Row[]; userRole: string }) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const canDelete = userRole === 'SUPER_ADMIN';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (!q) return true;
      const hay = `${r.name_en ?? ''} ${r.name_ua ?? ''} ${r.role_en ?? ''} ${r.role_ua ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [reviews, search, statusFilter]);

  const counts = useMemo(() => {
    const c = { ALL: reviews.length, DRAFT: 0, PUBLISHED: 0, ARCHIVED: 0 } as Record<StatusFilter, number>;
    for (const x of reviews) {
      if (x.status === 'DRAFT' || x.status === 'PUBLISHED' || x.status === 'ARCHIVED') c[x.status]++;
    }
    return c;
  }, [reviews]);

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or role (EN or UA)"
            className="pl-8"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <TabsList>
            <TabsTrigger value="ALL">All ({counts.ALL})</TabsTrigger>
            <TabsTrigger value="DRAFT">Draft ({counts.DRAFT})</TabsTrigger>
            <TabsTrigger value="PUBLISHED">Published ({counts.PUBLISHED})</TabsTrigger>
            <TabsTrigger value="ARCHIVED">Archived ({counts.ARCHIVED})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Show on</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-text-secondary">
                  {reviews.length === 0 ? 'No reviews yet' : 'No reviews match your filters'}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((r) => {
              const displayName = r.name_en || r.name_ua;
              const altName = r.name_en && r.name_ua && r.name_en !== r.name_ua ? r.name_ua : null;
              const displayRole = r.role_en || r.role_ua;
              const altRole = r.role_en && r.role_ua && r.role_en !== r.role_ua ? r.role_ua : null;
              return (
                <TableRow key={r.id} className="hover:bg-surface-tertiary/40">
                  <TableCell>
                    {r.avatar ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-full bg-grey-40">
                        <Image src={r.avatar} alt={displayName} fill sizes="40px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-grey-40" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/admin/shop-reviews/${r.id}`} className="hover:underline">
                      {displayName}
                    </Link>
                    {altName && (
                      <span className="block text-xs font-normal text-text-secondary">{altName}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {displayRole ?? '—'}
                    {altRole && (
                      <span className="block text-xs text-text-secondary/70">{altRole}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-[#FFE766] text-[#FFE766]" aria-hidden />
                      <span>{r.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {r.section ? SECTION_LABELS[r.section] ?? r.section : 'All'}
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
              );
            })}
          </TableBody>
        </Table>
      </div>

      {reviews.length > 0 && (
        <p className="text-xs text-text-secondary mt-3">
          Showing {filtered.length} of {reviews.length}
        </p>
      )}

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
