import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export default function MenuIcon({ size = 24, ...props }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M4 17.27V16.27H20V17.27H4ZM4 12.5V11.5H20V12.5H4ZM4 7.72998V6.72998H20V7.72998H4Z" fill="currentColor" />
    </svg>
  );
}
