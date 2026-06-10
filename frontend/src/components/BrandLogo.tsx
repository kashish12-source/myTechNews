import React from 'react';

interface BrandLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  withBg?: boolean;
}

export default function BrandLogo({ size = '100%', withBg = true, className = '', ...props }: BrandLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      {...props}
    >
      {withBg && <rect width="100" height="100" rx="22" fill="#121c24" />}
      {/* Top orange/yellow shape */}
      <path
        d="M22 14H82V64H64V42H22V14Z"
        fill="#F59E0B"
      />
      {/* Bottom white triangle */}
      <path
        d="M39 68L58 88H39V68Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
