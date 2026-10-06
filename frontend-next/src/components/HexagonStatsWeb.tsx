"use client";

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface HexagonStatsWebProps {
  data: {
    subject: string;
    A: number;
    fullMark: number;
  }[];
}

export default function HexagonStatsWeb({ data }: HexagonStatsWebProps) {
  return (
    <div className="w-full h-full relative" style={{ minHeight: '160px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          {/* Hexagonal grid (6 sides) */}
          <PolarGrid gridType="polygon" stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
          
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 'bold' }} 
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
            strokeWidth={3}
            fill="#ff912d" 
            fillOpacity={0.15} 
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
