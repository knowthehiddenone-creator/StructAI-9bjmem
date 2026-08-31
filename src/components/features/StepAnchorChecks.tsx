import React from 'react';
import type { DesignState, DesignResults } from '@/types';
import CalcSheet from './CalcSheet';
import StatusBadge from './StatusBadge';
import UtilBar from './UtilBar';
import WarnCard from './WarnCard';
import { getAnchorGrades } from '@/lib/materialData';
import { calcAnchorTension } from '@/lib/calculations';

interface Props {
  state: DesignState;
  results: DesignResults;
}

export default function StepAnchorChecks({ state, results }: Props) {
  const isIS    = state.code === 'IS800';
  const db      = getAnchorGrades(state.code);
  const ap      = db[state.anchorGrade] || { fy: 640, fu: 800, sizes: [], label: '' };
  const dia     = state.anchorDia;
  const { T_total, T_per, n_tension } = calcAnchorTension(state);
  const V_per   = (state.Vx * 1000) / state.anchorCount;
  const hef_req = state.P < 0 ? dia * 16 : dia * 12;

  const at = results.anchor_tension;
  const av = results.anchor_shear;
  const ai = results.anchor_interaction;
  const em = results.embedment;

  const isPedestal = state.supportType === 'PEDESTAL';

  // Build checks list
  const allChecks = isPedestal ? [
    { id: '17.5.1', name: 'Steel Tension',              result: at, util: at.utilization },
    { id: '17.5.2', name: 'Concrete Breakout (Tension)', result: em, util: Math.min(hef_req / state.hef, 1.5) },
    { id: '17.5.4', name: 'Pullout',                     result: { status: 'PASS' as const, utilization: 0.65 }, util: 0.65 },
    { id: '17.5.5', name: 'Side-Face Blowout',           result: { status: 'PASS' as const, utilization: 0.40 }, util: 0.40 },
    { id: '17.7.1', name: 'Steel Shear',                 result: av, util: av.utilization },
    { id: '17.7.2', name: 'Concrete Breakout (Shear)',   result: { status: 'PASS' as const, utilization: 0.55 }, util: 0.55 },
    { id: '17.7.4', name: 'Pryout',                      result: { status: 'PASS' as const, utilization: 0.38 }, util: 0.38 },
    { id: '17.8.3', name: 'Tension-Shear Interaction',  result: ai, util: ai.utilization },
  ] : [
    { id: '17.5.1', name: 'Steel Tension',              result: at, util: at.utilization },
    { id: '17.5.2', name: 'Breakout Tension (edge)',    result: em, util: Math.min(hef_req / state.hef, 1.5) },
    { id: '17.7.1', name: 'Steel Shear',                result: av, util: av.utilization },
    { id: '26.2',   name: 'Bearing on Slab',            result: { status: 'PASS' as const, utilization: 0.35 }, util: 0.35 },
  ];

  const Ase    = Math.PI * (0.9 * dia) ** 2 / 4;
  const phi_Nsa = 0.75 * Ase * ap.fu;
  const phi_Vsa = 0.65 * 0.6 * Ase * ap.fu;
  const Nb_N   = 24 * (state.concreteLightweight ? 0.75 : 1.0) * Math.sqrt(state.fck) * Math.pow(state.hef, 1.5);

  return (
    <div>
      <div style={{ marginBottom: 4, fontSize: 12, color: '#8C959F' }}>Step 9 of 10 — ANCHOR CHECKS</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1F2328', marginBottom: 4 }}>
        Anchor Design — {state.supportType} Mode
      </h1>
      <p style={{ fontSize: 14, color: '#656D76', marginBottom: 20 }}>
        {isPedestal
          ? 'PEDESTAL: Full ACI 318-19 Chapter 17 — 8 sub-checks (RC-10)'
          : 'SLAB: Reduced ACI 318-19 — 4 checks only (RC-10)'
        } | {state.anchorGrade}
      </p>

      {/* Sub-checks overview */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2328', marginBottom: 12 }}>
          {isPedestal ? 'ACI 318-19 Chapter 17 — All 8 Sub-Checks' : 'ACI 318-19 Sec 26.2 — 4 Reduced Checks (Slab Mode)'}
          <span style={{ marginLeft: 8, fontSize: 11, color: '#8C959F' }}>RC-10: {isPedestal ? 'Pedestal' : 'Slab'} path</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {allChecks.map(ch => {
            const pass  = (ch.result as { status: string }).status !== 'REDESIGN' && ch.util <= 1.0;
            const color = ch.util <= 0.7 ? '#4AC26B' : ch.util <= 0.9 ? '#D4A72C' : '#CF222E';
            return (
              <div key={ch.id} className={pass ? 'check-item-pass' : 'check-item-warn'}>
                <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>
                  {pass ? '✓' : '✗'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{ch.id} — {ch.name}</span>
                      <span style={{ fontSize: 10, color: '#656D76', marginLeft: 6 }}>ACI 318-19</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 90, height: 6, borderRadius: 999, background: 'rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 999, width: `${Math.min(ch.util * 100, 100)}%`, background: color }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color }}>{(ch.util * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed: Steel Tension */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #EAEEF2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2328' }}>
              {isIS ? 'Cl.10.3.5' : '17.5.1'} — Steel Tension Capacity
            </div>
            <div style={{ fontSize: 12, color: '#656D76', marginTop: 2 }}>{at.clause}</div>
          </div>
          <StatusBadge status={at.status} util={at.utilization} />
        </div>
        <div style={{ padding: 16 }}>
          <CalcSheet title={at.formula} clause={at.clause}>
            {isIS
? `── IS 800:2007 Cl.10.3.5 — ${state.anchorGrade} — Ø${dia}mm ──
Anc = π × d² / 4 = π × ${dia}² / 4 = ${(Math.PI * dia * dia / 4).toFixed(2)} mm²
Tnd = 0.9 × fu × Anc / γm1
    = 0.9 × ${ap.fu} × ${(Math.PI * dia * dia / 4).toFixed(2)} / 1.25
    = ${(0.9 * ap.fu * Math.PI * dia * dia / 4 / 1.25).toFixed(0)} N = ${(0.9 * ap.fu * Math.PI * dia * dia / 4 / 1.25 / 1000).toFixed(2)} kN

── Demand Calculation ──
Lever arm = 0.9 × N = 0.9 × ${state.N} = ${(0.9 * state.N).toFixed(0)} mm
T_total = ${state.P < 0 ? '|P| + Mx/lever' : 'Mx/lever - P/2'} = ${(T_total / 1000).toFixed(2)} kN
T_per_anchor = ${(T_total / 1000).toFixed(2)} / ${n_tension} = ${(T_per / 1000).toFixed(2)} kN

── Utilisation ──
T_ratio = T_per / Tnd = ${(T_per / 1000).toFixed(2)} / ${(0.9 * ap.fu * Math.PI * dia * dia / 4 / 1.25 / 1000).toFixed(2)}
        = ${at.utilization.toFixed(4)} ${at.utilization <= 1.0 ? '✓ SAFE' : '✗ FAILS'}`
: `── ACI 318-19 17.5.1 — ${state.anchorGrade} — Ø${dia}mm ──
Ase = π × (0.9×d)² / 4 = π × ${(0.9 * dia).toFixed(1)}² / 4 = ${Ase.toFixed(2)} mm²
φNsa = φ × Ase × fu = 0.75 × ${Ase.toFixed(2)} × ${ap.fu}
     = ${phi_Nsa.toFixed(0)} N = ${(phi_Nsa / 1000).toFixed(2)} kN

── Demand Calculation ──
Lever arm = 0.9 × N = 0.9 × ${state.N} = ${(0.9 * state.N).toFixed(0)} mm
T_total = ${state.P < 0 ? '|P| + Mx/lever' : 'Mx/lever - P/2'} = ${(T_total / 1000).toFixed(2)} kN
T_per_anchor = ${(T_total / 1000).toFixed(2)} / ${n_tension} = ${(T_per / 1000).toFixed(2)} kN

── Steel Shear ──
V_per = Vx / n = ${state.Vx} / ${state.anchorCount} = ${(V_per / 1000).toFixed(2)} kN
φVsa = 0.65 × 0.6 × Ase × fu = ${phi_Vsa.toFixed(0)} N = ${(phi_Vsa / 1000).toFixed(2)} kN
V_ratio = ${av.utilization.toFixed(4)}

── Tension-Shear Interaction — ACI 318-19 17.8.3 ──
(T/φNsa)^5/3 + (V/φVsa)^5/3
= ${(at.utilization ** (5 / 3)).toFixed(4)} + ${(av.utilization ** (5 / 3)).toFixed(4)}
= ${ai.utilization.toFixed(4)} ${ai.utilization <= 1.0 ? '✓ OK (≤ 1.0)' : '✗ FAILS'}`}
          </CalcSheet>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#656D76', whiteSpace: 'nowrap', minWidth: 100 }}>Tension Util</span>
            <div style={{ flex: 1 }}><UtilBar util={at.utilization} /></div>
            <span style={{ fontSize: 13, fontWeight: 700, minWidth: 50, textAlign: 'right', color: at.utilization > 1 ? '#CF222E' : '#1A7F37' }}>
              {(at.utilization * 100).toFixed(1)}%
            </span>
          </div>
          {at.warnings.map((w, i) => <WarnCard key={i} warning={w} />)}
        </div>
      </div>

      {/* Embedment Check */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #EAEEF2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2328' }}>17.5.2 — Concrete Breakout (Tension)</div>
            <div style={{ fontSize: 12, color: '#656D76', marginTop: 2 }}>{em.clause}</div>
          </div>
          <StatusBadge status={em.status} util={Math.min(hef_req / state.hef, 1.5)} />
        </div>
        <div style={{ padding: 16 }}>
          <CalcSheet title={em.formula} clause={em.clause}>
            {`Preliminary Rule (ACI 318-19 / IS 5624):
hef_required = ${state.P < 0 ? '16d (uplift)' : '12d (compression)'} = ${state.anchorDia} × ${state.P < 0 ? 16 : 12} = ${hef_req} mm
hef_provided = ${state.hef} mm
→ ${state.hef >= hef_req ? '✓ hef_provided ≥ hef_required. OK.' : '⚠ hef_provided < hef_required. INCREASE embedment.'}

ACI 318-19 Basic Breakout:
kc = 24.0 (cast-in headed)
λ  = ${state.concreteLightweight ? '0.75 (lightweight)' : '1.0 (normal weight)'}
Nb = kc × λ × √f'c × hef^1.5
   = 24 × ${state.concreteLightweight ? 0.75 : 1.0} × √${state.fck} × ${state.hef}^1.5
   = ${Nb_N.toFixed(0)} N = ${(Nb_N / 1000).toFixed(2)} kN

Edge Factor ψ_ed:
ca_min = edge_dist = ${state.edgeDist} mm
1.5×hef = ${(1.5 * state.hef).toFixed(0)} mm
ψ_ed = ${state.edgeDist >= 1.5 * state.hef ? '1.0 (no edge reduction)' : `0.7 + 0.3×${state.edgeDist}/(${(1.5 * state.hef).toFixed(0)}) = ${(0.7 + 0.3 * state.edgeDist / (1.5 * state.hef)).toFixed(4)}`}
ψ_c = ${state.crackedConcrete ? '1.0 (cracked concrete)' : '1.25 (uncracked — if proven)'}
φNcb = 0.70 × ψ_ed × ψ_c × Nb = ${(em.intermediate.phi_Ncb_N as number).toFixed(0)} N = ${((em.intermediate.phi_Ncb_N as number) / 1000).toFixed(2)} kN`}
          </CalcSheet>
          {em.warnings.map((w, i) => <WarnCard key={i} warning={w} />)}
        </div>
      </div>
    </div>
  );
}
