import React from 'react';
import { getUtilColor } from '@/lib/calculations';

interface UtilBarProps {
  util: number;
  label?: string;
  showPercent?: boolean;
  height?: number;
}

export default function UtilBar({ util, label, showPercent = true, height = 8 }: UtilBarProps) {
  const pct   = Math.min(util * 100, 100);
  const color = getUtilColor(util);

  return (
    <div>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span style={{ fontSize: 12, color: '#656D76' }}>{label}</span>}
          {showPercent && (
            <span style={{ fontSize: 12, fontWeight: 600, color }}>{(util * 100).toFixed(1)}%</span>
          )}
        </div>
      )}
      <div className="util-bar" style={{ height }}>
        <div
          className="util-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
