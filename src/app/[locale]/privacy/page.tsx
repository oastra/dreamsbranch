import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal" });

  return (
    <>
      {/* Hero header */}
      <section className="py-8 lg:py-12">
        <div className="container-page">
          <div className="bg-secondary-10 rounded-3xl px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
            <span className="inline-block bg-accent-1 text-text-primary text-body-sm px-4 py-1.5 rounded-full mb-6">
              {t("last_updated")}
            </span>
            <h1 className="text-display text-text-strong">{t("title")}</h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 lg:pb-24">
        <div className="container-page">
          <div className="max-w-3xl">
            {/* 1. Terms of Use */}
            <div className="mb-12">
              <h2 className="text-h2 text-secondary mb-6">
                1. {t("terms.title")}
              </h2>
              <div className="space-y-5">
                <div>
                  <h3 className="text-body font-medium text-text-strong mb-1.5">
                    {t("terms.general.title")}
                  </h3>
                  <p className="text-body text-text-primary">
                    {t("terms.general.text")}
                  </p>
                </div>
                <div>
                  <h3 className="text-body font-medium text-text-strong mb-1.5">
                    {t("terms.ip.title")}
                  </h3>
                  <p className="text-body text-text-primary">
                    {t("terms.ip.text")}
                  </p>
                </div>
                <div>
                  <h3 className="text-body font-medium text-text-strong mb-1.5">
                    {t("terms.usage.title")}
                  </h3>
                  <p className="text-body text-text-primary">
                    {t("terms.usage.text")}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Privacy Policy */}
            <div className="mb-12">
              <h2 className="text-h2 text-secondary mb-6">
                2. {t("privacy.title")}
              </h2>
              <div className="space-y-5">
                <div>
                  <h3 className="text-body font-medium text-text-strong mb-1.5">
                    {t("privacy.collection.title")}
                  </h3>
                  <p className="text-body text-text-primary">
                    {t("privacy.collection.text")}
                  </p>
                </div>
                <div>
                  <h3 className="text-body font-medium text-text-strong mb-1.5">
                    {t("privacy.usage.title")}
                  </h3>
                  <p className="text-body text-text-primary mb-2">
                    {t("privacy.usage.intro")}
                  </p>
                  <ul className="space-y-1.5 text-body text-text-primary">
                    <li className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-text-primary" />
                      {t("privacy.usage.item_0")}
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-text-primary" />
                      {t("privacy.usage.item_1")}
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-text-primary" />
                      {t("privacy.usage.item_2")}
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-body font-medium text-text-strong mb-1.5">
                    {t("privacy.third_party.title")}
                  </h3>
                  <p className="text-body text-text-primary">
                    {t("privacy.third_party.text")}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Disclaimer */}
            <div className="mb-12">
              <h2 className="text-h2 text-secondary mb-6">
                3. {t("disclaimer.title")}
              </h2>
              <div className="space-y-5">
                <div>
                  <h3 className="text-body font-medium text-text-strong mb-1.5">
                    {t("disclaimer.informational.title")}
                  </h3>
                  <p className="text-body text-text-primary">
                    {t("disclaimer.informational.text")}
                  </p>
                </div>
                <div>
                  <h3 className="text-body font-medium text-text-strong mb-1.5">
                    {t("disclaimer.external.title")}
                  </h3>
                  <p className="text-body text-text-primary">
                    {t("disclaimer.external.text")}
                  </p>
                </div>
                <div>
                  <h3 className="text-body font-medium text-text-strong mb-1.5">
                    {t("disclaimer.liability.title")}
                  </h3>
                  <p className="text-body text-text-primary">
                    {t("disclaimer.liability.text")}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Cookie Policy */}
            <div className="mb-12">
              <h2 className="text-h2 text-secondary mb-6">
                4. {t("cookies.title")}
              </h2>
              <div className="space-y-5">
                <div>
                  <h3 className="text-body font-medium text-text-strong mb-1.5">
                    {t("cookies.what.title")}
                  </h3>
                  <p className="text-body text-text-primary">
                    {t("cookies.what.text")}
                  </p>
                </div>
                <div>
                  <h3 className="text-body font-medium text-text-strong mb-1.5">
                    {t("cookies.how.title")}
                  </h3>
                  <p className="text-body text-text-primary mb-2">
                    {t("cookies.how.intro")}
                  </p>
                  <ul className="space-y-1.5 text-body text-text-primary">
                    <li className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-text-primary" />
                      {t("cookies.how.item_0")}
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-text-primary" />
                      {t("cookies.how.item_1")}
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-body font-medium text-text-strong mb-1.5">
                    {t("cookies.manage.title")}
                  </h3>
                  <p className="text-body text-text-primary">
                    {t("cookies.manage.text")}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact note */}
            <p className="text-body text-text-primary">
              {t("contact_note")}{" "}
              <a
                href="mailto:dreamsbranch@gmail.com"
                className="text-secondary-120 hover:underline"
              >
                dreamsbranch@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
