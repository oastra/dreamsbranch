import { PageHeader } from '@/components/admin/shared/page-header';
import { ArticleForm } from '@/components/admin/news/article-form';

export default function NewArticlePage() {
  return (
    <div>
      <PageHeader title="New Article" />
      <ArticleForm />
    </div>
  );
}
