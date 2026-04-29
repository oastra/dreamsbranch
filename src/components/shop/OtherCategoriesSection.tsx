import { CategoryCard } from "@/components/shop/CategoryCard";
import HandmadeIcon from "@/components/icons/HandmadeIcon";
import FromUAIcon from "@/components/icons/FromUAIcon";
import FoodIcon from "@/components/icons/FoodIcon";
import FoodPlateIcon from "@/components/icons/FoodPlateIcon";
import type { ShopSection } from "@/types/database";

type OtherSectionKey = ShopSection;

type Props = {
  locale: string;
  currentSection: ShopSection;
  title: string;
  description: string;
  labels: Record<OtherSectionKey, string>;
};

export function OtherCategoriesSection({
  locale,
  currentSection,
  title,
  description,
  labels,
}: Props) {
  const allCards: Array<{
    key: OtherSectionKey;
    href: string;
    bgClass: string;
    hoverBgClass: string;
    activeBgClass: string;
    icon: React.ReactNode;
  }> = [
    {
      key: "handmade",
      href: `/${locale}/shop/handmade`,
      bgClass: "bg-[#FCF3C3]",
      hoverBgClass: "hover:bg-[#FFF0A2]",
      activeBgClass: "active:bg-[#FFE664]",
      icon: <HandmadeIcon size={96} />,
    },
    {
      key: "from_ukraine",
      href: `/${locale}/shop/from-ukraine`,
      bgClass: "bg-[#BDD8F7]",
      hoverBgClass: "hover:bg-[#93C3FA]",
      activeBgClass: "active:bg-[#5DA4F5]",
      icon: <FromUAIcon size={96} />,
    },
    {
      key: "cuisine",
      href: `/${locale}/shop/cuisine`,
      bgClass: "bg-[#CBFACF]",
      hoverBgClass: "hover:bg-[#9FEEA5]",
      activeBgClass: "active:bg-[#68EC73]",
      icon: <FoodIcon size={96} />,
    },
    {
      key: "catering",
      href: `/${locale}/shop#catering`,
      bgClass: "bg-[#DBDDFF]",
      hoverBgClass: "hover:bg-[#B3B6F6]",
      activeBgClass: "active:bg-[#B3B6F6]",
      icon: <FoodPlateIcon size={96} />,
    },
  ];

  const cards = allCards.filter((c) => c.key !== currentSection);

  return (
    <section className="section">
      <div className="container-page">
        <div className="mb-8 text-center lg:mb-10 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 lg:text-left">
          <h2 className="text-h2 font-semibold text-text-strong">{title}</h2>
          <p className="mt-3 whitespace-pre-line text-body text-text-secondary lg:mt-0">
            {description}
          </p>
        </div>

        {/*
          Mobile: vertical stack.
          Tablet: horizontal snap-scroll (flex-row + overflow-x-auto).
          Desktop: 3-col grid (display:grid overrides flex).
        */}
        <div
          className="
            -mx-5 flex flex-col gap-4 px-5
            sm:mx-0 sm:flex-row sm:snap-x sm:snap-mandatory sm:overflow-x-auto sm:px-0 sm:pb-2
            lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:pb-0
          "
        >
          {cards.map((c) => (
            <div
              key={c.key}
              className="sm:w-[280px] sm:shrink-0 sm:snap-start lg:w-auto"
            >
              <CategoryCard
                title={labels[c.key]}
                href={c.href}
                bgClass={c.bgClass}
                hoverBgClass={c.hoverBgClass}
                activeBgClass={c.activeBgClass}
                icon={c.icon}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
