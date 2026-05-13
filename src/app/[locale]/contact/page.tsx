import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import FacebookIcon from "@/components/icons/FacebookIcon";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHeroHeading } from "@/components/shared/PageHeroHeading";

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
      <section className="py-6 lg:py-8">
        <div className="container-page text-center">
          <PageHeroHeading title={t("title")} titleClassName="mb-title-gap" />
          <p className="text-h3 text-text-primary mx-auto max-w-2xl">
            {t("description")}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 lg:pb-24">
        <div className="container-page">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            {/* Left: contact info + photo */}
            <div className="flex flex-col">
              <div className="mb-4">
                <p className="text-subheading mb-1.5 font-medium text-text-strong">
                  {t("our_email")}
                </p>
                <a
                  href="mailto:dreamsbranch@gmail.com"
                  className="text-h2 font-medium text-grey-80 hover:underline"
                >
                  dreamsbranch@gmail.com
                </a>
              </div>

              <div className="mb-6">
                <p className="text-subheading mb-1.5 font-medium text-text-strong">
                  {t("our_socials")}
                </p>
                <Link
                  href="https://www.facebook.com/profile.php?id=100092434277929"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-grey-10 transition-colors "
                >
                  <FacebookIcon className="h-6 w-6 text-grey-100  hover:text-secondary-120" />
                </Link>
              </div>

              <div className="relative mt-2 aspect-4/3 h-72.75 overflow-hidden rounded-2xl">
                <Image
                  src="/images/contact/contact-photo.webp"
                  alt="Dreams Branch of UWAA team"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
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
