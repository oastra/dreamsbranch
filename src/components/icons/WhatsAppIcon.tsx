import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export default function WhatsAppIcon({ size = 24, ...props }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" {...props}>
      <circle cx="24" cy="24" r="24" fill="#25D366" />
      <path
        d="M34 28c-1 2-4 3-6 2-4-2-7-5-9-9-1-2 0-5 2-6l2 2c1 1 1 2 0 3l-1 1c1 2 3 4 5 5l1-1c1-1 2-1 3 0l2 2z"
        fill="white"
      />
    </svg>
  );
}
