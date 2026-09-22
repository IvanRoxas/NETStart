"use client";

import React from 'react';
import SyntaxViewer from '@/components/SyntaxViewer';

interface MarsSyntaxTabProps {
  code: string;
}

export default function MarsSyntaxTab({ code }: MarsSyntaxTabProps) {
  return <SyntaxViewer code={code} mode="html" />;
}

