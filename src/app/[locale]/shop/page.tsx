
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const pageName = 'shop';
  const titleKey = pageName === 'about' ? 'nav.about' : pageName === 'shop' ? 'nav.shop' : `${pageName}.title`;
  const descKey = `${pageName}.description`;

  return (
    <>
      <section className="page-header">
        <div className="container-page">
          <p className="text-body-sm mb-2 text-white/70">Dreams branch of UWAA</p>
          <h1 className="text-display">{t(titleKey)}</h1>
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
