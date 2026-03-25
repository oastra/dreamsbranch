import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/admin/shared/page-header';
import { ArticleForm } from '@/components/admin/news/article-form';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await db.newsArticle.findUnique({ where: { id } });
  if (!article) notFound();
  return (
    <div>
      <PageHeader title="Edit Article" />
      <ArticleForm article={article as never} />
    </div>
  );
}
