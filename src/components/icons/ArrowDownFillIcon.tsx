import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export default function ArrowDownFillIcon({ size = 24, ...props }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 16L18 10H6L12 16Z" fill="currentColor" />
    </svg>
  );
}
