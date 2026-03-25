import { PageHeader } from '@/components/admin/shared/page-header';
import { CampaignForm } from '@/components/admin/campaigns/campaign-form';

export default function NewCampaignPage() {
  return (
    <div>
      <PageHeader title="New Campaign" />
      <CampaignForm />
    </div>
  );
}
