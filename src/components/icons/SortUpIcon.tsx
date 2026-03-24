import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export default function SortUpIcon({ size = 24, ...props }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...props}>
      <path d="M7 14l5-5 5 5H7z" fill="currentColor" />
    </svg>
  );
}
