
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeroHeading } from '@/components/shared/PageHeroHeading';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  return (
    <>
      <section className="page-header">
        <div className="container-page">
          <PageHeroHeading title={t('nav.shop')} tone="dark" />
        </div>
      </section>
      <section className="section">
        <div className="container-page">
          <p className="text-text-secondary">{t('common.coming_soon')}</p>
        </div>
      </section>
    </>
  );
}
