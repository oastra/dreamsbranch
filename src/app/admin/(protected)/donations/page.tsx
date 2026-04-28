import Link from 'next/link';
import { Plus } from 'lucide-react';
import { db } from '@/lib/db';
import { requireAdmin, canManageFinances } from '@/lib/auth/helpers';
import { PageHeader } from '@/components/admin/shared/page-header';
import { formatCurrency } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/admin/shared/status-badge';

export default async function DonationsPage() {
  const admin = await requireAdmin();
  const canRecord = canManageFinances(admin.role);
  const [donations, total] = await Promise.all([
    db.donation.findMany({ take: 50 }),
    db.donation.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
  ]);

  const totalRaised = total._sum.amount?.toNumber() ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <PageHeader title="Donations" />
        {canRecord && (
          <Link
            href="/admin/donations/new"
            className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-body font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            New donation
          </Link>
        )}
      </div>
      <div className="mb-6 bg-white rounded-xl border border-border p-6 inline-flex flex-col">
        <span className="text-body-sm text-text-secondary">Total raised</span>
        <span className="text-h2 text-brand-blue">{formatCurrency(totalRaised)}</span>
      </div>
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Donor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donations.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-text-secondary py-8">No donations yet</TableCell></TableRow>
            )}
            {(donations as never[]).map((d: never) => {
              const donation = d as Record<string, unknown>;
              return (
                <TableRow key={donation.id as string}>
                  <TableCell className="text-text-secondary text-body-sm">{new Date(donation.created_at as string).toLocaleDateString('en-AU')}</TableCell>
                  <TableCell>{donation.is_anonymous ? 'Anonymous' : (donation.donor_name as string) || '—'}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(Number(donation.amount))}</TableCell>
                  <TableCell className="text-text-secondary">{donation.source as string}</TableCell>
                  <TableCell><StatusBadge status={donation.status as string} /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
