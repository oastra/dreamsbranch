import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/helpers';
import { PageHeader } from '@/components/admin/shared/page-header';
import { ContactsTable } from '@/components/admin/contacts/contacts-table';

const PER_PAGE = 25;

type SP = { page?: string; status?: string; tag?: string };

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const status = sp.status ?? 'ALL';
  const tag = sp.tag ?? 'ALL';

  const where: Record<string, unknown> = {};
  if (status === 'UNREAD') where.is_read = false;
  if (status === 'READ') where.is_read = true;
  if (tag !== 'ALL') where.tag = tag;

  const [contacts, total, totalUnread, totalAll] = await Promise.all([
    db.contactSubmission.findMany({
      where,
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    db.contactSubmission.count({ where }),
    db.contactSubmission.count({ where: { is_read: false } }),
    db.contactSubmission.count(),
  ]);

  return (
    <div>
      <PageHeader title="Contact Inbox" />
      <ContactsTable
        contacts={contacts as never}
        page={page}
        perPage={PER_PAGE}
        total={total}
        totalAll={totalAll}
        totalUnread={totalUnread}
        statusFilter={status}
        tagFilter={tag}
      />
    </div>
  );
}
