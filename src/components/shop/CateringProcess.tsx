import type { ReactNode } from "react";
import ConsultationIcon from "@/components/icons/ConsultationIcon";
import PreparationIcon from "@/components/icons/PreparationIcon";
import ExecutionIcon from "@/components/icons/ExecutionIcon";
import { SectionHeading } from "@/components/shared/SectionHeading";

interface Step {
  number: string;
  title: string;
  text: string;
  icon: ReactNode;
  bgClass: string;
}

interface Props {
  title: string;
  steps: {
    step1: { title: string; text: string };
    step2: { title: string; text: string };
    step3: { title: string; text: string };
  };
}

export function CateringProcess({ title, steps }: Props) {
  const items: Step[] = [
    {
      number: "01",
      title: steps.step1.title,
      text: steps.step1.text,
      icon: <ConsultationIcon size={80} aria-hidden />,
      bgClass: "bg-[#FCF3C3]",
    },
    {
      number: "02",
      title: steps.step2.title,
      text: steps.step2.text,
      icon: <PreparationIcon size={80} aria-hidden />,
      bgClass: "bg-[#DBDDFF]",
    },
    {
      number: "03",
      title: steps.step3.title,
      text: steps.step3.text,
      icon: <ExecutionIcon size={80} aria-hidden />,
      bgClass: "bg-[#CBFACF]",
    },
  ];

  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading className="mb-8 lg:mb-12">{title}</SectionHeading>
        <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3">
          {items.map((step) => (
            <div
              key={step.number}
              className={`${step.bgClass} relative flex flex-col items-center gap-4 rounded-3xl p-6 pt-14 text-center sm:p-8 sm:pt-16`}
            >
              <span className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white text-body-sm font-semibold text-text-strong sm:left-8 sm:top-8">
                {step.number}
              </span>
              <div className="text-text-strong">{step.icon}</div>
              <h3 className="text-h3 font-semibold text-text-strong">{step.title}</h3>
              <p className="text-body-sm text-text-primary">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
