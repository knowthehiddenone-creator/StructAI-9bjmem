import React from 'react';
import type { DesignState } from '@/types';
import { applyCodeDefaults } from '@/lib/defaultState';
import { UNIT_LABELS } from '@/lib/materialData';

interface Props {
  state: DesignState;
  onChange: (updates: Partial<DesignState>) => void;
}

export default function StepCodeProject({ state, onChange }: Props) {
  const handleCodeChange = (code: string) => {
    const updates = applyCodeDefaults({ ...state, code: code as DesignState['code'] });
    onChange({ code: code as DesignState['code'], ...updates });
  };

  const codeLabel = UNIT_LABELS[state.code];

  return (
    <div>
      <div style={{ marginBottom: 4, fontSize: 12, color: '#8C959F' }}>Step 1 of 10</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1F2328', marginBottom: 4 }}>Design Basis & Project</h1>
      <p style={{ fontSize: 14, color: '#656D76', marginBottom: 20 }}>
        Select design code — units auto-switch instantly (<strong>RC-5</strong>). All defaults pre-loaded per <strong>RC-8</strong>.
      </p>

      {/* Design Code */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #EAEEF2' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2328' }}>Design Code & Method</div>
          <div style={{ fontSize: 12, color: '#656D76', marginTop: 2 }}>RC-5: Selecting code instantly relabels all unit fields</div>
        </div>
        <div style={{ padding: 16 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="eng-label">Design Code <span style={{ color: '#CF222E' }}>*</span></label>
              <select className="eng-select" value={state.code} onChange={e => handleCodeChange(e.target.value)}>
                <option value="IS800">IS 800:2007 — Indian Standard</option>
                <option value="AISC_LRFD">AISC 360-22 — LRFD</option>
                <option value="AISC_ASD">AISC 360-22 — ASD</option>
              </select>
              {codeLabel && (
                <div style={{ fontSize: 11, color: '#0969DA', marginTop: 4 }}>
                  ✓ Auto-switched to: {codeLabel.force} / {codeLabel.moment} / {codeLabel.length} / {codeLabel.stress}
                </div>
              )}
            </div>
            <div>
              <label className="eng-label">Design Method</label>
              <input className="eng-input" readOnly value={
                state.code === 'IS800' ? 'Limit State Method (LSM) — IS 800:2007' :
                state.code === 'AISC_LRFD' ? 'LRFD — Load & Resistance Factor Design' :
                'ASD — Allowable Stress Design'
              } />
            </div>
            <div>
              <label className="eng-label">Load Type</label>
              <select className="eng-select" value={state.loadType}
                onChange={e => onChange({ loadType: e.target.value as 'Factored' | 'Service' })}>
                <option value="Factored">Factored Loads</option>
                <option value="Service">Service Loads</option>
              </select>
            </div>
            <div>
              <label className="eng-label">Support Type <span style={{ color: '#CF222E' }}>*</span></label>
              <select className="eng-select" value={state.supportType}
                onChange={e => onChange({ supportType: e.target.value as 'PEDESTAL' | 'SLAB' })}>
                <option value="PEDESTAL">Pedestal — ACI 318-19 Ch.17 Full (8 checks)</option>
                <option value="SLAB">Slab on Grade — ACI 318-19 Sec.26.2 (4 checks)</option>
              </select>
              <div style={{ fontSize: 11, color: '#0969DA', marginTop: 4 }}>
                {state.supportType === 'PEDESTAL'
                  ? '✓ Full ACI 318-19 Chapter 17 — all 8 anchor checks (RC-10)'
                  : '✓ Reduced ACI 318-19 Section 26.2 — 4 checks only (RC-10)'}
              </div>
            </div>
          </div>

          {/* Code comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { code: 'IS800',      label: 'IS 800:2007',  desc: 'Indian LSM', units: 'kN, kNm, mm, MPa', active: state.code === 'IS800' },
              { code: 'AISC_LRFD', label: 'AISC 360-22',  desc: 'US LRFD',    units: 'kips, kip-ft, in, ksi', active: state.code === 'AISC_LRFD' },
              { code: 'AISC_ASD',  label: 'AISC 360-22',  desc: 'US ASD',     units: 'kips, kip-ft, in, ksi', active: state.code === 'AISC_ASD' },
            ].map(item => (
              <div key={item.code} onClick={() => handleCodeChange(item.code)}
                style={{
                  padding: 12, borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                  border: `2px solid ${item.active ? '#0969DA' : '#EAEEF2'}`,
                  background: item.active ? '#DDF4FF' : '#F6F8FA',
                }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: item.active ? '#0969DA' : '#1F2328' }}>{item.label} {item.desc}</div>
                <div style={{ fontSize: 11, color: '#8C959F', marginTop: 2, fontFamily: 'ui-monospace,monospace' }}>{item.units}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #EAEEF2' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2328' }}>Project Details</div>
          <div style={{ fontSize: 12, color: '#656D76', marginTop: 2 }}>Appears in PDF report header</div>
        </div>
        <div style={{ padding: 16 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="eng-label">Project Name</label>
              <input className="eng-input" value={state.projectName}
                onChange={e => onChange({ projectName: e.target.value })}
                placeholder="e.g. Industrial Building — Grid C3" />
            </div>
            <div>
              <label className="eng-label">Designer</label>
              <input className="eng-input" value={state.designer}
                onChange={e => onChange({ designer: e.target.value })}
                placeholder="Sr. Structural Engineer" />
            </div>
            <div>
              <label className="eng-label">Revision</label>
              <input className="eng-input" value={state.revision}
                onChange={e => onChange({ revision: e.target.value })}
                placeholder="R0 — Initial" />
            </div>
            <div>
              <label className="eng-label">Date</label>
              <input className="eng-input" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
