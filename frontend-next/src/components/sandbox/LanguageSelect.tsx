"use client";

import React from 'react';
import { LanguageConfig } from '@/lib/sandbox/languages';

interface LanguageSelectProps {
  languages: LanguageConfig[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function LanguageSelect({ languages, selectedId, onSelect }: LanguageSelectProps) {
  return (
    <select
      className="bg-[#150524] border border-white/20 text-white text-sm rounded px-3 py-1.5 focus:outline-none focus:border-orange-500 transition-colors"
      value={selectedId}
      onChange={(e) => onSelect(e.target.value)}
    >
      {languages.map((lang) => (
        <option key={lang.id} value={lang.id}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}
