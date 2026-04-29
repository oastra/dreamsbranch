import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/admin/shared/page-header';
import { PhotoReportForm } from '@/components/admin/shop-photo-reports/photo-report-form';

export default async function EditShopPhotoReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await db.shopPhotoReport.findUnique({ where: { id } });
  if (!report) notFound();
  return (
    <div>
      <PageHeader title="Edit Photo Report" />
      <PhotoReportForm report={report as never} />
    </div>
  );
}
