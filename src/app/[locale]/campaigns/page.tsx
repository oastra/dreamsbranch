import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations();
  const pageName = 'campaigns';
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
          <p className="text-text-secondary">Content coming in Milestone 1</p>
        </div>
      </section>
    </>
  );
}
