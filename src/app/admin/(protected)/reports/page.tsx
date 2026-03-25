import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/helpers';
import { PageHeader } from '@/components/admin/shared/page-header';
import { ReportsTable } from '@/components/admin/reports/reports-table';

export default async function ReportsPage() {
  const admin = await requireAdmin();
  const reports = await db.report.findMany();
  return (
    <div>
      <PageHeader title="Reports" createHref="/admin/reports/new" createLabel="New Report" />
      <ReportsTable reports={reports as never} userRole={admin.role as string} />
    </div>
  );
}
