import { PageHeader } from '@/components/admin/shared/page-header';
import { EventForm } from '@/components/admin/events/event-form';

export default function NewEventPage() {
  return (
    <div>
      <PageHeader title="New Event" />
      <EventForm />
    </div>
  );
}
