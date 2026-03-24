import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export default function InstagramIcon({ size = 24, ...props }: Props) {
  const id = React.useId();

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" {...props}>
      <defs>
        <linearGradient id={id}>
          <stop offset="0%" stopColor="#FAAD4F" />
          <stop offset="50%" stopColor="#DD2A7B" />
          <stop offset="100%" stopColor="#515BD4" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#${id})`} />
      <circle cx="24" cy="24" r="6" fill="white" />
    </svg>
  );
}
