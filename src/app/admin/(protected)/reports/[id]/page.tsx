import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/admin/shared/page-header';
import { ReportForm } from '@/components/admin/reports/report-form';

export default async function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await db.report.findUnique({ where: { id } });
  if (!report) notFound();
  return (
    <div>
      <PageHeader title="Edit Report" />
      <ReportForm report={report as never} />
    </div>
  );
}
