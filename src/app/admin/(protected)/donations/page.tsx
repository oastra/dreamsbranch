import Link from 'next/link';
import { Plus } from 'lucide-react';
import { db } from '@/lib/db';
import { requireAdmin, canManageFinances } from '@/lib/auth/helpers';
import { PageHeader } from '@/components/admin/shared/page-header';
import { formatCurrency } from '@/lib/utils';
import { DonationsTable } from '@/components/admin/donations/donations-table';

export default async function DonationsPage() {
  const admin = await requireAdmin();
  const canRecord = canManageFinances(admin.role);
  const [donations, total] = await Promise.all([
    db.donation.findMany({ take: 200 }),
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
      <DonationsTable donations={donations as never} />
    </div>
  );
}
