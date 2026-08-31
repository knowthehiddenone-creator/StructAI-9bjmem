import React from 'react';
import { cn } from '@/lib/utils';
import type { CheckStatus } from '@/types';

interface StatusBadgeProps {
  status: CheckStatus;
  util?: number;
  className?: string;
  compact?: boolean;
}

const STATUS_CONFIG: Record<CheckStatus, { label: string; className: string; icon: string }> = {
  PASS:     { label: '✓ PASS',     className: 'badge-pass',     icon: '✓' },
  CAUTION:  { label: '⚡ CAUTION', className: 'badge-caution',  icon: '⚡' },
  WARNING:  { label: '⚠ WARNING', className: 'badge-warning',  icon: '⚠' },
  CRITICAL: { label: '🔴 CRITICAL', className: 'badge-critical', icon: '🔴' },
  REDESIGN: { label: '❌ REDESIGN', className: 'badge-redesign', icon: '❌' },
};

export default function StatusBadge({ status, util, className, compact }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PASS;
  return (
    <span className={cn('status-badge', cfg.className, className)}>
      {compact ? cfg.icon : cfg.label}
      {util !== undefined && !compact && ` (${(util * 100).toFixed(0)}%)`}
    </span>
  );
}
