import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import HandmadeIcon from '@/components/icons/HandmadeIcon';
import CursorDonateIcon from '@/components/icons/CursorDonateIcon';
import ShopBasketIcon from '@/components/icons/ShopBasketIcon';
import UserCircleIcon from '@/components/icons/UserCircleIcon';
import LotteryIcon from '@/components/icons/LotteryIcon';

interface SupportSectionProps {
  locale: string;
}

export async function SupportSection({ locale }: SupportSectionProps) {
  const t = await getTranslations({ locale, namespace: 'home.sections' });

  const tiles = [
    {
      title: t('donate'),
      desc: t('donate_desc'),
      href: `/${locale}/campaigns`,
      bg: 'bg-accent-3',
      icon: <CursorDonateIcon size={64} />,
    },
    {
      title: t('shop'),
      desc: t('shop_desc'),
      href: `/${locale}/shop`,
      bg: 'bg-grey-40',
      icon: <ShopBasketIcon size={64} />,
    },
    {
      title: t('volunteer'),
      desc: t('volunteer_desc'),
      href: `/${locale}/contact`,
      bg: 'bg-accent-4',
      icon: <UserCircleIcon size={64} />,
    },
    {
      title: t('auction'),
      desc: t('auction_desc'),
      href: `/${locale}/events`,
      bg: 'bg-accent-5',
      icon: <LotteryIcon size={64} />,
    },
  ];

  return (
    <section className="section bg-white">
      <div className="container-page">
        <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-[auto_1fr]">

          {/* Left: large subscription tile — spans 2 rows on lg */}
          <Link
            href={`/${locale}/contact`}
            className="group relative flex flex-col justify-end overflow-hidden rounded-2xl bg-primary-20 p-8 transition-colors hover:bg-primary-40 lg:row-span-2"
          >
            <h3 className="text-h3 text-text-strong">{t('subscription')}</h3>
            <p className="mt-2 text-body-sm text-text-secondary">{t('subscription_desc')}</p>
            <HandmadeIcon
              size={100}
              className="absolute right-4 bottom-4 text-text-strong opacity-0 transition-opacity duration-300 group-hover:opacity-20"
            />
          </Link>

          {/* Center top: title + description */}
          <div className="flex flex-col justify-center lg:col-span-2">
            <h2 className="text-h2 text-text-strong">{t('support_title')}</h2>
            <p className="mt-4 max-w-2xl text-secondary text-text-secondary">
              {t('support_description')}
            </p>
          </div>

          {/* Bottom: 2×2 tile grid spanning 2 cols */}
          <div className="grid grid-cols-2 gap-4 lg:col-span-2">
            {tiles.map((tile) => (
              <Link
                key={tile.href}
                href={tile.href}
                className={`group relative flex flex-col justify-end overflow-hidden rounded-2xl p-6 transition-opacity hover:opacity-80 ${tile.bg}`}
              >
                <h4 className="text-h4 text-text-strong">{tile.title}</h4>
                <p className="mt-1 text-body-sm text-text-secondary">{tile.desc}</p>
                <span className="absolute right-3 bottom-3 text-text-strong opacity-0 transition-opacity duration-300 group-hover:opacity-20">
                  {tile.icon}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
