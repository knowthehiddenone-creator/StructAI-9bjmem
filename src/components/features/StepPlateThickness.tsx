import React from 'react';
import type { DesignState, DesignResults } from '@/types';
import CalcSheet from './CalcSheet';
import StatusBadge from './StatusBadge';
import UtilBar from './UtilBar';
import WarnCard from './WarnCard';

interface Props {
  state: DesignState;
  results: DesignResults;
}

export default function StepPlateThickness({ state, results }: Props) {
  const pt = results.plate_thickness;

  return (
    <div>
      <div style={{ marginBottom: 4, fontSize: 12, color: '#8C959F' }}>Step 8 of 10 — CALCULATION</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1F2328', marginBottom: 4 }}>Plate Thickness Design</h1>
      <p style={{ fontSize: 14, color: '#656D76', marginBottom: 20 }}>
        Critical cantilever method — AISC DG1 Eq.2.3 & 2.6 / IS 800 Cl.7.4.3. Every intermediate step shown (RC-14).
      </p>

      <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #EAEEF2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2328' }}>Plate Thickness Check — Critical Cantilever Method</div>
            <div style={{ fontSize: 12, color: '#656D76', marginTop: 2 }}>{pt.clause}</div>
          </div>
          <StatusBadge status={pt.status} util={pt.utilization} />
        </div>
        <div style={{ padding: 16 }}>
          <CalcSheet title={pt.formula} clause={pt.clause}>
            {`── Critical Cantilever Lengths ──
Step 1: m = (N − 0.95d) / 2
        = (${state.N} − 0.95×${state.d}) / 2
        = (${state.N} − ${(0.95 * state.d).toFixed(1)}) / 2
        = ${pt.m} mm

Step 2: n = (B − 0.80bf) / 2
        = (${state.B} − 0.80×${state.bf}) / 2
        = (${state.B} − ${(0.80 * state.bf).toFixed(1)}) / 2
        = ${pt.n} mm

Step 3: n' = √(d × bf) / 4
        = √(${state.d} × ${state.bf}) / 4
        = √${(state.d * state.bf).toFixed(0)} / 4
        = ${pt.n_prime} mm

Step 4: l_crit = max(m, n, λ×n')
        = max(${pt.m}, ${pt.n}, ${pt.n_prime})
        = ${pt.l_crit} mm  ← GOVERNS

── Plate Thickness Required ──
Step 5: fp = P / A1
        = ${state.P * 1000} / ${state.N * state.B}
        = ${(state.P * 1000 / (state.N * state.B)).toFixed(4)} MPa
${state.code === 'IS800' ? `
Step 6: Md = fp × l² / 2
        = ${(state.P * 1000 / (state.N * state.B)).toFixed(4)} × ${pt.l_crit}² / 2
        = ${(state.P * 1000 / (state.N * state.B) * pt.l_crit * pt.l_crit / 2).toFixed(2)} N·mm/mm

Step 7: tp_req = √(6 × Md × γm0 / Fy)
        = √(6 × ${(state.P * 1000 / (state.N * state.B) * pt.l_crit * pt.l_crit / 2).toFixed(2)} × 1.10 / ${state.plateFy})
        = ${pt.tp_required} mm` : `
Step 6: tp_req = l × √(2fp / φFy)
        = ${pt.l_crit} × √(2 × ${(state.P * 1000 / (state.N * state.B)).toFixed(4)} / (0.9 × ${state.plateFy}))
        = ${pt.l_crit} × √(${(2 * state.P * 1000 / (state.N * state.B) / (0.9 * state.plateFy)).toFixed(6)})
        = ${pt.l_crit} × ${Math.sqrt(2 * state.P * 1000 / (state.N * state.B) / (0.9 * state.plateFy)).toFixed(4)}
        = ${pt.tp_required} mm`}

Step 7: tp_provided = ${state.tp} mm

Step 8: Utilisation = ${pt.tp_required} / ${state.tp}
        = ${pt.utilization.toFixed(4)} ${pt.utilization <= 1.0 ? '✓ SAFE (< 1.0)' : '✗ REDESIGN REQUIRED'}`}
          </CalcSheet>

          {/* Result cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div style={{ padding: 12, background: '#F6F8FA', borderRadius: 8, border: '1px solid #EAEEF2', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#8C959F', marginBottom: 4 }}>CRITICAL LENGTH</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0969DA' }}>{pt.l_crit} mm</div>
              <div style={{ fontSize: 11, color: '#656D76' }}>l_crit governs</div>
            </div>
            <div style={{ padding: 12, background: '#F6F8FA', borderRadius: 8, border: '1px solid #EAEEF2', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#8C959F', marginBottom: 4 }}>REQUIRED tp</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: pt.tp_required <= state.tp ? '#1A7F37' : '#CF222E' }}>{pt.tp_required} mm</div>
              <div style={{ fontSize: 11, color: '#656D76' }}>tp_required</div>
            </div>
            <div style={{ padding: 12, background: '#F6F8FA', borderRadius: 8, border: '1px solid #EAEEF2', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#8C959F', marginBottom: 4 }}>PROVIDED tp</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: state.tp >= pt.tp_required ? '#1A7F37' : '#CF222E' }}>{state.tp} mm</div>
              <div style={{ fontSize: 11, color: '#656D76' }}>tp_provided</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#656D76', whiteSpace: 'nowrap', minWidth: 100 }}>tp Utilisation</span>
            <div style={{ flex: 1 }}><UtilBar util={pt.utilization} /></div>
            <span style={{ fontSize: 13, fontWeight: 700, minWidth: 50, textAlign: 'right', color: pt.utilization > 1 ? '#CF222E' : '#1A7F37' }}>
              {(pt.utilization * 100).toFixed(1)}%
            </span>
          </div>

          {pt.warnings.map((w, i) => <WarnCard key={i} warning={w} />)}

          {/* Prying check */}
          {state.anchorDia <= state.tp ? (
            <div className="p-3 rounded-lg" style={{ background: '#DAFBE1', border: '1px solid #4AC26B', fontSize: 12, color: '#1A7F37' }}>
              ✓ Anchor dia ({state.anchorDia}mm) ≤ plate tp ({state.tp}mm) — No prying action risk.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
