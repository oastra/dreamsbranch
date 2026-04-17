import Link from 'next/link';

interface TransparencyBannerProps {
  title: string;
  description: string;
  cta: string;
  locale: string;
}

export function TransparencyBanner({ title, description, cta, locale }: TransparencyBannerProps) {
  return (
    <section className="bg-secondary py-12 lg:py-16">
      <div className="container-page">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          {/* Icon + text */}
          <div className="flex items-start gap-4">
            {/* Eye icon */}
            <div className="mt-1 flex-shrink-0 text-white/60">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M8 20C8 20 12 12 20 12C28 12 32 20 32 20C32 20 28 28 20 28C12 28 8 20 8 20Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="20" cy="20" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <h2 className="text-h3 font-medium text-white">{title}</h2>
              <p className="mt-1 max-w-xl text-body text-white/80">{description}</p>
            </div>
          </div>

          {/* CTA button */}
          <Link
            href={`/${locale}/reports`}
            className="inline-flex flex-shrink-0 items-center justify-center rounded-full bg-primary px-8 py-2.5 text-body font-medium text-text-strong transition-colors hover:bg-primary-80"
          >
            {cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
