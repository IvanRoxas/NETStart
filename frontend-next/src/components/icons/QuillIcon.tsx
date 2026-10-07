import React from 'react';

interface QuillIconProps {
  className?: string;
  size?: number;
}

export default function QuillIcon({ className = "w-6 h-6", size }: QuillIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Quill Feather Silhouette */}
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      {/* Quill Spine / Shaft */}
      <line x1="16" y1="8" x2="2" y2="22" />
      {/* Quill Nib Tip Barbs */}
      <line x1="17.5" y1="15" x2="9" y2="15" />
    </svg>
  );
}
