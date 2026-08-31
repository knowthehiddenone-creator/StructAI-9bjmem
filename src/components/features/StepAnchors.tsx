import React, { useState } from 'react';
import type { DesignState } from '@/types';
import { getAnchorGrades, UNIT_LABELS } from '@/lib/materialData';

interface Props {
  state: DesignState;
  onChange: (updates: Partial<DesignState>) => void;
}

export default function StepAnchors({ state, onChange }: Props) {
  const isIS = state.code === 'IS800';
  const db   = getAnchorGrades(state.code);
  const units = UNIT_LABELS[state.code] || UNIT_LABELS.IS800;
  const gradeProps = db[state.anchorGrade] || { fy: 640, fu: 800, sizes: [], label: '' };
  const hef_prelim = state.P < 0 ? state.anchorDia * 16 : state.anchorDia * 12;
  const pryingRisk = state.anchorDia > state.tp;

  const handleGradeChange = (g: string) => {
    const p = db[g];
    if (!p) return;
    const firstSize = p.sizes[0];
    const dia = typeof firstSize === 'number' ? firstSize : 24;
    onChange({ anchorGrade: g, anchorDia: dia });
  };

  return (
    <div>
      <div style={{ marginBottom: 4, fontSize: 12, color: '#8C959F' }}>Step 6 of 10</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1F2328', marginBottom: 4 }}>Anchor Bolt Design</h1>
      <p style={{ fontSize: 14, color: '#656D76', marginBottom: 20 }}>
        Grade: {isIS ? 'IS 1367 Class 8.8 — M24 terminology' : 'ASTM F1554 Gr.55 — 1-1/4 in terminology'}
      </p>

      {/* Anchor properties */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #EAEEF2', fontSize: 15, fontWeight: 600, color: '#1F2328' }}>
          Anchor Properties
        </div>
        <div style={{ padding: 16 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="eng-label">Anchor Type</label>
              <select className="eng-select" value={state.anchorType}
                onChange={e => onChange({ anchorType: e.target.value })}>
                <option>Cast-in Headed</option>
                <option>Cast-in Hooked (J/L bolt)</option>
                <option>Post-installed Expansion</option>
                <option>Post-installed Chemical</option>
              </select>
            </div>
            <div>
              <label className="eng-label">Anchor Grade — {isIS ? 'IS 1367' : 'ASTM'}</label>
              <select className="eng-select" value={state.anchorGrade} onChange={e => handleGradeChange(e.target.value)}>
                {Object.entries(db).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="eng-label">Diameter ({isIS ? 'mm' : 'in'})</label>
              <select className="eng-select" value={String(state.anchorDia)}
                onChange={e => {
                  const v = isIS ? parseInt(e.target.value) : e.target.value;
                  onChange({ anchorDia: isIS ? (v as number) : 24 });
                }}>
                {gradeProps.sizes.map((s: number | string) => (
                  <option key={String(s)} value={String(s)}>
                    {isIS ? `M${s}` : `${s} in`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="eng-label">Number of Anchors</label>
              <select className="eng-select" value={state.anchorCount}
                onChange={e => onChange({ anchorCount: parseInt(e.target.value) })}>
                {[4, 6, 8, 12].map(n => <option key={n} value={n}>{n} bolts</option>)}
              </select>
            </div>
          </div>

          <div className="p-3 rounded-lg warn-1" style={{ fontSize: 12, marginBottom: 12 }}>
            ✓ Grade pre-selected: <strong>{state.anchorGrade}</strong> | Fy = {gradeProps.fy} MPa, Fu = {gradeProps.fu} MPa<br />
            {isIS ? 'Standard Indian high-strength anchor per IS 1367:2002' : 'Standard ASTM anchor bolt per specification'}
          </div>

          {pryingRisk && (
            <div className="p-3 rounded-lg warn-3" style={{ fontSize: 12 }}>
              ⚠ <strong>RC-12 Warning:</strong> Anchor dia ({state.anchorDia}mm) {'>'} plate tp ({state.tp}mm).
              Prying action and local plate bending concern. NOT a code failure — constructability issue.
              <strong> Fix:</strong> Increase tp, add washer plate (min 2×bolt dia), or add stiffener.
            </div>
          )}
        </div>
      </div>

      {/* Layout & Embedment */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #EAEEF2', fontSize: 15, fontWeight: 600, color: '#1F2328' }}>
          Layout & Embedment
        </div>
        <div style={{ padding: 16 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="eng-label">Edge Distance ex, ey ({units.length})</label>
              <input className="eng-input" defaultValue={state.edgeDist}
                onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange({ edgeDist: v }); }} />
              <div style={{ fontSize: 11, color: '#8C959F', marginTop: 4 }}>
                Min = {isIS ? '50mm' : '2 in'} | 1.5×hef = {(state.hef * 1.5).toFixed(0)}mm for edge check
              </div>
            </div>
            <div>
              <label className="eng-label">Embedment Depth hef ({units.length})</label>
              <input className={`eng-input ${state.hef < hef_prelim ? 'error' : 'success'}`}
                defaultValue={state.hef}
                onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange({ hef: v }); }} />
              <div style={{ fontSize: 11, color: state.hef < hef_prelim ? '#CF222E' : '#1A7F37', marginTop: 4 }}>
                {state.P < 0 ? '16d (uplift)' : '12d (compression)'} = {hef_prelim}mm
                {state.hef < hef_prelim ? ' ⚠ Insufficient' : ' ✓ OK'}
              </div>
            </div>
            <div>
              <label className="eng-label">Spacing Sx ({units.length})</label>
              <input className="eng-input" defaultValue={state.spacing_x}
                onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange({ spacing_x: v }); }} />
            </div>
            <div>
              <label className="eng-label">Spacing Sy ({units.length})</label>
              <input className="eng-input" defaultValue={state.spacing_y}
                onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange({ spacing_y: v }); }} />
            </div>
          </div>

          {/* Anchor pattern SVG */}
          <AnchorPatternSVG
            N={state.N} B={state.B}
            count={state.anchorCount}
            edgeDist={state.edgeDist}
            hef={state.hef}
          />
        </div>
      </div>
    </div>
  );
}

function AnchorPatternSVG({ N, B, count, edgeDist, hef }: { N: number; B: number; count: number; edgeDist: number; hef: number }) {
  const W = 280, H = 200;
  const scale = Math.min((W - 40) / N, (H - 40) / B);
  const pW = N * scale, pH = B * scale;
  const px = (W - pW) / 2, py = (H - pH) / 2;
  const ex = edgeDist * scale, ey = edgeDist * scale;

  const boltPos: [number, number][] = count >= 4 ? [
    [px + ex, py + ey],
    [px + pW - ex, py + ey],
    [px + ex, py + pH - ey],
    [px + pW - ex, py + pH - ey],
  ] : [];
  if (count >= 6) {
    boltPos.push([px + pW / 2, py + ey]);
    boltPos.push([px + pW / 2, py + pH - ey]);
  }
  if (count >= 8) {
    boltPos.push([px + ex, py + pH / 2]);
    boltPos.push([px + pW - ex, py + pH / 2]);
  }

  return (
    <div style={{ border: '1px solid #EAEEF2', borderRadius: 8, overflow: 'hidden', background: 'white', marginTop: 12 }}>
      <div style={{ padding: '6px 12px', borderBottom: '1px solid #EAEEF2', fontSize: 11, color: '#8C959F', fontWeight: 600 }}>
        ANCHOR PLAN — {count}×Ø{typeof hef === 'number' ? `${hef}mm hef` : ''}
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <rect x={px} y={py} width={pW} height={pH} fill="#F6F8FA" stroke="#D0D7DE" strokeWidth={1} />
        {boltPos.map(([bx, by], i) => (
          <g key={i}>
            <circle cx={bx} cy={by} r={6} fill="#0969DA" opacity={0.8} />
            <circle cx={bx} cy={by} r={10} fill="none" stroke="#0969DA" strokeWidth={1} strokeDasharray="2 2" opacity={0.5} />
            <text x={bx + 12} y={by + 4} fontSize={9} fill="#656D76">{i + 1}</text>
          </g>
        ))}
        {/* Edge dist lines */}
        <line x1={px} y1={py + ey} x2={px + ex} y2={py + ey} stroke="#9A6700" strokeWidth={0.8} strokeDasharray="3 2" />
        <line x1={px + ex} y1={py} x2={px + ex} y2={py + ey} stroke="#9A6700" strokeWidth={0.8} strokeDasharray="3 2" />
        <text x={px + ex / 2} y={py + ey - 4} textAnchor="middle" fontSize={8} fill="#9A6700">ex</text>
      </svg>
    </div>
  );
}
