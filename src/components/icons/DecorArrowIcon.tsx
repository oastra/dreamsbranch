import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

export default function DecorArrowIcon({ size = 285, ...props }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 285 285"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_742_6994)">
        <path
          d="M127.343 248.885C115.266 241.976 103.19 235.067 91.1139 228.158C105.048 223.713 118.978 219.258 132.912 214.812"
          stroke="#FFD700"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M117.667 231.364C144.794 235.893 170.581 229.09 188.232 204.293C198.031 190.526 198.867 172.781 195.228 161.606C191.59 150.43 183.806 141.061 175.162 133.099C159.435 118.612 140.366 107.222 119.669 101.55C103.678 97.1696 68.0435 91.0312 60.9553 111.782C55.5786 127.516 70.6171 140.43 83.3917 146.263C98.6793 153.242 115.705 156.414 132.492 155.345C159.354 153.627 198.476 139.546 203.834 109.194C206.802 92.3973 197.324 75.3483 184.075 64.6235C170.825 53.898 154.281 48.2646 138.095 42.9003"
          stroke="#FFD700"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_742_6994">
          <rect
            width="202"
            height="200"
            fill="white"
            transform="translate(137.227 0) rotate(43.3248)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}
