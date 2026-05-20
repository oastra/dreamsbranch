import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/admin/shared/page-header';
import { CateringEventForm } from '@/components/admin/catering-events/event-form';
import type { CateringEvent } from '@/types/database';

export default async function EditCateringEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = (await db.cateringEvent.findUnique({ where: { id } })) as
    | CateringEvent
    | null;
  if (!event) notFound();
  return (
    <div>
      <PageHeader title="Edit Event" />
      <CateringEventForm event={event} />
    </div>
  );
}
