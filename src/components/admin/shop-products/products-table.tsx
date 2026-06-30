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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { DeleteConfirmDialog } from '@/components/admin/shared/delete-confirm-dialog';
import { deleteShopProduct } from '@/lib/actions/shop-products';

interface Row {
  id: string;
  title_ua: string;
  title_en: string;
  section: string;
  price_amount: number;
  price_currency: string;
  cover_image: string | null;
  status: string;
  sort_order: number;
  stock: number | null;
}

const SECTION_LABELS: Record<string, string> = {
  handmade: 'Handmade',
  from_ukraine: 'From Ukraine',
  cuisine: 'Cuisine',
  catering: 'Catering',
};

type StatusFilter = 'ALL' | 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export function ProductsTable({
  products,
  userRole,
}: {
  products: Row[];
  userRole: string;
}) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const canDelete = userRole === 'SUPER_ADMIN';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      if (!q) return true;
      return `${p.title_en ?? ''} ${p.title_ua ?? ''}`.toLowerCase().includes(q);
    });
  }, [products, search, statusFilter]);

  const counts = useMemo(() => {
    const c = { ALL: products.length, DRAFT: 0, ACTIVE: 0, ARCHIVED: 0 } as Record<
      StatusFilter,
      number
    >;
    for (const x of products) {
      if (x.status === 'DRAFT' || x.status === 'ACTIVE' || x.status === 'ARCHIVED')
        c[x.status]++;
    }
    return c;
  }, [products]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteShopProduct(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (result.success) toast.success('Product deleted');
    else toast.error(result.error ?? 'Failed to delete');
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product (EN or UA)"
            className="pl-8"
          />
        </div>
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
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
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-text-secondary"
                >
                  {products.length === 0
                    ? 'No products yet'
                    : 'No products match your filters'}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((p) => {
              const title = p.title_en || p.title_ua;
              const altTitle =
                p.title_en && p.title_ua && p.title_en !== p.title_ua
                  ? p.title_ua
                  : null;
              return (
                <TableRow key={p.id} className="hover:bg-surface-tertiary/40">
                  <TableCell>
                    {p.cover_image ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-grey-40">
                        <Image
                          src={p.cover_image}
                          alt={title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-grey-40" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="hover:underline"
                    >
                      {title}
                    </Link>
                    {altTitle && (
                      <span className="block text-xs font-normal text-text-secondary">
                        {altTitle}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {SECTION_LABELS[p.section] ?? p.section}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {Number(p.price_amount).toFixed(2)} {p.price_currency}
                  </TableCell>
                  <TableCell>
                    {p.stock == null ? (
                      <span className="text-text-secondary">Unlimited</span>
                    ) : p.stock === 0 ? (
                      <span className="font-medium text-red-600">Out</span>
                    ) : (
                      p.stock
                    )}
                  </TableCell>
                  <TableCell>{p.sort_order}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${p.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {canDelete && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteId(p.id)}
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

      {products.length > 0 && (
        <p className="mt-3 text-xs text-text-secondary">
          Showing {filtered.length} of {products.length}
        </p>
      )}

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        itemName="product"
      />
    </>
  );
}
