import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/admin/shared/page-header';
import { CampaignForm } from '@/components/admin/campaigns/campaign-form';

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await db.campaign.findUnique({ where: { id } });
  if (!campaign) notFound();
  return (
    <div>
      <PageHeader title="Edit Campaign" />
      <CampaignForm campaign={campaign as never} />
    </div>
  );
}
