import { PageHeader } from '@/components/admin/shared/page-header';
import { CateringEventForm } from '@/components/admin/catering-events/event-form';

export default function NewCateringEventPage() {
  return (
    <div>
      <PageHeader title="New Event" />
      <CateringEventForm />
    </div>
  );
}
