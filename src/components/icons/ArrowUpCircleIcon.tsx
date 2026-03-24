import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export default function ArrowUpCircleIcon({ size = 48, ...props }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="1" y="1" width="46" height="46" rx="23" stroke="currentColor" strokeWidth="2" />
      <path d="M31 20C30.258 20 29.15 19.267 28.22 18.525C27.02 17.571 25.973 16.431 25.174 15.124C24.575 14.144 24 12.956 24 12M24 12C24 12.956 23.425 14.145 22.826 15.124C22.026 16.431 20.979 17.571 19.781 18.525C18.85 19.267 17.74 20 17 20M24 12V36" stroke="currentColor" />
    </svg>
  );
}
