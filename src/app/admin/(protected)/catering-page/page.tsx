import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/admin/shared/page-header';
import { CateringPageForm } from '@/components/admin/catering-page/catering-page-form';
import { CateringEventsTable } from '@/components/admin/catering-events/events-table';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/helpers';
import type { CateringEvent, CateringPageSettings } from '@/types/database';

export default async function CateringPageAdmin() {
  const admin = await requireAdmin();
  const [settings, events] = await Promise.all([
    db.cateringSetting.findFirst() as Promise<CateringPageSettings | null>,
    db.cateringEvent.findMany() as Promise<CateringEvent[]>,
  ]);

  return (
    <div className="space-y-12">
      <div>
        <PageHeader title="Catering Page" />
      </div>

      {/* Events */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-h3 font-semibold text-text-strong">Events</h2>
            <p className="text-caption text-text-tertiary">
              Slides in the &quot;Як виглядають наші заходи&quot; carousel on the catering page.
            </p>
          </div>
          <Button
            render={<Link href="/admin/catering-page/events/new" />}
            variant="default"
            className="rounded-full"
          >
            <Plus className="mr-1 h-4 w-4" />
            New event
          </Button>
        </div>
        <CateringEventsTable events={events} userRole={admin.role as string} />
      </section>

      {/* FAQ */}
      <section>
        <div className="mb-4">
          <h2 className="text-h3 font-semibold text-text-strong">FAQ</h2>
          <p className="text-caption text-text-tertiary">
            Questions &amp; answers shown in the &quot;Поширені запитання&quot; block.
          </p>
        </div>
        <CateringPageForm settings={settings} />
      </section>
    </div>
  );
}
