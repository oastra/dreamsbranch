type Size = "sm" | "md";

type Props = {
  size?: Size;
  className?: string;
};

const SIZE_CLASS: Record<Size, string> = {
  sm: "bg-[length:32px_32px]",
  md: "bg-[length:40px_40px]",
};

export function ImagePlaceholder({ size = "sm", className = "" }: Props) {
  return (
    <div
      aria-hidden
      className={`absolute inset-0 bg-[repeating-conic-gradient(#e9e9ea_0%_25%,#f5f5f6_0%_50%)] ${SIZE_CLASS[size]} ${className}`}
    />
  );
}
