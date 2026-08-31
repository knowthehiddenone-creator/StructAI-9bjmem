import React, { useState } from 'react';
import type { DesignState } from '@/types';
import { getLoadCombos, UNIT_LABELS } from '@/lib/materialData';
import SignBadge, { getConditionFromP } from './SignBadge';

interface Props {
  state: DesignState;
  onChange: (updates: Partial<DesignState>) => void;
}

export default function StepLoads({ state, onChange }: Props) {
  const [selectedCombo, setSelectedCombo] = useState(state.loadCombo);
  const combos = getLoadCombos(state.code);
  const units  = UNIT_LABELS[state.code] || UNIT_LABELS.IS800;
  const condition = getConditionFromP(state.P);

  const handlePChange = (v: string) => {
    const val = parseFloat(v);
    if (!isNaN(val)) onChange({ P: val });
  };

  const selectCombo = (id: string) => {
    setSelectedCombo(id);
    onChange({ loadCombo: id });
  };

  return (
    <div>
      <div style={{ marginBottom: 4, fontSize: 12, color: '#8C959F' }}>Step 5 of 10</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1F2328', marginBottom: 4 }}>Loads & Combinations</h1>
      <p style={{ fontSize: 14, color: '#656D76', marginBottom: 20 }}>
        <strong>RC-3:</strong> +P = Compression, −P = Uplift — sign drives condition automatically.
        <strong> RC-4:</strong> Combinations auto-loaded from code selection.
      </p>

      {/* Load Inputs */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #EAEEF2' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2328' }}>Design Loads — Sign Convention (RC-3)</div>
          <div style={{ fontSize: 12, color: '#656D76', marginTop: 2 }}>No radio button — sign drives condition automatically</div>
        </div>
        <div style={{ padding: 16 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="eng-label">Axial Load P ({units.force})</label>
              <input className={`eng-input ${state.P < 0 ? 'error' : 'success'}`}
                defaultValue={state.P} onBlur={e => handlePChange(e.target.value)}
                onInput={e => handlePChange((e.target as HTMLInputElement).value)}
                placeholder="+= compression, -= uplift" />
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#656D76' }}>Condition:</span>
                <SignBadge condition={condition} />
              </div>
              <div style={{ fontSize: 11, color: '#8C959F', marginTop: 4 }}>RC-3: No radio button — sign drives condition</div>
            </div>
            <div>
              <label className="eng-label">Moment Mx ({units.moment})</label>
              <input className="eng-input" defaultValue={state.Mx}
                onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange({ Mx: v }); }} />
            </div>
            <div>
              <label className="eng-label">Moment My ({units.moment})</label>
              <input className="eng-input" defaultValue={state.My}
                onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange({ My: v }); }} />
            </div>
            <div>
              <label className="eng-label">Shear Vx ({units.force})</label>
              <input className="eng-input" defaultValue={state.Vx}
                onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange({ Vx: v }); }} />
            </div>
            <div>
              <label className="eng-label">Shear Vy ({units.force})</label>
              <input className="eng-input" defaultValue={state.Vy}
                onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange({ Vy: v }); }} />
            </div>
          </div>

          {/* Load summary */}
          {condition === 'UPLIFT' && (
            <div className="p-3 rounded-lg warn-4" style={{ fontSize: 12 }}>
              🔴 <strong>UPLIFT DETECTED.</strong> Anchor tension governs design. Full ACI 318-19 Ch.17 embedment check required.
              hef_required = 16d = {state.anchorDia * 16}mm
            </div>
          )}
        </div>
      </div>

      {/* Load Combinations */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #EAEEF2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2328' }}>Load Combinations (RC-4)</div>
            <div style={{ fontSize: 12, color: '#0969DA', marginTop: 2 }}>
              Auto-populated for {state.code} | {state.loadType} loads | {state.code === 'IS800' ? 'IS 875 / IS 1893' : 'ASCE 7-22'}
            </div>
          </div>
          <span className="code-pill">{combos.length} combos</span>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {combos.map((combo, i) => {
              const pVal = (state.P * combo.pf).toFixed(1);
              const mVal = (state.Mx * combo.mf).toFixed(1);
              const vVal = (state.Vx * combo.vf).toFixed(1);
              const isSelected = selectedCombo === combo.id || (selectedCombo === state.loadCombo && i === 0 && !combos.find(c => c.id === selectedCombo));

              return (
                <div key={combo.id} onClick={() => selectCombo(combo.id)}
                  className={`combo-row ${isSelected ? 'selected' : ''}`}
                  style={combo.uplift ? { borderColor: '#FF8182', background: isSelected ? '#FFEBE9' : undefined } : undefined}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', border: `2px solid ${isSelected ? '#0969DA' : '#D0D7DE'}`,
                    background: isSelected ? '#0969DA' : 'transparent', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isSelected && <span style={{ fontSize: 10, color: 'white' }}>✓</span>}
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: combo.uplift ? '#CF222E' : '#1F2328' }}>
                        {combo.name}{combo.uplift ? ' (Uplift check)' : ''}
                      </span>
                      <span style={{ fontSize: 12, color: '#656D76', marginLeft: 8 }}>{combo.formula}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, fontSize: 11, fontFamily: 'ui-monospace,monospace', color: '#8C959F' }}>
                      <span>P={pVal}{units.force}</span>
                      <span>M={mVal}{units.moment}</span>
                      <span>V={vVal}{units.force}</span>
                    </div>
                  </div>
                  {i === 1 && <span className="code-pill" style={{ fontSize: 10, flexShrink: 0 }}>GOVERNING</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
