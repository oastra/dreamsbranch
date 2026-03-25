import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/helpers';
import { PageHeader } from '@/components/admin/shared/page-header';
import { ContactsTable } from '@/components/admin/contacts/contacts-table';

export default async function ContactsPage() {
  await requireAdmin();
  const contacts = await db.contactSubmission.findMany();
  return (
    <div>
      <PageHeader title="Contact Inbox" />
      <ContactsTable contacts={contacts as never} />
    </div>
  );
}
