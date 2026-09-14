import React from 'react';
import { PatternStyleKey } from '../theme.ts';

interface ThemeWatermarkProps {
  pattern: PatternStyleKey;
  isDark?: boolean;
}

export const ThemeWatermark: React.FC<ThemeWatermarkProps> = ({ pattern, isDark = true }) => {
  if (pattern === 'none') return null;

  const strokeColor = isDark ? 'rgba(251, 191, 36, 0.04)' : 'rgba(120, 53, 15, 0.04)';
  const fillColor = isDark ? 'rgba(251, 191, 36, 0.02)' : 'rgba(120, 53, 15, 0.02)';

  if (pattern === 'minimal') {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(${isDark ? '#525252' : '#d4d4d4'} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
    );
  }

  if (pattern === 'lotus') {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 400 400"
          className="w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] max-w-none opacity-40 transition-opacity duration-500"
          fill="none"
        >
          {/* Central Lotus Petals */}
          <path
            d="M200 80 C180 140 180 220 200 280 C220 220 220 140 200 80 Z"
            stroke={strokeColor}
            strokeWidth="1.5"
            fill={fillColor}
          />
          <path
            d="M200 120 C150 160 140 230 180 270 C190 220 195 170 200 120 Z"
            stroke={strokeColor}
            strokeWidth="1.5"
            fill={fillColor}
          />
          <path
            d="M200 120 C250 160 260 230 220 270 C210 220 205 170 200 120 Z"
            stroke={strokeColor}
            strokeWidth="1.5"
            fill={fillColor}
          />
          <path
            d="M200 160 C120 190 100 250 150 280 C170 240 185 200 200 160 Z"
            stroke={strokeColor}
            strokeWidth="1.2"
            fill={fillColor}
          />
          <path
            d="M200 160 C280 190 300 250 250 280 C230 240 215 200 200 160 Z"
            stroke={strokeColor}
            strokeWidth="1.2"
            fill={fillColor}
          />
          {/* Base Water Waves */}
          <path
            d="M120 290 Q200 310 280 290 Q200 320 120 290"
            stroke={strokeColor}
            strokeWidth="1.2"
          />
          <circle cx="200" cy="200" r="160" stroke={strokeColor} strokeWidth="1" strokeDasharray="6 6" />
        </svg>
      </div>
    );
  }

  // Default: Dong Son Drum (Mặt trống đồng Đông Sơn)
  return (
    <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 600 600"
        className="w-[650px] h-[650px] sm:w-[900px] sm:h-[900px] max-w-none opacity-50 transition-opacity duration-700"
        fill="none"
      >
        {/* Concentric rings */}
        <circle cx="300" cy="300" r="280" stroke={strokeColor} strokeWidth="2" />
        <circle cx="300" cy="300" r="260" stroke={strokeColor} strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="300" cy="300" r="235" stroke={strokeColor} strokeWidth="1.5" />
        <circle cx="300" cy="300" r="195" stroke={strokeColor} strokeWidth="1.2" strokeDasharray="3 3" />
        <circle cx="300" cy="300" r="160" stroke={strokeColor} strokeWidth="1.5" />
        <circle cx="300" cy="300" r="120" stroke={strokeColor} strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="300" cy="300" r="80" stroke={strokeColor} strokeWidth="1.5" fill={fillColor} />
        <circle cx="300" cy="300" r="40" stroke={strokeColor} strokeWidth="1.2" />

        {/* Central 14-point Sun / Star */}
        {Array.from({ length: 14 }).map((_, i) => {
          const angle = (i * 360) / 14;
          const rad = (angle * Math.PI) / 180;
          const x1 = 300 + Math.cos(rad) * 40;
          const y1 = 300 + Math.sin(rad) * 40;
          const x2 = 300 + Math.cos(rad) * 78;
          const y2 = 300 + Math.sin(rad) * 78;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}

        {/* Flying Lac Birds ring symbols */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8 + 22.5;
          const rad = (angle * Math.PI) / 180;
          const cx = 300 + Math.cos(rad) * 215;
          const cy = 300 + Math.sin(rad) * 215;
          return (
            <g key={i} transform={`rotate(${angle + 90} ${cx} ${cy})`}>
              <path
                d={`M${cx - 15} ${cy} Q${cx} ${cy - 10} ${cx + 15} ${cy} Q${cx} ${cy - 4} ${cx - 15} ${cy}`}
                stroke={strokeColor}
                strokeWidth="1.2"
                fill={fillColor}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
