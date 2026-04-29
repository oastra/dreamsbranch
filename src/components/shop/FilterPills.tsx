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
    <div role="tablist" aria-label={ariaLabel} className="flex flex-wrap gap-3">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`inline-flex h-10 items-center justify-center rounded-full px-5 text-body-sm font-medium transition-colors ${
              active
                ? "bg-primary text-text-strong"
                : "bg-primary-20 text-text-strong hover:bg-primary-40"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
