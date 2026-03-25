import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/admin/shared/page-header';
import { EventForm } from '@/components/admin/events/event-form';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await db.event.findUnique({ where: { id } });
  if (!event) notFound();
  return (
    <div>
      <PageHeader title="Edit Event" />
      <EventForm event={event as never} />
    </div>
  );
}
