import { PageHeader } from '@/components/admin/shared/page-header';
import { PhotoReportForm } from '@/components/admin/shop-photo-reports/photo-report-form';

export default function NewShopPhotoReportPage() {
  return (
    <div>
      <PageHeader title="New Photo Report" />
      <PhotoReportForm />
    </div>
  );
}
