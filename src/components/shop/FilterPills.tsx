"use client";

export type FilterOption = { value: string; label: string };

type Props = {
  options: FilterOption[];
  value: string;
  onChange: (next: string) => void;
  ariaLabel: string;
};

export function FilterPills({ options, value, onChange, ariaLabel }: Props) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="flex flex-wrap gap-4">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center justify-center rounded-[20px] px-8 py-2 text-[18px] leading-[1.2] transition-colors ${
              active
                ? "bg-primary text-text-strong"
                : "bg-accent-1 text-text-strong hover:bg-primary-40"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
