type Props = {
  title: string;
  intro: string;
  reasonsTitle: string;
  reasons: string[];
};

export function ProductMission({ title, intro, reasonsTitle, reasons }: Props) {
  return (
    <section className="pb-12 sm:pb-16 lg:pb-20">
      <div className="container-page">
        <hr className="mb-8 border-border sm:mb-10" />

        <h2 className="text-h2 font-semibold text-text-strong">{title}</h2>

        <p className="mt-4 whitespace-pre-line text-body text-text-primary sm:mt-5">
          {intro}
        </p>

        <h3 className="mt-6 text-body font-semibold text-text-strong sm:mt-8">
          {reasonsTitle}
        </h3>

        <ul className="mt-3 list-disc space-y-2 pl-5 text-body text-text-primary sm:mt-4">
          {reasons.map((reason, i) => (
            <li key={i}>{reason}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
