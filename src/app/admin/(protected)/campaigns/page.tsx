import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/helpers';
import { PageHeader } from '@/components/admin/shared/page-header';
import { CampaignsTable } from '@/components/admin/campaigns/campaigns-table';

export default async function CampaignsPage() {
  const admin = await requireAdmin();
  const [campaigns, adminUsers] = await Promise.all([
    db.campaign.findMany(),
    db.adminUser.findMany(),
  ]);
  const adminsMap = Object.fromEntries(
    (adminUsers as unknown as Array<{ id: string; name: string }>).map((a) => [a.id, a.name]),
  );
  return (
    <div>
      <PageHeader title="Campaigns" createHref="/admin/campaigns/new" createLabel="New Campaign" />
      <CampaignsTable campaigns={campaigns as never} userRole={admin.role as string} admins={adminsMap} />
    </div>
  );
}
