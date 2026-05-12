import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/helpers';
import { PageHeader } from '@/components/admin/shared/page-header';
import { NewsTable } from '@/components/admin/news/news-table';

export default async function NewsPage() {
  const admin = await requireAdmin();
  const [articles, adminUsers] = await Promise.all([
    db.newsArticle.findMany(),
    db.adminUser.findMany(),
  ]);
  const adminsMap = Object.fromEntries(
    (adminUsers as unknown as Array<{ id: string; name: string }>).map((a) => [a.id, a.name]),
  );
  return (
    <div>
      <PageHeader title="News" createHref="/admin/news/new" createLabel="New Article" />
      <NewsTable articles={articles as never} userRole={admin.role as string} admins={adminsMap} />
    </div>
  );
}
