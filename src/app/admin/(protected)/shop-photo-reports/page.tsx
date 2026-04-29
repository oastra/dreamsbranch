import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/helpers';
import { PageHeader } from '@/components/admin/shared/page-header';
import { PhotoReportsTable } from '@/components/admin/shop-photo-reports/photo-reports-table';

export default async function ShopPhotoReportsPage() {
  const admin = await requireAdmin();
  const reports = await db.shopPhotoReport.findMany();
  return (
    <div>
      <PageHeader
        title="Shop Photo Reports"
        description='"Thank you for helping" carousel on the Shop page.'
        createHref="/admin/shop-photo-reports/new"
        createLabel="New Photo Report"
      />
      <PhotoReportsTable reports={reports as never} userRole={admin.role as string} />
    </div>
  );
}
