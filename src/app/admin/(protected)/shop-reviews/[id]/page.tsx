import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/admin/shared/page-header';
import { ShopReviewForm } from '@/components/admin/shop-reviews/shop-review-form';

export default async function EditShopReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const review = await db.shopReview.findUnique({ where: { id } });
  if (!review) notFound();
  return (
    <div>
      <PageHeader title="Edit Review" />
      <ShopReviewForm review={review as never} />
    </div>
  );
}
