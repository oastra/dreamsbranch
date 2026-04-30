import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactSection } from "@/components/contact/ContactSection";
import { CardPaymentCard } from "@/components/donate/CardPaymentCard";
import { DonatePageHeader } from "@/components/donate/DonatePageHeader";
import { DonationFormCard } from "@/components/donate/DonationFormCard";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { VolunteerCTA } from "@/components/shared/VolunteerCTA";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("donate.title"),
    description: t("donate.description"),
  };
}

export default async function DonatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  return (
    <>
      <DonatePageHeader
        eyebrow={t("donate.eyebrow")}
        title={t("donate.title")}
        description={t("donate.description")}
      />

      <section className="pb-12 sm:pb-16 lg:pb-20">
        <div className="container-page">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
            <DonationFormCard
              labels={{
                frequencyOnce: t("donate.frequency_once"),
                frequencyMonthly: t("donate.frequency_monthly"),
                amountLabel: t("donate.amount_label"),
                amountCurrency: t("donate.amount_currency"),
                presetAriaTemplate: t("donate.preset_aria", {
                  value: "{value}",
                }),
                monthlyLabel: t("donate.monthly_label"),
                monthlyCancelNote: t("donate.monthly_cancel_note"),
                fastPayTitle: t("donate.fast_pay_title"),
                fastPayPaypalAria: t("donate.fast_pay_paypal_aria"),
                fastPayAppleAria: t("donate.fast_pay_apple_aria"),
                fastPayGoogleAria: t("donate.fast_pay_google_aria"),
              }}
            />

            <CardPaymentCard
              labels={{
                sectionTitle: t("donate.card_section_title"),
                formTitle: t("donate.card_form_title"),
                nameLabel: t("donate.card_name_label"),
                namePlaceholder: t("donate.card_name_placeholder"),
                expiryLabel: t("donate.card_expiry_label"),
                expiryPlaceholder: t("donate.card_expiry_placeholder"),
                numberLabel: t("donate.card_number_label"),
                numberPlaceholder: t("donate.card_number_placeholder"),
                cvvLabel: t("donate.card_cvv_label"),
                cvvPlaceholder: t("donate.card_cvv_placeholder"),
                submit: t("donate.submit"),
                cancel: t("donate.cancel"),
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Volunteer CTA ─────────────────────────────────────── */}
      <VolunteerCTA
        title={t("shared.volunteer_cta.title")}
        description={t("shared.volunteer_cta.description")}
        ctaLabel={t("shared.volunteer_cta.cta")}
        ctaHref={`/${locale}/contact`}
        imageAlt={t("shared.volunteer_cta.image_alt")}
      />

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <SectionHeading align="left" className="mb-10">
            {t("donate.faq.title")}
          </SectionHeading>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <details
                key={n}
                className="group h-fit rounded-2xl border border-border bg-white px-6 py-5 open:border-secondary-10 open:bg-secondary-10"
              >
                <summary className="flex min-h-16.5 cursor-pointer list-none items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-small font-medium text-white">
                      {String(n).padStart(2, "0")}
                    </span>
                    <span className="text-h3 text-text-strong">
                      {t(`donate.faq.q${n}`)}
                    </span>
                  </div>
                  <svg
                    className="h-5 w-5 shrink-0 text-text-secondary transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <p className="mt-4 pl-12 text-body text-text-secondary">
                  {t(`donate.faq.a${n}`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact Section ───────────────────────────────────── */}
      <ContactSection
        title={t("donate.contact_section.title")}
        description={t("donate.contact_section.description")}
      />
    </>
  );
}
