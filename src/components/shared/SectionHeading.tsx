import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
  eyebrow?: string;
  description?: ReactNode;
  className?: string;
};

export function SectionHeading({
  children,
  as: Tag = "h2",
  align = "center",
  eyebrow,
  description,
  className = "",
}: Props) {
  const alignClass = align === "center" ? "text-center" : "text-left";
  const headingClass =
    Tag === "h1"
      ? "text-display text-secondary"
      : "text-title-tablet text-text-strong";

  return (
    <div className={`flex flex-col gap-3 ${alignClass} ${className}`}>
      {eyebrow && <p className="text-subheading text-text-strong">{eyebrow}</p>}
      <Tag className={headingClass}>{children}</Tag>
      {description && (
        <p className="text-body text-text-primary">{description}</p>
      )}
    </div>
  );
}
