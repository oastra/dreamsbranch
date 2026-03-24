import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export default function SearchIcon({ size = 20, ...props }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M2.71037 21.84H7.23518V12.6327H11.312L11.76 8.05781H7.23518V5.74737C7.23518 5.44251 7.35436 5.15014 7.56651 4.93457C7.77865 4.719 8.06637 4.59789 8.36639 4.59789H11.76V0H8.36639C6.86632 0 5.42769 0.605525 4.36698 1.68337C3.30627 2.76121 2.71037 4.22307 2.71037 5.74737V8.05781H0.447957L0 12.6327H2.71037V21.84Z"
        fill="currentColor"
      />
    </svg>
  );
}
