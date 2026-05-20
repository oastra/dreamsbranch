import { PageHeader } from '@/components/admin/shared/page-header';
import { HomeForm } from '@/components/admin/home/home-form';
import { db } from '@/lib/db';
import type { HomePageSettings } from '@/types/database';

export default async function HomeSettingsPage() {
  const settings = (await db.homeSetting.findFirst()) as HomePageSettings | null;

  return (
    <div>
      <PageHeader title="Home Page" />
      <HomeForm settings={settings} />
    </div>
  );
}
