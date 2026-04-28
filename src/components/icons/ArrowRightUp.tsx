import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export default function ArrowDownFillIcon({ size = 24, ...props }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M13 5H19M19 5V11M19 5L5 19"
        stroke="currentColor"
        stroke-width="1.58996"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
