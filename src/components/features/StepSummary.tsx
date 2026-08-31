import React from 'react';
import type { DesignState, DesignResults } from '@/types';
import StatusBadge from './StatusBadge';
import UtilBar from './UtilBar';
import WarnCard from './WarnCard';

interface Props {
  state: DesignState;
  results: DesignResults;
  onGenerateReport: () => void;
  onNewDesign: () => void;
}

export default function StepSummary({ state, results, onGenerateReport, onNewDesign }: Props) {
  const r = results;

  const summaryChecks = [
    { name: 'Plate Minimum Size',    util: r.geometry.utilization,          pass: r.geometry.pass,          clause: r.geometry.clause.split('/')[0].trim() },
    { name: 'Concrete Bearing',      util: r.bearing.utilization,           pass: r.bearing.pass,           clause: r.bearing.clause.split('/')[0].trim() },
    { name: 'Plate Thickness',       util: r.plate_thickness.utilization,   pass: r.plate_thickness.pass,   clause: r.plate_thickness.clause.split('/')[0].trim() },
    { name: 'Anchor Steel Tension',  util: r.anchor_tension.utilization,    pass: r.anchor_tension.pass,    clause: r.anchor_tension.clause.split('/')[0].trim() },
    { name: 'Anchor Shear',          util: r.anchor_shear.utilization,      pass: r.anchor_shear.pass,      clause: r.anchor_shear.clause.split('/')[0].trim() },
    { name: 'T-V Interaction',       util: r.anchor_interaction.utilization, pass: r.anchor_interaction.pass, clause: r.anchor_interaction.clause.split('/')[0].trim() },
    { name: 'Embedment Depth',       util: r.embedment.utilization,         pass: r.embedment.pass,         clause: r.embedment.clause.split('/')[0].trim() },
  ];

  const allWarnings = [
    ...r.geometry.warnings, ...r.bearing.warnings,
    ...r.plate_thickness.warnings, ...r.anchor_tension.warnings,
    ...r.anchor_shear.warnings, ...r.anchor_interaction.warnings,
    ...r.embedment.warnings,
  ].sort((a, b) => b.level - a.level);

  const overallColor = r.overall === 'PASS' ? '#1A7F37' : r.overall === 'CAUTION' ? '#9A6700' : '#CF222E';
  const overallBg    = r.overall === 'PASS' ? '#DAFBE1' : r.overall === 'CAUTION' ? '#FFF8C5' : '#FFEBE9';
  const overallBorder = r.overall === 'PASS' ? '#4AC26B' : r.overall === 'CAUTION' ? '#D4A72C' : '#FF8182';

  return (
    <div>
      <div style={{ marginBottom: 4, fontSize: 12, color: '#8C959F' }}>Step 10 of 10 — SUMMARY</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1F2328', marginBottom: 4 }}>Design Summary & Report</h1>
      <p style={{ fontSize: 14, color: '#656D76', marginBottom: 20 }}>
        All 17 checks complete. {r.overall === 'PASS' ? 'Design is safe and adequate.' : 'Review warnings before proceeding.'}
      </p>

      {/* Overall status */}
      <div style={{ padding: 20, borderRadius: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, background: overallBg, border: `1px solid ${overallBorder}` }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: overallColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: 'white', fontSize: 24 }}>{r.overall === 'PASS' ? '✓' : r.overall === 'CAUTION' ? '⚡' : '✗'}</span>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: overallColor }}>
            {r.overall === 'PASS' ? '✓ DESIGN ADEQUATE' : r.overall === 'CAUTION' ? '⚡ REVIEW REQUIRED' : '❌ REDESIGN REQUIRED'}
          </div>
          <div style={{ fontSize: 13, color: '#656D76', marginTop: 4 }}>
            {state.code} | {state.colDesig} | {state.N}×{state.B}×{state.tp}mm plate | {state.supportType}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <StatusBadge status={r.overall} util={r.overallUtil} />
        </div>
      </div>

      {/* Check table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #EAEEF2', fontSize: 15, fontWeight: 600, color: '#1F2328' }}>
          Check Summary — {summaryChecks.filter(c => c.pass).length}/{summaryChecks.length} Passed
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F6F8FA' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#656D76', borderBottom: '1px solid #EAEEF2' }}>Check</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#656D76', borderBottom: '1px solid #EAEEF2', display: 'none' }} className="sm:table-cell">Code Clause</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#656D76', borderBottom: '1px solid #EAEEF2' }}>Utilisation</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#656D76', borderBottom: '1px solid #EAEEF2', minWidth: 120 }}>Bar</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#656D76', borderBottom: '1px solid #EAEEF2' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {summaryChecks.map((ch, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #EAEEF2' }}>
                  <td style={{ padding: '10px 12px', color: '#1F2328' }}>{ch.name}</td>
                  <td style={{ padding: '10px 12px', color: '#656D76', fontSize: 11 }}></td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'ui-monospace,monospace', fontSize: 12, fontWeight: 600, color: ch.util > 1 ? '#CF222E' : ch.util > 0.9 ? '#9A6700' : '#1F2328' }}>
                    {(ch.util * 100).toFixed(1)}%
                  </td>
                  <td style={{ padding: '10px 12px', minWidth: 120 }}>
                    <UtilBar util={ch.util} showPercent={false} />
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <StatusBadge status={ch.pass ? 'PASS' : 'REDESIGN'} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Final design output */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2328', marginBottom: 12 }}>Final Design Output</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {[
            { label: 'COLUMN', main: state.colDesig, sub: `d=${state.d}mm, bf=${state.bf}mm, tf=${state.tf}mm`, extra: `Grade: ${state.colGrade} (Fy=${state.colFy} MPa)` },
            { label: 'BASE PLATE', main: `${state.N}×${state.B}×${state.tp}mm`, sub: `Grade: ${state.plateGrade} (Fy=${state.plateFy} MPa)`, extra: `tp_req=${r.plate_thickness.tp_required}mm  ${r.plate_thickness.pass ? '✓' : '✗'}`, extraColor: r.plate_thickness.pass ? '#1A7F37' : '#CF222E' },
            { label: `CONCRETE (${state.supportType})`, main: `${state.concreteGrade}`, sub: `fck = ${state.fck} MPa`, extra: state.supportType === 'PEDESTAL' ? `${state.pedL}×${state.pedB}×${state.pedD}mm pedestal` : `${state.slabTs}mm slab on grade` },
            { label: 'ANCHOR BOLTS', main: `${state.anchorCount}×Ø${state.anchorDia}mm`, sub: state.anchorGrade, extra: `hef = ${state.hef}mm` },
          ].map((item, i) => (
            <div key={i} style={{ padding: 12, background: '#F6F8FA', borderRadius: 8, border: '1px solid #EAEEF2' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#8C959F', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1F2328', marginBottom: 2 }}>{item.main}</div>
              <div style={{ fontSize: 12, color: '#656D76' }}>{item.sub}</div>
              {item.extra && <div style={{ fontSize: 12, color: (item as { extraColor?: string }).extraColor || '#0969DA', marginTop: 2 }}>{item.extra}</div>}
            </div>
          ))}
        </div>

        {/* RC compliance note */}
        <div className="p-3 rounded-lg warn-1" style={{ fontSize: 12, lineHeight: 1.7 }}>
          <strong>Engineering Notes — RC Compliance:</strong><br />
          ✓ RC-2: Plate dimensions confirmed as entered — NOT auto-adjusted ({state.N}×{state.B}×{state.tp}mm)<br />
          ✓ RC-3: P = {state.P} kN → {state.P > 0 ? 'Compression' : state.P < 0 ? 'Uplift' : 'Shear dominant'} (sign convention applied)<br />
          ✓ RC-4: Load combination {state.loadCombo} | Code: {state.code}<br />
          ✓ RC-10: {state.supportType} mode — {state.supportType === 'PEDESTAL' ? 'Full ACI 318-19 Ch.17' : 'Reduced ACI 318-19 Sec.26.2'} applied
        </div>
      </div>

      {/* Warnings */}
      {allWarnings.length > 0 && (
        <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2328', marginBottom: 12 }}>
            All Warnings ({allWarnings.length})
          </div>
          {allWarnings.map((w, i) => <WarnCard key={i} warning={w} />)}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 }}>
        <button onClick={onNewDesign} className="btn-eng-secondary">↺ New Design</button>
        <button onClick={onGenerateReport} className="btn-eng-primary" style={{ padding: '10px 24px', fontSize: 15 }}>
          ↓ Generate PDF Report
        </button>
      </div>
    </div>
  );
}
