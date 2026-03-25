import { PageHeader } from '@/components/admin/shared/page-header';
import { ReportForm } from '@/components/admin/reports/report-form';

export default function NewReportPage() {
  return (
    <div>
      <PageHeader title="New Report" />
      <ReportForm />
    </div>
  );
}
