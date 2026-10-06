import React from 'react';

interface PantsIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  strokeWidth?: number | string;
}

export default function PantsIcon({
  size = 18,
  className = '',
  strokeWidth = 2,
  ...props
}: PantsIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M4 4h16l-1.5 16.5h-4.2l-2.3-9.5-2.3 9.5H5.5L4 4z" />
      <path d="M4.5 8h15" />
      <path d="M12 4v4" />
    </svg>
  );
}
