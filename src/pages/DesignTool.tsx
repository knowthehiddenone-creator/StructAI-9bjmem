import React, { useState, useCallback, useRef } from 'react';
import type { DesignState } from '@/types';
import { runAllCalculations, generateReportText } from '@/lib/calculations';
import { createDefaultState } from '@/lib/defaultState';
import StatusBadge from '@/components/features/StatusBadge';
import UtilBar from '@/components/features/UtilBar';

// Step components
import StepCodeProject     from '@/components/features/StepCodeProject';
import StepNLInput         from '@/components/features/StepNLInput';
import StepMaterials       from '@/components/features/StepMaterials';
import StepGeometry        from '@/components/features/StepGeometry';
import StepLoads           from '@/components/features/StepLoads';
import StepAnchors         from '@/components/features/StepAnchors';
import StepBearing         from '@/components/features/StepBearing';
import StepPlateThickness  from '@/components/features/StepPlateThickness';
import StepAnchorChecks    from '@/components/features/StepAnchorChecks';
import StepSummary         from '@/components/features/StepSummary';

const STEPS = [
  { n: 1,  label: 'Code & Project' },
  { n: 2,  label: 'NL Input' },
  { n: 3,  label: 'Materials' },
  { n: 4,  label: 'Geometry' },
  { n: 5,  label: 'Loads' },
  { n: 6,  label: 'Anchors' },
  { n: 7,  label: 'Bearing' },
  { n: 8,  label: 'Plate tp' },
  { n: 9,  label: 'Anc Checks' },
  { n: 10, label: 'Summary' },
];

interface Props {
  onBack: () => void;
}

