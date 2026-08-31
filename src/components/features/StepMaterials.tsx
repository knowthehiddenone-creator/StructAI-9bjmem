import React, { useState, useCallback } from 'react';
import type { DesignState } from '@/types';
import {
  getSteelGrades, getConcreteGrades,
  STEEL_GRADES_IS, STEEL_GRADES_AISC,
  CONCRETE_IS, CONCRETE_ACI,
} from '@/lib/materialData';

interface Props {
  state: DesignState;
  onChange: (updates: Partial<DesignState>) => void;
}

type MaterialTab = 'col' | 'plate' | 'conc';

export default function StepMaterials({ state, onChange }: Props) {
  const [activeTab, setActiveTab] = useState<MaterialTab>('col');
  const isIS = state.code === 'IS800';
  const steelDb = getSteelGrades(state.code);
  const concDb  = getConcreteGrades(state.code);

  const setColGrade = (g: string) => {
    const p = steelDb[g];
    if (p) onChange({ colGrade: g, colFy: p.fy, colFu: p.fu });
  };
  const setPlateGrade = (g: string) => {
    const p = steelDb[g];
    if (p) onChange({ plateGrade: g, plateFy: p.fy, plateFu: p.fu });
  };
  const setConcGrade = (g: string) => {
    const p = concDb[g];
    if (p) onChange({ concreteGrade: g, fck: p.fck });
  };

  const tabs: { key: MaterialTab; label: string }[] = [
    { key: 'col',   label: 'Column Steel' },
    { key: 'plate', label: 'Plate Steel' },
    { key: 'conc',  label: 'Concrete' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 4, fontSize: 12, color: '#8C959F' }}>Step 3 of 10</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1F2328', marginBottom: 4 }}>Material Properties</h1>
      <p style={{ fontSize: 14, color: '#656D76', marginBottom: 20 }}>
        Default grades pre-selected per <strong>RC-8</strong>. Grade auto-fills Fy and Fu — read-only when standard grade.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #EAEEF2', marginBottom: 20, background: '#FFFFFF', borderRadius: '8px 8px 0 0', border: '1px solid #EAEEF2', borderBottomColor: '#EAEEF2', padding: '4px 4px 0' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`tab-btn ${activeTab === t.key ? 'active' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Column Steel */}
      {activeTab === 'col' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: '0 8px 8px 8px', padding: 20, marginBottom: 20 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="eng-label">Column Steel Grade <span style={{ color: '#0969DA', fontSize: 10 }}>RC-8: Pre-selected</span></label>
              <select className="eng-select" value={state.colGrade} onChange={e => setColGrade(e.target.value)}>
                {Object.keys(steelDb).map(k => <option key={k} value={k}>{steelDb[k].label}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label className="eng-label">Fy (MPa)</label>
                <input className="eng-input" value={state.colFy} readOnly />
              </div>
              <div style={{ flex: 1 }}>
                <label className="eng-label">Fu (MPa)</label>
                <input className="eng-input" value={state.colFu} readOnly />
              </div>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <div className="p-3 rounded-lg warn-1" style={{ fontSize: 12 }}>
                ℹ RC-8: Grade auto-fills Fy and Fu. Material properties per {isIS ? 'IS 2062:2011' : 'ASTM Standards'}.
                Standard grade values are read-only — select "Custom" to override.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plate Steel */}
      {activeTab === 'plate' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: '0 8px 8px 8px', padding: 20, marginBottom: 20 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="eng-label">Plate Steel Grade</label>
              <select className="eng-select" value={state.plateGrade} onChange={e => setPlateGrade(e.target.value)}>
                {Object.keys(steelDb).map(k => <option key={k} value={k}>{steelDb[k].label}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label className="eng-label">Fy (MPa)</label>
                <input className="eng-input" value={state.plateFy} readOnly />
              </div>
              <div style={{ flex: 1 }}>
                <label className="eng-label">Fu (MPa)</label>
                <input className="eng-input" value={state.plateFu} readOnly />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Concrete */}
      {activeTab === 'conc' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: '0 8px 8px 8px', padding: 20, marginBottom: 20 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="eng-label">Concrete Grade</label>
              <select className="eng-select" value={state.concreteGrade} onChange={e => setConcGrade(e.target.value)}>
                {Object.keys(concDb).map(k => <option key={k} value={k}>{concDb[k].label}</option>)}
              </select>
            </div>
            <div>
              <label className="eng-label">fck / f'c (MPa)</label>
              <input className="eng-input" value={state.fck} readOnly />
            </div>
            <div>
              <label className="eng-label">Concrete Density</label>
              <select className="eng-select" value={state.concreteLightweight ? 'LW' : 'NW'}
                onChange={e => onChange({ concreteLightweight: e.target.value === 'LW' })}>
                <option value="NW">Normal Weight (λ = 1.0)</option>
                <option value="LW">Lightweight (λ = 0.75)</option>
              </select>
            </div>
            <div>
              <label className="eng-label">Cracked Concrete</label>
              <select className="eng-select" value={state.crackedConcrete ? 'cracked' : 'uncracked'}
                onChange={e => onChange({ crackedConcrete: e.target.value === 'cracked' })}>
                <option value="cracked">Cracked (conservative — ACI 318-19)</option>
                <option value="uncracked">Uncracked (if proven)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
