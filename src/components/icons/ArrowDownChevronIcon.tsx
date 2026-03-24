import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export default function ArrowDownChevronIcon({ size = 35, ...props }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 35 53" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M27.5832 20.6435C28.1913 19.7176 28.1913 18.2166 27.5832 17.2907C26.9751 16.3649 25.989 16.3649 25.3809 17.2907L17.1383 29.839L8.89577 17.2907C8.2876 16.3649 7.30158 16.3649 6.69342 17.2907C6.08526 18.2166 6.08526 19.7176 6.69342 20.6435L16.0372 34.8681C16.6453 35.794 17.6313 35.794 18.2395 34.8681L27.5832 20.6435Z" fill="currentColor" />
    </svg>
  );
}
