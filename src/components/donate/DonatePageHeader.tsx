type Props = {
  eyebrow: string;
  title: string;
  description: string;
};

export function DonatePageHeader({ eyebrow, title, description }: Props) {
  return (
    <header className="pt-6 pb-8 sm:pt-8 lg:pt-12 lg:pb-12">
      <div className="container-page text-center">
        <p className="text-body font-semibold text-text-strong">{eyebrow}</p>
        <h1 className="mt-2 text-display font-bold text-secondary sm:mt-3">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-body text-text-primary sm:mt-6">
          {description}
        </p>
      </div>
    </header>
  );
}
