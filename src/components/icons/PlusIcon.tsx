import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export default function PlusIcon({ size = 24, ...props }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...props}>
      <path d="M11 4h2v16h-2zM4 11h16v2H4z" fill="currentColor" />
    </svg>
  );
}
