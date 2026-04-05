import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import FacebookIcon from "@/components/icons/FacebookIcon";
import { ContactForm } from "@/components/contact/ContactForm";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <>
      {/* Page header */}
      <section className="py-12 lg:py-16">
        <div className="container-page text-center">
          <p className="text-body-sm mb-3 text-text-secondary">
            Dreams branch of UWAA
          </p>
          <h1 className="text-display mb-6 text-[var(--color-secondary)]">
            {t("title")}
          </h1>
          <p className="text-secondary text-text-secondary mx-auto max-w-2xl">
            {t("description")}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 lg:pb-24">
        <div className="container-page">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            {/* Left: contact info + photo */}
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-body-sm mb-1 font-medium text-text-secondary">
                  {t("our_email")}
                </p>
                <a
                  href="mailto:dreamsbranch@gmail.com"
                  className="text-secondary font-medium text-secondary-120 hover:underline"
                >
                  dreamsbranch@gmail.com
                </a>
              </div>

              <div>
                <p className="text-body-sm mb-2 font-medium text-text-secondary">
                  {t("our_socials")}
                </p>
                <Link
                  href="https://www.facebook.com/profile.php?id=100092434277929"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-10 transition-colors hover:bg-brand-blue-dark"
                >
                  <FacebookIcon className="h-6 w-6 text-grey-100" />
                </Link>
              </div>

              <div className="mt-2 overflow-hidden rounded-2xl">
                <img
                  src="/images/contact/contact-photo.webp"
                  alt="Dreams Branch of UWAA team"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Right: form card */}
            <div className="rounded-2xl bg-secondary-10 p-8 lg:p-10">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
