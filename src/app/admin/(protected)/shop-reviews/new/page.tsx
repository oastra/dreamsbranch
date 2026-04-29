import { PageHeader } from '@/components/admin/shared/page-header';
import { ShopReviewForm } from '@/components/admin/shop-reviews/shop-review-form';

export default function NewShopReviewPage() {
  return (
    <div>
      <PageHeader title="New Review" />
      <ShopReviewForm />
    </div>
  );
}
