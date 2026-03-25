import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export default function ArrowRightIcon({ size = 36, ...props }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="0.75"
        y="0.75"
        width="34.5"
        height="34.5"
        rx="17.25"
        stroke="CurrentColor"
        strokeWidth="1.5"
      />
      <path
        d="M18 18.5C20.7614 18.5 23 16.2614 23 13.5C23 10.7386 20.7614 8.5 18 8.5C15.2386 8.5 13 10.7386 13 13.5C13 16.2614 15.2386 18.5 18 18.5ZM18 18.5C20.1217 18.5 22.1566 19.3429 23.6569 20.8431C25.1571 22.3434 26 24.3783 26 26.5M18 18.5C15.8783 18.5 13.8434 19.3429 12.3431 20.8431C10.8429 22.3434 10 24.3783 10 26.5"
        stroke="CurrentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
