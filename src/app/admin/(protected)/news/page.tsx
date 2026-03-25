import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/helpers';
import { PageHeader } from '@/components/admin/shared/page-header';
import { NewsTable } from '@/components/admin/news/news-table';

export default async function NewsPage() {
  const admin = await requireAdmin();
  const articles = await db.newsArticle.findMany();
  return (
    <div>
      <PageHeader title="News" createHref="/admin/news/new" createLabel="New Article" />
      <NewsTable articles={articles as never} userRole={admin.role as string} />
    </div>
  );
}
