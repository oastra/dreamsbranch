import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/admin/shared/page-header';
import { ProductForm } from '@/components/admin/shop-products/product-form';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await db.shopProduct.findUnique({ where: { id } });
  if (!product) notFound();
  return (
    <div>
      <PageHeader title="Edit product" />
      <ProductForm product={product as never} />
    </div>
  );
}
