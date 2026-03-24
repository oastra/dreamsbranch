import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export default function TikTokIcon({ size = 24, ...props }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" {...props}>
      <path
        d="M34 10c2 2 4 3 6 3v6c-3 0-6-1-8-3v11a10 10 0 11-8-10v6a4 4 0 104 4V10h6z"
        fill="currentColor"
      />
    </svg>
  );
}
