import Link from 'next/link';
import { Plus } from 'lucide-react';
import { db } from '@/lib/db';
import { requireAdmin, canManageFinances } from '@/lib/auth/helpers';
import { PageHeader } from '@/components/admin/shared/page-header';
import { formatCurrency } from '@/lib/utils';
import { DonationsTable } from '@/components/admin/donations/donations-table';

const PER_PAGE = 25;

type SP = { page?: string; status?: string; source?: string };

export default async function DonationsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const admin = await requireAdmin();
  const canRecord = canManageFinances(admin.role);
  const sp = await searchParams;

  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const status = sp.status ?? 'ALL';
  const source = sp.source ?? 'ALL';

  const where: Record<string, unknown> = {};
  if (status !== 'ALL') where.status = status;
  if (source !== 'ALL') where.source = source;

  const [donations, total, totalAll, completedSum] = await Promise.all([
    db.donation.findMany({
      where,
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    db.donation.count({ where }),
    db.donation.count(),
    db.donation.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
  ]);

  const totalRaised = completedSum._sum.amount?.toNumber() ?? 0;

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
      <DonationsTable
        donations={donations as never}
        page={page}
        perPage={PER_PAGE}
        total={total}
        totalAll={totalAll}
        statusFilter={status}
        sourceFilter={source}
      />
    </div>
  );
}
