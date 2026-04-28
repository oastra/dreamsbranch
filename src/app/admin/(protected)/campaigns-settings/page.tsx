import { PageHeader } from '@/components/admin/shared/page-header';
import { CampaignsPageForm } from '@/components/admin/campaigns/campaigns-page-form';
import { db } from '@/lib/db';
import type { CampaignsPageSettings } from '@/types/database';

export default async function CampaignsSettingsPage() {
  const settings = (await db.campaignsSetting.findFirst()) as CampaignsPageSettings | null;

  return (
    <div>
      <PageHeader title="Campaigns Page" />
      <CampaignsPageForm settings={settings} />
    </div>
  );
}
