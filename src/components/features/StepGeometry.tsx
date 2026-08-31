import React, { useState, useCallback, useRef } from 'react';
import type { DesignState } from '@/types';
import { getSectionTypes, getSectionsForType, getSectionProps } from '@/lib/sectionData';

interface Props {
  state: DesignState;
  onChange: (updates: Partial<DesignState>) => void;
}

export default function StepGeometry({ state, onChange }: Props) {
  const [sectionOverrideModal, setSectionOverrideModal] = useState(false);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const [plateNWarn, setPlateNWarn] = useState(false);
  const [plateBWarn, setPlateBWarn] = useState(false);

  const N_min = state.d + 100;
  const B_min = state.bf + 100;

  const colTypes = getSectionTypes(state.code);
  const sections = getSectionsForType(state.code, state.colType);

  const handleColTypeChange = (v: string) => {
    const newSections = getSectionsForType(state.code, v);
    const firstSection = Object.keys(newSections)[0];
    const props = newSections[firstSection];
    if (props) {
      onChange({ colType: v, colDesig: firstSection, d: props.d, bf: props.bf, tf: props.tf, tw: props.tw, sectionLocked: true, manualDimsEdited: false });
    }
  };

  const handleSectionChange = (v: string) => {
    if (state.manualDimsEdited) {
      setPendingSection(v);
      setSectionOverrideModal(true);
      return;
    }
    applySectionChange(v);
  };

  const applySectionChange = (v: string) => {
    const props = getSectionProps(state.code, state.colType, v);
    if (props) {
      onChange({ colDesig: v, d: props.d, bf: props.bf, tf: props.tf, tw: props.tw, sectionLocked: true, manualDimsEdited: false });
    }
  };

  const confirmOverride = () => {
    if (pendingSection) { applySectionChange(pendingSection); setPendingSection(null); }
    setSectionOverrideModal(false);
  };

  const handlePlateNBlur = (v: string) => {
    const val = parseFloat(v);
    if (!isNaN(val)) {
      onChange({ N: val });
      setPlateNWarn(val < N_min);
    }
  };
  const handlePlateBBlur = (v: string) => {
    const val = parseFloat(v);
    if (!isNaN(val)) {
      onChange({ B: val });
      setPlateBWarn(val < B_min);
    }
  };
  const handleTpBlur = (v: string) => {
    const val = parseFloat(v);
    if (!isNaN(val)) onChange({ tp: val });
  };

  return (
    <div>
      <div style={{ marginBottom: 4, fontSize: 12, color: '#8C959F' }}>Step 4 of 10</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1F2328', marginBottom: 4 }}>Geometry & Dimensions</h1>
      <p style={{ fontSize: 14, color: '#656D76', marginBottom: 20 }}>
        <strong>RC-6:</strong> Section dims lock after auto-fill. <strong>RC-7:</strong> Column type filters section library. <strong>RC-1/2:</strong> Plate validates on blur, never auto-adjusted.
      </p>

      {/* Column Section */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #EAEEF2' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2328' }}>Column Section — RC-7</div>
          <div style={{ fontSize: 12, color: '#656D76', marginTop: 2 }}>Column type filters section library directly</div>
        </div>
        <div style={{ padding: 16 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="eng-label">Column Type → Section Linked (RC-7)</label>
              <select className="eng-select" value={state.colType} onChange={e => handleColTypeChange(e.target.value)}>
                {colTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="eng-label">Section Designation</label>
              <select className="eng-select" value={state.colDesig} onChange={e => handleSectionChange(e.target.value)}>
                {Object.keys(sections).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Lock notice RC-6 */}
          <div className="flex items-center justify-between p-3 rounded-lg mb-4" style={{ background: '#FFF8C5', border: '1px solid #D4A72C' }}>
            <div style={{ fontSize: 12, color: '#7D4E00', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🔒</span>
              <span><strong>RC-6:</strong> Dimensions {state.sectionLocked ? 'LOCKED' : 'UNLOCKED'}. {state.sectionLocked ? 'Auto-filled from section database.' : 'Manual edit mode.'}</span>
            </div>
            <button onClick={() => onChange({ sectionLocked: !state.sectionLocked, manualDimsEdited: !state.sectionLocked ? true : state.manualDimsEdited })}
              style={{ fontSize: 11, padding: '4px 10px', background: '#FFFFFF', border: '1px solid #D4A72C', borderRadius: 4, color: '#9A6700', cursor: 'pointer' }}>
              {state.sectionLocked ? '✏ Edit Manually' : '🔒 Lock'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: 'd',  label: 'd — depth (mm)' },
              { key: 'bf', label: 'bf — flange width (mm)' },
              { key: 'tf', label: 'tf — flange thick (mm)' },
              { key: 'tw', label: 'tw — web thick (mm)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="eng-label">{label}</label>
                <input
                  className={`eng-input ${state.sectionLocked ? '' : 'success'}`}
                  defaultValue={(state as Record<string, number>)[key]}
                  readOnly={state.sectionLocked}
                  onBlur={e => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) onChange({ [key]: val, manualDimsEdited: true, colDesig: '(Manual)' } as Partial<DesignState>);
                  }}
                />
              </div>
            ))}
          </div>
          {state.colDesig !== '(Manual)' && (
            <div style={{ fontSize: 11, color: '#8C959F', marginTop: 8 }}>
              Source: {sections[state.colDesig]?.source || 'Section library'}
            </div>
          )}
        </div>
      </div>

      {/* Base Plate Dimensions */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #EAEEF2' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2328' }}>Base Plate Dimensions</div>
          <div style={{ fontSize: 12, color: '#656D76', marginTop: 2 }}>RC-1: Validates on blur — RC-2: Never auto-adjusted</div>
        </div>
        <div style={{ padding: 16 }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="eng-label">Plate Length N (mm)</label>
              <input className={`eng-input ${plateNWarn ? 'error' : state.N >= N_min ? 'success' : ''}`}
                defaultValue={state.N} onBlur={e => handlePlateNBlur(e.target.value)} />
              {plateNWarn
                ? <div className="mt-1 p-2 rounded warn-3" style={{ fontSize: 11 }}>⚠ N={state.N}mm {'<'} N_min={N_min}mm. <strong>NOT auto-adjusted (RC-2).</strong></div>
                : <div style={{ fontSize: 11, color: '#1A7F37', marginTop: 4 }}>✓ N_min={N_min}mm — OK</div>
              }
            </div>
            <div>
              <label className="eng-label">Plate Width B (mm)</label>
              <input className={`eng-input ${plateBWarn ? 'error' : state.B >= B_min ? 'success' : ''}`}
                defaultValue={state.B} onBlur={e => handlePlateBBlur(e.target.value)} />
              {plateBWarn
                ? <div className="mt-1 p-2 rounded warn-3" style={{ fontSize: 11 }}>⚠ B={state.B}mm {'<'} B_min={B_min}mm.</div>
                : <div style={{ fontSize: 11, color: '#1A7F37', marginTop: 4 }}>✓ B_min={B_min}mm — OK</div>
              }
            </div>
            <div>
              <label className="eng-label">Plate Thickness tp (mm)</label>
              <input className={`eng-input ${state.tp < 10 ? 'error' : ''}`}
                defaultValue={state.tp} onBlur={e => handleTpBlur(e.target.value)} />
              {state.tp < 10
                ? <div style={{ fontSize: 11, color: '#CF222E', marginTop: 4 }}>⚠ Minimum tp = 10mm</div>
                : <div style={{ fontSize: 11, color: '#8C959F', marginTop: 4 }}>Min 10mm required</div>
              }
            </div>
          </div>

          {/* SVG plate diagram */}
          <BasePlateSVG N={state.N} B={state.B} d={state.d} bf={state.bf} anchorCount={state.anchorCount} />
        </div>
      </div>

      {/* Support Geometry */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #EAEEF2' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2328' }}>Support Geometry — {state.supportType} (RC-10)</div>
        </div>
        <div style={{ padding: 16 }}>
          {state.supportType === 'PEDESTAL' ? (
            <>
              <div className="p-3 rounded-lg mb-4 warn-1" style={{ fontSize: 12 }}>
                ✓ PEDESTAL MODE — Full ACI 318-19 Chapter 17: All 8 sub-checks + CF = min(√(A2/A1), 2.0)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="eng-label">Pedestal Length Lp (mm) <span style={{ color: '#CF222E' }}>*</span></label>
                  <input className={`eng-input ${state.pedL < state.N ? 'error' : 'success'}`}
                    defaultValue={state.pedL}
                    onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange({ pedL: v }); }} />
                  {state.pedL < state.N
                    ? <div style={{ fontSize: 11, color: '#CF222E', marginTop: 4 }}>⚠ Lp {'<'} plate N</div>
                    : <div style={{ fontSize: 11, color: '#1A7F37', marginTop: 4 }}>✓ OK</div>
                  }
                </div>
                <div>
                  <label className="eng-label">Pedestal Width Bp (mm) <span style={{ color: '#CF222E' }}>*</span></label>
                  <input className={`eng-input ${state.pedB < state.B ? 'error' : 'success'}`}
                    defaultValue={state.pedB}
                    onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange({ pedB: v }); }} />
                  {state.pedB < state.B
                    ? <div style={{ fontSize: 11, color: '#CF222E', marginTop: 4 }}>⚠ Bp {'<'} plate B</div>
                    : <div style={{ fontSize: 11, color: '#1A7F37', marginTop: 4 }}>✓ OK</div>
                  }
                </div>
                <div>
                  <label className="eng-label">Pedestal Depth Dp (mm) <span style={{ color: '#CF222E' }}>*</span></label>
                  <input className="eng-input success" defaultValue={state.pedD}
                    onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange({ pedD: v }); }} />
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: '#8C959F' }}>
                A2 = {state.pedL}×{state.pedB} = {state.pedL * state.pedB} mm² | A1 = {state.N}×{state.B} = {state.N * state.B} mm² | CF = {Math.min(Math.sqrt(state.pedL * state.pedB / (state.N * state.B)), 2.0).toFixed(4)}
              </div>
            </>
          ) : (
            <>
              <div className="p-3 rounded-lg mb-4 warn-2" style={{ fontSize: 12 }}>
                ⚡ SLAB ON GRADE MODE — ACI 318-19 Section 26.2: 4 reduced checks. CF = 1.0 (conservative). Thickness governs.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="eng-label">Slab Thickness ts (mm) <span style={{ color: '#CF222E' }}>*</span></label>
                  <input className="eng-input success" defaultValue={state.slabTs}
                    onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange({ slabTs: v }); }} />
                  <div style={{ fontSize: 11, color: '#8C959F', marginTop: 4 }}>hef ≤ ts − 75mm = {state.slabTs - 75}mm</div>
                </div>
                <div>
                  <label className="eng-label">Edge Distance from Slab Edge (mm)</label>
                  <input className="eng-input" defaultValue={state.slabEdgeDist}
                    onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange({ slabEdgeDist: v }); }} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Section Override Modal */}
      {sectionOverrideModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(31,35,40,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 12, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(31,35,40,0.25)' }}>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, background: '#FFF8C5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 18 }}>🔒</span>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2328', marginBottom: 4 }}>Section Dimensions Locked</div>
                  <div style={{ fontSize: 13, color: '#656D76' }}>You have manually edited dimensions. Changing the section designation will overwrite your changes. Continue?</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setSectionOverrideModal(false); setPendingSection(null); }} className="btn-eng-primary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button onClick={confirmOverride} className="btn-eng-secondary" style={{ flex: 1, justifyContent: 'center' }}>Overwrite</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Base Plate Plan SVG ----
