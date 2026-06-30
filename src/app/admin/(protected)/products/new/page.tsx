import { PageHeader } from '@/components/admin/shared/page-header';
import { ProductForm } from '@/components/admin/shop-products/product-form';

export default function NewProductPage() {
  return (
    <div>
      <PageHeader title="New product" />
      <ProductForm />
    </div>
  );
}
