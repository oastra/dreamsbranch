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
import { EditedByCell } from '@/components/admin/shared/edited-by-cell';
import { deleteCampaign } from '@/lib/actions/campaigns';
import { formatCurrency } from '@/lib/utils';

interface Campaign {
  id: string;
  title_en: string;
  title_ua?: string;
  goal_amount: number;
  current_amount?: number;
  status: string;
  updated_at?: string | null;
  updated_by_admin_id?: string | null;
}

type StatusFilter = 'ALL' | 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export function CampaignsTable({
  campaigns,
  userRole,
  admins,
}: {
  campaigns: Campaign[];
  userRole: string;
  admins: Record<string, string>;
}) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const canDelete = userRole === 'SUPER_ADMIN';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (!q) return true;
      const hay = `${c.title_en ?? ''} ${c.title_ua ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [campaigns, search, statusFilter]);

  const counts = useMemo(() => {
    const c = { ALL: campaigns.length, DRAFT: 0, ACTIVE: 0, ARCHIVED: 0 } as Record<StatusFilter, number>;
    for (const x of campaigns) {
      if (x.status === 'DRAFT' || x.status === 'ACTIVE' || x.status === 'ARCHIVED') c[x.status]++;
    }
    return c;
  }, [campaigns]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteCampaign(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (result.success) toast.success('Campaign deleted');
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
            placeholder="Search campaigns"
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
              <TableHead>Goal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Edited</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-text-secondary py-8">
                  {campaigns.length === 0 ? 'No campaigns yet' : 'No campaigns match your filters'}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((campaign) => {
              const title = campaign.title_en || campaign.title_ua || '(untitled)';
              return (
                <TableRow key={campaign.id} className="hover:bg-surface-tertiary/40">
                  <TableCell className="font-medium">
                    <Link href={`/admin/campaigns/${campaign.id}`} className="hover:underline">
                      {title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-text-secondary">{formatCurrency(Number(campaign.goal_amount))}</TableCell>
                  <TableCell><StatusBadge status={campaign.status} /></TableCell>
                  <TableCell>
                    <EditedByCell
                      adminId={campaign.updated_by_admin_id}
                      updatedAt={campaign.updated_at}
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
                          <Link href={`/admin/campaigns/${campaign.id}`}><Pencil className="w-4 h-4 mr-2" />Edit</Link>
                        </DropdownMenuItem>
                        {canDelete && (
                          <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(campaign.id)}>
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

      {campaigns.length > 0 && (
        <p className="text-xs text-text-secondary mt-3">
          Showing {filtered.length} of {campaigns.length}
        </p>
      )}

      <DeleteConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleting} itemName="campaign" />
    </>
  );
}
