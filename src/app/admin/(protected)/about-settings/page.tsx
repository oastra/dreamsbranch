import { PageHeader } from '@/components/admin/shared/page-header';
import { AboutForm } from '@/components/admin/about/about-form';
import { db } from '@/lib/db';
import type { AboutPageSettings } from '@/types/database';

export default async function AboutSettingsPage() {
  const settings = (await db.aboutSetting.findFirst()) as AboutPageSettings | null;

  return (
    <div>
      <PageHeader title="About Page" />
      <AboutForm settings={settings} />
    </div>
  );
}
