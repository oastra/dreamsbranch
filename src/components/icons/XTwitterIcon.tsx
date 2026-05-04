import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export default function XTwitterIcon({ size = 32, ...props }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M47.9842 24.0008C47.9842 36.1223 39.0016 46.1434 27.3326 47.7696C26.2415 47.921 25.1252 48 23.9921 48C22.6841 48 21.3997 47.8957 20.1489 47.6939C8.72531 45.8542 0 35.9458 0 24.0008C0 10.7459 10.7427 0 23.9938 0C37.2448 0 47.9875 10.7459 47.9875 24.0008H47.9842Z"
        fill="#1C1C1B"
      />
      <path
        d="M9.73104 10.584L20.7966 25.3827L9.66211 37.4151H12.1688L21.9179 26.8811L29.7942 37.4151H38.3228L26.6353 21.7839L36.9997 10.584H34.4931L25.5156 20.2856L18.2613 10.584H9.73271H9.73104ZM13.4162 12.4305H17.3333L34.6343 35.5686H30.7172L13.4162 12.4305Z"
        fill="white"
      />
    </svg>
  );
}
