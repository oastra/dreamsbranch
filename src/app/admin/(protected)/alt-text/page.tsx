import { requireAdmin } from '@/lib/auth/helpers';
import { PageHeader } from '@/components/admin/shared/page-header';
import { db } from '@/lib/db';
import { getAltTextBacklog } from '@/lib/alt-text/backlog';
import { AltTextQueue } from '@/components/admin/alt-text/alt-text-queue';
import type { ImageAltTextRow } from '@/lib/alt-text/types';

// Always read fresh — the queue shrinks as rows are approved/rejected and grows
// when the batch agent runs.
export const dynamic = 'force-dynamic';

export default async function AltTextPage() {
  await requireAdmin();

  const [pending, backlog] = await Promise.all([
    db.imageAltText.findMany({ where: { status: 'pending' } }),
    getAltTextBacklog(),
  ]);

  return (
    <div>
      <PageHeader
        title="Alt Text Review"
        description="AI-generated bilingual alt text awaiting approval. Edit anything that's off, then approve — only approved text appears on the public site."
      />
      <AltTextQueue pending={pending as ImageAltTextRow[]} backlogCount={backlog.length} />
    </div>
  );
}
