import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export default function TelegramIcon({ size = 20, ...props }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M16.7011 3.41966L2.52585 8.91423C1.95541 9.1701 1.76248 9.68251 2.38798 9.9606L6.02454 11.1223L14.8173 5.66007C15.2974 5.31716 15.7889 5.4086 15.3659 5.78582L7.81416 12.6588L7.57695 15.5674C7.79667 16.0165 8.19898 16.0186 8.4556 15.7954L10.5449 13.8082L14.1232 16.5016C14.9543 16.9961 15.4065 16.677 15.5853 15.7705L17.9324 4.59957C18.176 3.48379 17.7605 2.99216 16.7011 3.41966Z" fill="currentColor" />
    </svg>
  );
}
