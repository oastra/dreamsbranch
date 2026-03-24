import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export default function FacebookIcon({ size = 24, ...props }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" {...props}>
      <path
        d="M48 24C48 36.12 39.01 46.14 27.34 47.77C26.25 47.92 25.13 48 24 48C22.69 48 21.41 47.9 20.16 47.69C8.73 45.85 0 35.95 0 24C0 10.75 10.75 0 24 0C37.25 0 48 10.75 48 24Z"
        fill="#1877F2"
      />
      <path
        d="M27.34 19.27V24.5H33.81L32.79 31.54H27.34V47.77C26.25 47.92 25.13 48 24 48C22.69 48 21.41 47.9 20.16 47.69V31.54H14.19V24.5H20.16V18.1C20.16 14.13 23.37 10.91 27.34 10.91H33.81V17H29.61C28.36 17 27.34 18.02 27.34 19.27Z"
        fill="white"
      />
    </svg>
  );
}