function BasePlateSVG({ N, B, d, bf, anchorCount }: { N: number; B: number; d: number; bf: number; anchorCount: number }) {
  const W = 280, H = 220;
  const scale = Math.min((W - 40) / N, (H - 40) / B);
  const pW = N * scale, pH = B * scale;
  const px = (W - pW) / 2, py = (H - pH) / 2;
  const cW = d * scale, cH = bf * scale;
  const cx = (W - cW) / 2, cy = (H - cH) / 2;
  const edgeX = 50 * scale, edgeY = 50 * scale;

  const anchors: [number, number][] = anchorCount >= 4 ? [
    [px + edgeX, py + edgeY],
    [px + pW - edgeX, py + edgeY],
    [px + edgeX, py + pH - edgeY],
    [px + pW - edgeX, py + pH - edgeY],
  ] : [];

  return (
    <div style={{ border: '1px solid #EAEEF2', borderRadius: 8, overflow: 'hidden', background: 'white' }}>
      <div style={{ padding: '6px 12px', borderBottom: '1px solid #EAEEF2', fontSize: 11, color: '#8C959F', fontWeight: 600 }}>
        BASE PLATE PLAN — {N}×{B}mm (scale: 1:{Math.round(1 / scale)})
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Plate outline */}
        <rect x={px} y={py} width={pW} height={pH} fill="#DDF4FF" stroke="#0969DA" strokeWidth={1.5} />
        {/* Column footprint */}
        <rect x={cx} y={cy} width={cW} height={cH} fill="none" stroke="#0969DA" strokeWidth={2} strokeDasharray="4 2" />
        {/* Column flange hatching */}
        <rect x={cx} y={cy} width={cW} height={cH * 0.15} fill="#0969DA" opacity={0.3} />
        <rect x={cx} y={cy + cH * 0.85} width={cW} height={cH * 0.15} fill="#0969DA" opacity={0.3} />
        <rect x={cx + cW * 0.45} y={cy} width={cW * 0.1} height={cH} fill="#0969DA" opacity={0.15} />
        {/* Anchor bolts */}
        {anchors.map(([ax, ay], i) => (
          <g key={i}>
            <circle cx={ax} cy={ay} r={5} fill="#0969DA" opacity={0.7} />
            <circle cx={ax} cy={ay} r={8} fill="none" stroke="#0969DA" strokeWidth={1} opacity={0.5} />
          </g>
        ))}
        {/* Dimension lines */}
        <line x1={px} y1={H - 12} x2={px + pW} y2={H - 12} stroke="#8C959F" strokeWidth={0.8} markerEnd="url(#arrow)" />
        <text x={px + pW / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="#8C959F">{N} mm</text>
        <line x1={12} y1={py} x2={12} y2={py + pH} stroke="#8C959F" strokeWidth={0.8} />
        <text x={8} y={py + pH / 2} textAnchor="middle" fontSize={9} fill="#8C959F" transform={`rotate(-90,8,${py + pH / 2})`}>{B} mm</text>
      </svg>
    </div>
  );
}
