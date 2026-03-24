import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export default function DownArrowIcon({ size = 34, ...props }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M24.7493 19.0918C24.2246 18.5671 23.9594 17.2653 23.8265 16.083C23.6525 14.5599 23.7183 13.0135 24.0775 11.5243C24.3469 10.4078 24.7804 9.16116 25.4564 8.48517M25.4564 8.48517C24.7804 9.16116 23.533 9.59533 22.4172 9.86403C20.9273 10.2225 19.3809 10.2883 17.8592 10.1158C16.6762 9.98212 15.373 9.71554 14.8498 9.19228M25.4564 8.48517L8.4858 25.4557" stroke="currentColor" />
    </svg>
  );
}
