"use client";

import { useState, type ReactNode } from "react";

type Tab = "description" | "faq";

type Props = {
  descriptionLabel: string;
  faqLabel: string;
  description: ReactNode;
  faq: ReactNode;
};

export function CampaignTabs({
  descriptionLabel,
  faqLabel,
  description,
  faq,
}: Props) {
  const [active, setActive] = useState<Tab>("description");

  return (
    <div>
      {/* Tabs sit inside their own light-blue capsule, separate from the
          content below. Active = filled blue, idle = soft yellow. */}
      <div className="rounded-[20px] bg-secondary-10 p-3 sm:p-4">
        <div role="tablist" className="flex flex-wrap ">
          <TabButton
            isActive={active === "description"}
            onClick={() => setActive("description")}
            label={descriptionLabel}
          />
          <TabButton
            isActive={active === "faq"}
            onClick={() => setActive("faq")}
            label={faqLabel}
          />
        </div>
      </div>

      <div className="mt-8 lg:mt-10">
        {active === "description" ? description : faq}
      </div>
    </div>
  );
}

function TabButton({
  isActive,
  onClick,
  label,
}: {
  isActive: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={`rounded-t-lg rounded-b-none px-6 py-2 text-body-sm font-medium transition-colors sm:px-8 sm:py-2.5 ${
        isActive
          ? "bg-secondary text-white"
          : "bg-[#FFEF99] text-text-strong hover:opacity-90"
      }`}
    >
      {label}
    </button>
  );
}
