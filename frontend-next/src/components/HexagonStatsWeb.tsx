"use client";

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface HexagonStatsWebProps {
  data: {
    subject: string;
    A: number;
    fullMark: number;
  }[];
  outerRadius?: string | number;
}

const SUBJECT_COLORS: Record<string, { fill: string; glow: string }> = {
  // Logic (Mint / Emerald Green)
  LOG: { fill: '#00ffb3', glow: 'rgba(0, 255, 179, 0.75)' },
  LOGIC: { fill: '#00ffb3', glow: 'rgba(0, 255, 179, 0.75)' },

  // Pattern Recognition (Hot Neon Magenta / Pink)
  PAT: { fill: '#ff2a85', glow: 'rgba(255, 42, 133, 0.75)' },
  PATTERN: { fill: '#ff2a85', glow: 'rgba(255, 42, 133, 0.75)' },

  // Decomposition (Electric Cyan / Aqua)
  DEC: { fill: '#00e5ff', glow: 'rgba(0, 229, 255, 0.75)' },
  DECOMP: { fill: '#00e5ff', glow: 'rgba(0, 229, 255, 0.75)' },
  DECOMPOSITION: { fill: '#00e5ff', glow: 'rgba(0, 229, 255, 0.75)' },

  // Algorithms (Solar Amber / Radiant Gold)
  ALG: { fill: '#ff912d', glow: 'rgba(255, 145, 45, 0.75)' },
  ALGO: { fill: '#ff912d', glow: 'rgba(255, 145, 45, 0.75)' },

  // Syntax (Royal Cyber Blue)
  SYN: { fill: '#3b82f6', glow: 'rgba(59, 130, 246, 0.75)' },
  SYNTAX: { fill: '#3b82f6', glow: 'rgba(59, 130, 246, 0.75)' },

  // Analysis (Rich Cyber Violet / Purple)
  ANA: { fill: '#a855f7', glow: 'rgba(168, 85, 247, 0.75)' },
  ANALYZE: { fill: '#a855f7', glow: 'rgba(168, 85, 247, 0.75)' },
};

export default function HexagonStatsWeb({ data, outerRadius = "72%" }: HexagonStatsWebProps) {
  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-visible">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          cx="50%"
          cy="50%"
          outerRadius={outerRadius}
          data={data}
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          {/* Hexagonal grid (6 sides) */}
          <PolarGrid gridType="polygon" stroke="rgba(255,255,255,0.35)" strokeWidth={1} />

          <PolarAngleAxis
            dataKey="subject"
            tick={({ payload, x, y, cx, cy }: any) => {
              const val = String(payload?.value || '');
              const colorConfig = SUBJECT_COLORS[val.toUpperCase()] || { fill: '#ffffff', glow: 'none' };
              const textAnchor = x > cx + 4 ? 'start' : x < cx - 4 ? 'end' : 'middle';
              const dx = x > cx + 4 ? 2.5 : x < cx - 4 ? -2 : 0;
              const dy = y < cy - 4 ? -2.5 : y > cy + 4 ? 2.5 : 0;
              return (
                <text
                  x={x + dx}
                  y={y + dy}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  fill={colorConfig.fill}
                  fontSize={val.length <= 4 ? 10.5 : val.length > 8 ? 8.5 : 9.5}
                  fontWeight="bold"
                  style={{
                    filter: `drop-shadow(0 0 5px ${colorConfig.glow})`,
                  }}
                  className="select-none font-mono tracking-wider drop-shadow-md"
                >
                  {val}
                </text>
              );
            }}
            tickLine={false}
            axisLine={false}
          />

          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />

          <Radar
            name="Proficiency"
            dataKey="A"
            stroke="#ff912d"
            strokeWidth={2.5}
            fill="#ff912d"
            fillOpacity={0.32}
            dot={{ r: 2.5, fill: '#ff912d', stroke: '#ffffff', strokeWidth: 1.2 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
