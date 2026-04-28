import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAdmin, canManageFinances } from '@/lib/auth/helpers';
import { PageHeader } from '@/components/admin/shared/page-header';
import {
  ManualDonationForm,
  type CampaignOption,
} from '@/components/admin/donations/manual-donation-form';
import type { Campaign } from '@/types/database';

export default async function NewDonationPage() {
  const admin = await requireAdmin();
  if (!canManageFinances(admin.role)) {
    redirect('/admin/donations');
  }

  // Active first, then archived — both are valid targets for manual entries
  const [active, archived] = await Promise.all([
    db.campaign.findMany({ where: { status: 'ACTIVE' } }),
    db.campaign.findMany({ where: { status: 'ARCHIVED' } }),
  ]);

  const campaigns: CampaignOption[] = [
    ...(active as Campaign[]).map((c) => ({
      id: c.id,
      title: `${c.title_ua} — ACTIVE`,
    })),
    ...(archived as Campaign[]).map((c) => ({
      id: c.id,
      title: `${c.title_ua} — ARCHIVED`,
    })),
  ];

  return (
    <div>
      <PageHeader title="New donation" />
      <ManualDonationForm campaigns={campaigns} />
    </div>
  );
}
