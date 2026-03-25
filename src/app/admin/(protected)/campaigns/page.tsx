import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/helpers';
import { PageHeader } from '@/components/admin/shared/page-header';
import { CampaignsTable } from '@/components/admin/campaigns/campaigns-table';

export default async function CampaignsPage() {
  const admin = await requireAdmin();
  const campaigns = await db.campaign.findMany();
  return (
    <div>
      <PageHeader title="Campaigns" createHref="/admin/campaigns/new" createLabel="New Campaign" />
      <CampaignsTable campaigns={campaigns as never} userRole={admin.role as string} />
    </div>
  );
}
