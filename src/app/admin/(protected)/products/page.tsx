import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/helpers';
import { PageHeader } from '@/components/admin/shared/page-header';
import { ProductsTable } from '@/components/admin/shop-products/products-table';

export default async function ProductsPage() {
  const admin = await requireAdmin();
  const products = await db.shopProduct.findMany();
  return (
    <div>
      <PageHeader
        title="Products"
        description="Items shown in the shop catalog."
        createHref="/admin/products/new"
        createLabel="New product"
      />
      <ProductsTable
        products={products as never}
        userRole={admin.role as string}
      />
    </div>
  );
}
