import React from 'react';
import type { DesignWarning } from '@/types';

interface WarnCardProps {
  warning: DesignWarning;
  compact?: boolean;
}

const LEVEL_CONFIG = {
  1: { cls: 'warn-1', icon: 'ℹ', label: 'INFO' },
  2: { cls: 'warn-2', icon: '⚡', label: 'CAUTION' },
  3: { cls: 'warn-3', icon: '⚠', label: 'WARNING' },
  4: { cls: 'warn-4', icon: '🔴', label: 'CRITICAL' },
  5: { cls: 'warn-5', icon: '❌', label: 'REDESIGN REQUIRED' },
};

export default function WarnCard({ warning, compact }: WarnCardProps) {
  const cfg = LEVEL_CONFIG[warning.level] || LEVEL_CONFIG[3];
  return (
    <div className={`p-3 rounded-lg ${cfg.cls} mb-2`} style={{ borderRadius: 8 }}>
      <div className="flex items-start gap-2">
        <span style={{ fontSize: 13, flexShrink: 0, lineHeight: '20px' }}>{cfg.icon}</span>
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', opacity: 0.7 }}>{cfg.label}</span>
            {warning.clause && (
              <span style={{ fontSize: 10, opacity: 0.65, fontStyle: 'italic' }}>{warning.clause}</span>
            )}
          </div>
          {warning.title && (
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{warning.title}</div>
          )}
          <div style={{ fontSize: 12, lineHeight: 1.5, opacity: 0.9 }}>{warning.message}</div>
          {!compact && warning.fix && warning.fix.length > 0 && (
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 3, opacity: 0.8 }}>Recommended fixes:</div>
              <ul style={{ margin: 0, padding: '0 0 0 14px' }}>
                {warning.fix.map((f, i) => (
                  <li key={i} style={{ fontSize: 11, lineHeight: 1.5, opacity: 0.85 }}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
