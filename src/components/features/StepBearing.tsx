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

export default function StepBearing({ state, results }: Props) {
  const r  = results;
  const ec = r.eccentricity;
  const br = r.bearing;
  const gm = r.geometry;

  const A1 = state.N * state.B;
  const A2 = state.pedL * state.pedB;
  const CF = br.intermediate.CF as number;

  return (
    <div>
      <div style={{ marginBottom: 4, fontSize: 12, color: '#8C959F' }}>Step 7 of 10 — CALCULATION</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1F2328', marginBottom: 4 }}>Geometry & Concrete Bearing</h1>
      <p style={{ fontSize: 14, color: '#656D76', marginBottom: 20 }}>
        Full calculation sheets with all intermediate values (RC-12, RC-14). Formula → Variables → Calculation → Result.
      </p>

      {/* Check 1: Plate Geometry */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #EAEEF2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2328' }}>Check 1 — Plate Minimum Size</div>
            <div style={{ fontSize: 12, color: '#656D76', marginTop: 2 }}>{gm.clause}</div>
          </div>
          <StatusBadge status={gm.status} util={gm.utilization} />
        </div>
        <div style={{ padding: 16 }}>
          <CalcSheet title="Geometry — Minimum Plate Dimensions" clause={gm.clause}>
            {`Formula : N_min = d + 2×50mm  |  B_min = bf + 2×50mm\n          AISC DG1 Eq.2.1 / IS 800 Cl.7.4.1\n\nStep 1 : N_min = ${state.d} + 2×50 = ${state.d + 100} mm\nStep 2 : B_min = ${state.bf} + 2×50 = ${state.bf + 100} mm\nStep 3 : N_provided = ${state.N} mm  →  ${state.N >= state.d + 100 ? '✓ OK' : '✗ FAIL'}\nStep 4 : B_provided = ${state.B} mm  →  ${state.B >= state.bf + 100 ? '✓ OK' : '✗ FAIL'}\nStep 5 : A1 = N × B = ${state.N} × ${state.B} = ${A1} mm²\nStep 6 : A2 = Lp × Bp = ${state.pedL} × ${state.pedB} = ${A2} mm²\nStep 7 : CF_raw = √(A2/A1) = √(${A2}/${A1}) = ${Math.sqrt(A2 / A1).toFixed(4)}\nStep 8 : CF = min(${Math.sqrt(A2 / A1).toFixed(4)}, 2.0) = ${CF.toFixed(4)}`}
          </CalcSheet>
          {gm.warnings.map((w, i) => <WarnCard key={i} warning={w} />)}
        </div>
      </div>

      {/* Check 2: Eccentricity */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #EAEEF2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2328' }}>Check 2 — Eccentricity & Pressure Distribution</div>
            <div style={{ fontSize: 12, color: '#656D76', marginTop: 2 }}>AISC DG1 Section 3.1 / IS 800 Cl.7.4</div>
          </div>
          <StatusBadge status={ec.full_compression ? 'PASS' : 'WARNING'} />
        </div>
        <div style={{ padding: 16 }}>
          <CalcSheet title="Eccentricity & Kern Check" clause="AISC DG1 Eq.3.1 / IS 800:2007 Cl.7.4">
            {`Formula : ex = Mx / P  |  kern_x = N/6  [middle-third rule]\n\nStep 1 : ex = Mx / P = ${state.Mx * 1e6} / ${state.P * 1000} = ${ec.ex} mm\nStep 2 : kern_x = N / 6 = ${state.N} / 6 = ${ec.kern_x} mm\nStep 3 : Full compression = ex ≤ kern_x\n         = ${ec.ex} ≤ ${ec.kern_x} → ${ec.full_compression ? 'TRUE ✓' : 'FALSE ✗ — anchor tension required'}\n\nBearing Pressure Distribution:\nStep 4 : Z = B × N² / 6 = ${state.B} × ${state.N}² / 6 = ${(state.B * state.N * state.N / 6).toFixed(0)} mm³\nStep 5 : fp_avg = P / A1 = ${state.P * 1000} / ${A1} = ${ec.fp_avg} MPa\nStep 6 : fp_max = P/A1 + Mx/Z = ${ec.fp_avg} + ${(state.Mx * 1e6 / (state.B * state.N * state.N / 6)).toFixed(4)}\n         = ${ec.fp_max} MPa\nStep 7 : fp_min = P/A1 - Mx/Z = ${ec.fp_min} MPa ${ec.fp_min < 0 ? '← NEGATIVE = uplift' : '← positive = full compression'}`}
          </CalcSheet>
          {!ec.full_compression && (
            <div className="p-3 rounded-lg warn-3 mb-2" style={{ fontSize: 12 }}>
              ⚠ Partial bearing — anchor tension required. ex={ec.ex}mm {'>'} kern_x={ec.kern_x}mm.
              Ref: AISC DG1 Section 3.2 / IS 800:2007 Cl.7.4.3
            </div>
          )}
        </div>
      </div>

      {/* Check 3: Concrete Bearing */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #EAEEF2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2328' }}>Check 3 — Concrete Bearing ({state.supportType})</div>
            <div style={{ fontSize: 12, color: '#0969DA', marginTop: 2 }}>
              {state.supportType === 'PEDESTAL'
                ? `Full confinement: CF = ${CF.toFixed(4)} — IS 456:2000 Cl.34.4`
                : 'CF = 1.0 conservative — ACI 318-19 Sec.26.2'
              }
            </div>
          </div>
          <StatusBadge status={br.status} util={br.utilization} />
        </div>
        <div style={{ padding: 16 }}>
          <CalcSheet title={`${br.formula}`} clause={br.clause}>
            {state.code === 'IS800'
              ? `Formula : fp_allow = 0.45 × fck × CF\n          IS 456:2000 Cl.34.4 / IS 800:2007 Cl.7.4.1\n\nStep 1 : A1 = N × B = ${state.N} × ${state.B} = ${A1} mm²\nStep 2 : A2 = Lp × Bp = ${state.pedL} × ${state.pedB} = ${A2} mm²\nStep 3 : √(A2/A1) = √(${(A2 / A1).toFixed(4)}) = ${Math.sqrt(A2 / A1).toFixed(4)}\nStep 4 : CF = min(${Math.sqrt(A2 / A1).toFixed(4)}, 2.0) = ${CF.toFixed(4)}\nStep 5 : fp_allow = 0.45 × ${state.fck} × ${CF.toFixed(4)} = ${(br.intermediate.fp_allow as number).toFixed(4)} MPa\nStep 6 : fp_actual = P / A1 = ${state.P * 1000} / ${A1} = ${(br.intermediate.fp_actual as number).toFixed(4)} MPa\nStep 7 : Utilisation = ${(br.intermediate.fp_actual as number).toFixed(4)} / ${(br.intermediate.fp_allow as number).toFixed(4)}\n         = ${br.utilization.toFixed(4)} ${br.utilization <= 1.0 ? '✓ SAFE (< 1.0)' : '✗ FAILS (> 1.0)'}`
              : `Formula : φPp = φc × 0.85 × f'c × A1 × CF\n          AISC 360-22 Section J8.1\n\nStep 1 : φc = 0.65\nStep 2 : f'c = ${state.fck} MPa\nStep 3 : A1 = ${A1} mm²\nStep 4 : CF = ${CF.toFixed(4)}\nStep 5 : φPp = 0.65 × 0.85 × ${state.fck} × ${A1} × ${CF.toFixed(4)} = ${(0.65 * 0.85 * state.fck * A1 * CF).toFixed(0)} N\nStep 6 : fp_allow = φPp / A1 = ${(br.intermediate.fp_allow as number).toFixed(4)} MPa\nStep 7 : fp_actual = ${(br.intermediate.fp_actual as number).toFixed(4)} MPa\nStep 8 : Utilisation = ${br.utilization.toFixed(4)} ${br.utilization <= 1.0 ? '✓ SAFE' : '✗ FAILS'}`
            }
          </CalcSheet>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#656D76', whiteSpace: 'nowrap', minWidth: 100 }}>Bearing Utilisation</span>
            <div style={{ flex: 1 }}><UtilBar util={br.utilization} /></div>
            <span style={{ fontSize: 13, fontWeight: 700, minWidth: 50, textAlign: 'right', color: br.utilization > 1 ? '#CF222E' : '#1A7F37' }}>{(br.utilization * 100).toFixed(1)}%</span>
          </div>

          {br.warnings.map((w, i) => <WarnCard key={i} warning={w} />)}
        </div>
      </div>
    </div>
  );
}
