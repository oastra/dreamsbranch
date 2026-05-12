import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/helpers';
import { PageHeader } from '@/components/admin/shared/page-header';
import { EventsTable } from '@/components/admin/events/events-table';

export default async function EventsPage() {
  const admin = await requireAdmin();
  const [events, adminUsers] = await Promise.all([
    db.event.findMany(),
    db.adminUser.findMany(),
  ]);
  const adminsMap = Object.fromEntries(
    (adminUsers as unknown as Array<{ id: string; name: string }>).map((a) => [a.id, a.name]),
  );
  return (
    <div>
      <PageHeader title="Events" createHref="/admin/events/new" createLabel="New Event" />
      <EventsTable events={events as never} userRole={admin.role as string} admins={adminsMap} />
    </div>
  );
}
