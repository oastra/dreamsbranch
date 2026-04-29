import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/helpers';
import { PageHeader } from '@/components/admin/shared/page-header';
import { ShopReviewsTable } from '@/components/admin/shop-reviews/shop-reviews-table';

export default async function ShopReviewsPage() {
  const admin = await requireAdmin();
  const reviews = await db.shopReview.findMany();
  return (
    <div>
      <PageHeader
        title="Shop Reviews"
        description="Customer testimonials shown on shop catalog pages."
        createHref="/admin/shop-reviews/new"
        createLabel="New Review"
      />
      <ShopReviewsTable reviews={reviews as never} userRole={admin.role as string} />
    </div>
  );
}
