import type { ReactNode } from "react";
import { SectionHeading } from "@/components/shared/SectionHeading";

export type ResultStat = {
  /** Big number, e.g. "4", "1 200", "$12 000", "100%". */
  value: string;
  /** Optional secondary unit, e.g. "роки", "заходів". */
  unit?: string;
  /** Caption above the value. */
  label: string;
  /** Desktop card height — kept asymmetric to mirror the about page. */
  heightClass?: string;
};

interface Props {
  title: string;
  description: ReactNode;
  stats: ResultStat[];
  /** Defaults match the about-page treatment. */
  className?: string;
}

export function ResultsSection({
  title,
  description,
  stats,
  className = "",
}: Props) {
  return (
    <section className={`section ${className}`.trim()}>
      <div className="container-page">
        <SectionHeading
          align="left"
          className="mb-10"
          description={description}
        >
          {title}
        </SectionHeading>

        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ value, unit, label, heightClass }) => (
            <div
              key={label}
              className={`flex flex-col justify-between rounded-2xl bg-secondary-10 p-6 text-text-strong ${heightClass ?? ""}`.trim()}
            >
              <p className="text-body text-text-strong">{label}</p>
              <p className="flex items-baseline justify-end gap-2 text-[2.5rem] font-medium leading-none sm:justify-start lg:text-[3rem]">
                {value}
                {unit && (
                  <span className="text-body font-normal text-text-primary">
                    {unit}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
