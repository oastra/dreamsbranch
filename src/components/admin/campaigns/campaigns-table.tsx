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
import { deleteCampaign } from '@/lib/actions/campaigns';
import { formatCurrency } from '@/lib/utils';

interface Campaign { id: string; title_en: string; goal_amount: number; current_amount?: number; status: string; }

export function CampaignsTable({ campaigns, userRole }: { campaigns: Campaign[]; userRole: string }) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const canDelete = userRole === 'SUPER_ADMIN';

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
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Goal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-text-secondary py-8">No campaigns yet</TableCell></TableRow>
            )}
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.title_en}</TableCell>
                <TableCell className="text-text-secondary">{formatCurrency(Number(campaign.goal_amount))}</TableCell>
                <TableCell><StatusBadge status={campaign.status} /></TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>
      <DeleteConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleting} itemName="campaign" />
    </>
  );
}
