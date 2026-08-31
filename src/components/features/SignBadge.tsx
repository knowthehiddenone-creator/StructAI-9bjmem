import React from 'react';
import type { LoadCondition } from '@/types';

interface SignBadgeProps { condition: LoadCondition; }

export default function SignBadge({ condition }: SignBadgeProps) {
  if (condition === 'COMPRESSION') {
    return <span className="sign-compression">✓ Compression</span>;
  }
  if (condition === 'UPLIFT') {
    return <span className="sign-uplift">⚠ Uplift — Anchor tension required</span>;
  }
  return <span className="sign-shear">⚡ Shear dominant</span>;
}

export function getConditionFromP(P: number): LoadCondition {
  if (P > 0.001)  return 'COMPRESSION';
  if (P < -0.001) return 'UPLIFT';
  return 'SHEAR_DOMINANT';
}
