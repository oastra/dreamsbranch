import { useTranslations } from "next-intl";

function CheckIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className="mt-0.5 h-5 w-5 shrink-0 text-success"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m4 11 4 4 8-9" />
    </svg>
  );
}

function Bullet() {
  return (
    <span
      aria-hidden
      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-text-strong"
    />
  );
}

/**
 * Static info blocks shown on every active event page (UA + EN). Content is
 * intentionally not per-event — it's the standard "what / who / why" pitch.
 */
export function EventInfoBlocks() {
  const t = useTranslations("events");
  const whatItems = t.raw("info_what_items") as string[];
  const whoItems = t.raw("info_who_items") as string[];
  const whyItems = t.raw("info_why_items") as string[];

  return (
    <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-6">
      {/* What — pale blue */}
      <div className="rounded-2xl bg-secondary-10 p-6 lg:p-8">
        <h3 className="mb-4 text-h3 font-semibold text-text-strong">
          {t("what_will_be")}
        </h3>
        <ul className="space-y-2 text-body text-text-strong">
          {whatItems.map((item, i) => (
            <li key={i} className="flex gap-3">
              <Bullet />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Who — pale green */}
      <div className="rounded-2xl bg-accent-3 p-6 lg:p-8">
        <h3 className="mb-4 text-h3 font-semibold text-text-strong">
          {t("who_can_join")}
        </h3>
        <p className="mb-3 text-body font-medium text-text-strong">
          {t("info_who_intro")}
        </p>
        <ul className="space-y-2 text-body text-text-strong">
          {whoItems.map((item, i) => (
            <li key={i} className="flex gap-3">
              <Bullet />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-body font-semibold text-text-strong">
          {t("info_who_outro")}
        </p>
      </div>

      {/* Why — white card with checkmarks + yellow CTA */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 lg:p-8">
        <h3 className="text-h3 font-semibold text-text-strong">
          {t("why_come")}
        </h3>
        <ul className="space-y-2.5 text-body text-text-strong">
          {whyItems.map((item, i) => (
            <li key={i} className="flex gap-3">
              <CheckIcon />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto rounded-xl bg-primary-20 p-4 text-center text-body text-text-strong">
          {t("info_cta")}
        </div>
      </div>
    </div>
  );
}
