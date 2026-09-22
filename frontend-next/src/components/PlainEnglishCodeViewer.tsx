"use client";

import React from "react";
import SyntaxViewer from "@/components/SyntaxViewer";

interface PlainEnglishCodeViewerProps {
  code: string;
}

export default function PlainEnglishCodeViewer({ code }: PlainEnglishCodeViewerProps) {
  return <SyntaxViewer code={code} mode="pseudocode" />;
}