export default function DesignTool({ onBack }: Props) {
  const [state, setState] = useState<DesignState>(createDefaultState);
  const [showReport, setShowReport] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const updateState = useCallback((updates: Partial<DesignState>) => {
    setState(prev => ({ ...prev, ...updates, results: null }));
  }, []);

  const goToStep = useCallback((n: number) => {
    setState(prev => ({ ...prev, currentStep: n }));
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const nextStep = () => goToStep(Math.min(state.currentStep + 1, 10));
  const prevStep = () => goToStep(Math.max(state.currentStep - 1, 1));

  // Compute results when needed (steps 7+)
  const results = state.currentStep >= 7
    ? (state.results || runAllCalculations(state))
    : null;

  // Units toggle
  const setUnits = (u: 'SI' | 'US') => updateState({ units: u });

  const handleGenerateReport = () => setShowReport(true);
  const handleNewDesign = () => { setState(createDefaultState()); setShowReport(false); };

  const isIS = state.code === 'IS800';
  const quickResults = (() => {
    try { return runAllCalculations(state); } catch { return null; }
  })();

  return (
    <div style={{ minHeight: '100vh', background: '#F6F8FA', display: 'flex', flexDirection: 'column' }}>
      {/* STICKY HEADER */}
      <header className="tool-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '0 16px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onBack}
              style={{ color: '#656D76', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
              ← Home
            </button>
            <span style={{ color: '#D0D7DE' }}>|</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1F2328' }}>
              Struct<span style={{ color: '#0969DA' }}>AI</span> BasePlate
            </span>
            <span className="status-badge badge-pass" style={{ fontSize: 10 }}>v4.0</span>
            <span style={{ fontSize: 11, color: '#8C959F', display: 'none' }} className="sm:inline">
              {state.code === 'IS800' ? 'IS 800:2007 LSM' : state.code === 'AISC_LRFD' ? 'AISC LRFD' : 'AISC ASD'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Unit toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: 3, borderRadius: 8, background: '#F6F8FA', border: '1px solid #EAEEF2' }}>
              <button onClick={() => setUnits('SI')}
                style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', background: state.units === 'SI' ? '#0969DA' : 'transparent', color: state.units === 'SI' ? 'white' : '#656D76', transition: 'all 0.15s' }}>
                SI (kN/mm)
              </button>
              <button onClick={() => setUnits('US')}
                style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', background: state.units === 'US' ? '#0969DA' : 'transparent', color: state.units === 'US' ? 'white' : '#656D76', transition: 'all 0.15s' }}>
                US (kips/in)
              </button>
            </div>
            <button onClick={handleGenerateReport} className="btn-eng-primary" style={{ padding: '6px 14px', fontSize: 12 }}>
              ↓ PDF Report
            </button>
          </div>
        </div>
      </header>

      {/* PROGRESS STEPS */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #EAEEF2', padding: '0 16px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0', maxWidth: 1100, margin: '0 auto', gap: 0, minWidth: 600 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.n}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0, cursor: 'pointer' }}
                onClick={() => goToStep(s.n)}>
                <div className={`step-circle ${s.n < state.currentStep ? 'done' : s.n === state.currentStep ? 'active' : ''}`}>
                  {s.n < state.currentStep ? '✓' : s.n}
                </div>
                <span style={{ fontSize: 9, color: s.n === state.currentStep ? '#0969DA' : '#8C959F', whiteSpace: 'nowrap', maxWidth: 60, textAlign: 'center', lineHeight: 1.2 }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: s.n < state.currentStep ? '#1A7F37' : '#EAEEF2', margin: '0 2px', marginBottom: 16 }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ flex: 1, display: 'flex', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        {/* SIDEBAR */}
        <aside style={{ width: 220, flexShrink: 0, padding: '16px 12px', background: '#FFFFFF', borderRight: '1px solid #EAEEF2', position: 'sticky', top: 106, height: 'calc(100vh - 106px)', overflowY: 'auto' }} className="hidden md:block">
          <div style={{ fontSize: 10, fontWeight: 700, color: '#8C959F', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px', marginBottom: 8 }}>Design Steps</div>
          <nav>
            {STEPS.map(s => (
              <div key={s.n} onClick={() => goToStep(s.n)}
                className={`sidebar-item ${s.n === state.currentStep ? 'active' : ''}`}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0,
                  background: s.n < state.currentStep ? '#DAFBE1' : s.n === state.currentStep ? '#DDF4FF' : '#F6F8FA',
                  border: `1px solid ${s.n < state.currentStep ? '#4AC26B' : s.n === state.currentStep ? '#54AEFF' : '#D0D7DE'}`,
                  color: s.n < state.currentStep ? '#1A7F37' : s.n === state.currentStep ? '#0969DA' : '#8C959F',
                }}>
                  {s.n < state.currentStep ? '✓' : s.n}
                </span>
                <span>{s.label}</span>
              </div>
            ))}
          </nav>

          <div style={{ height: 1, background: '#EAEEF2', margin: '12px 0' }} />

          <div style={{ fontSize: 10, fontWeight: 700, color: '#8C959F', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px', marginBottom: 8 }}>Quick Info</div>
          <div style={{ fontSize: 11, color: '#656D76', padding: '0 8px', lineHeight: 1.8 }}>
            <div>Code: <strong style={{ color: '#1F2328' }}>{state.code}</strong></div>
            <div>Column: <strong style={{ color: '#1F2328' }}>{state.colDesig}</strong></div>
            <div>Plate: <strong style={{ color: '#1F2328' }}>{state.N}×{state.B}×{state.tp}</strong></div>
            <div>Support: <strong style={{ color: '#1F2328' }}>{state.supportType}</strong></div>
            <div>P: <strong style={{ color: state.P < 0 ? '#CF222E' : '#1A7F37' }}>{state.P} kN {state.P < 0 ? '⚠' : '✓'}</strong></div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, padding: '20px 20px', minWidth: 0, background: '#F6F8FA' }}>
          <div ref={contentRef} style={{ maxWidth: 800, margin: '0 auto' }}>

            {state.currentStep === 1  && <StepCodeProject state={state} onChange={updateState} />}
            {state.currentStep === 2  && <StepNLInput state={state} onChange={updateState} />}
            {state.currentStep === 3  && <StepMaterials state={state} onChange={updateState} />}
            {state.currentStep === 4  && <StepGeometry state={state} onChange={updateState} />}
            {state.currentStep === 5  && <StepLoads state={state} onChange={updateState} />}
            {state.currentStep === 6  && <StepAnchors state={state} onChange={updateState} />}
            {state.currentStep === 7  && results && <StepBearing state={state} results={results} />}
            {state.currentStep === 8  && results && <StepPlateThickness state={state} results={results} />}
            {state.currentStep === 9  && results && <StepAnchorChecks state={state} results={results} />}
            {state.currentStep === 10 && results && (
              <StepSummary state={state} results={results} onGenerateReport={handleGenerateReport} onNewDesign={handleNewDesign} />
            )}

            {/* Navigation buttons */}
            {state.currentStep < 10 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                {state.currentStep > 1
                  ? <button onClick={prevStep} className="btn-eng-secondary">← Back</button>
                  : <div />
                }
                <button onClick={() => {
                  if (state.currentStep === 6) {
                    // Pre-run calculations before going to calc steps
                    const r = runAllCalculations(state);
                    setState(prev => ({ ...prev, results: r, currentStep: 7 }));
                    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    nextStep();
                  }
                }} className="btn-eng-primary">
                  {state.currentStep === 6 ? 'Calculate & Proceed →' : `Next: ${STEPS[state.currentStep]?.label || 'Summary'} →`}
                </button>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT PANEL */}
        <aside style={{ width: 260, flexShrink: 0, padding: 14, background: '#FFFFFF', borderLeft: '1px solid #EAEEF2' }} className="hidden lg:block">
          <div style={{ position: 'sticky', top: 108, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#8C959F', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Design Status</div>

            {quickResults ? (
              <>
                <div style={{ padding: 12, borderRadius: 8, marginBottom: 12, background: '#F6F8FA', border: '1px solid #EAEEF2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1F2328' }}>Overall</span>
                    <StatusBadge status={quickResults.overall} />
                  </div>
                  <div style={{ fontSize: 11, color: '#656D76', lineHeight: 1.8 }}>
                    <div>Bearing: <strong style={{ color: quickResults.bearing.utilization > 1 ? '#CF222E' : '#1A7F37' }}>{(quickResults.bearing.utilization * 100).toFixed(0)}%</strong></div>
                    <div>Plate tp: <strong style={{ color: quickResults.plate_thickness.utilization > 1 ? '#CF222E' : '#1A7F37' }}>{(quickResults.plate_thickness.utilization * 100).toFixed(0)}%</strong></div>
                    <div>Anchor T: <strong style={{ color: quickResults.anchor_tension.utilization > 1 ? '#CF222E' : '#1A7F37' }}>{(quickResults.anchor_tension.utilization * 100).toFixed(0)}%</strong></div>
                    <div>Anchor V: <strong style={{ color: quickResults.anchor_shear.utilization > 1 ? '#CF222E' : '#1A7F37' }}>{(quickResults.anchor_shear.utilization * 100).toFixed(0)}%</strong></div>
                  </div>
                </div>

                <div style={{ fontSize: 10, fontWeight: 700, color: '#8C959F', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Utilisation</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  {[
                    { label: 'Bearing',      util: quickResults.bearing.utilization },
                    { label: 'Plate tp',     util: quickResults.plate_thickness.utilization },
                    { label: 'Anchor T',     util: quickResults.anchor_tension.utilization },
                    { label: 'Anchor V',     util: quickResults.anchor_shear.utilization },
                    { label: 'T-V Interact', util: quickResults.anchor_interaction.utilization },
                  ].map(item => (
                    <UtilBar key={item.label} label={item.label} util={item.util} />
                  ))}
                </div>

                <div style={{ fontSize: 10, fontWeight: 700, color: '#8C959F', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Warnings</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {[
                    ...quickResults.bearing.warnings,
                    ...quickResults.plate_thickness.warnings,
                    ...quickResults.anchor_tension.warnings,
                  ].slice(0, 4).map((w, i) => (
                    <div key={i} className={`warn-${w.level}`} style={{ padding: '5px 8px', borderRadius: 5, fontSize: 11 }}>
                      {w.title || w.message.substring(0, 50)}
                    </div>
                  ))}
                  {[...quickResults.bearing.warnings, ...quickResults.plate_thickness.warnings, ...quickResults.anchor_tension.warnings].length === 0 && (
                    <div style={{ fontSize: 12, color: '#1A7F37', display: 'flex', alignItems: 'center', gap: 4 }}>✓ No warnings</div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 12, color: '#8C959F' }}>Enter inputs to see live results</div>
            )}
          </div>
        </aside>
      </div>

      {/* REPORT MODAL */}
      {showReport && quickResults && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(31,35,40,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 12, maxWidth: 560, width: '100%', boxShadow: '0 20px 60px rgba(31,35,40,0.25)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #EAEEF2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1F2328', margin: 0 }}>PDF Report — 21 Sections</h3>
              <button onClick={() => setShowReport(false)} style={{ color: '#656D76', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ padding: 16, flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: 12, borderRadius: 8, marginBottom: 12, background: '#DAFBE1', border: '1px solid #4AC26B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ color: '#1A7F37', fontWeight: 700 }}>✓ Report Ready</span>
                  <StatusBadge status={quickResults.overall} />
                </div>
                <div style={{ fontSize: 12, color: '#1A7F37' }}>
                  {state.code} | {state.colDesig} | {state.N}×{state.B}×{state.tp}mm | Load combo: {state.loadCombo}
                </div>
              </div>
              <pre style={{
                background: '#161B22', borderRadius: 8, padding: 14,
                fontFamily: 'ui-monospace,monospace', fontSize: 11, color: '#E6EDF3',
                lineHeight: 1.6, maxHeight: 350, overflowY: 'auto', whiteSpace: 'pre-wrap',
                border: '1px solid #30363D',
              }}>
                {generateReportText(state, quickResults)}
              </pre>
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid #EAEEF2', display: 'flex', gap: 10 }}>
              <button onClick={() => setShowReport(false)} className="btn-eng-secondary" style={{ flex: 1, justifyContent: 'center' }}>Close</button>
              <button onClick={() => setShowReport(false)} className="btn-eng-primary" style={{ flex: 1, justifyContent: 'center' }}>↓ Download PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
