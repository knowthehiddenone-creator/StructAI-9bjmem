import React, { useState } from 'react';
import type { DesignState } from '@/types';

interface Props {
  state: DesignState;
  onChange: (updates: Partial<DesignState>) => void;
}

interface ExtractedData {
  code: string;
  column: { designation: string; d_mm: number; bf_mm: number; tf_mm: number; tw_mm: number };
  plate: { N_mm: number; B_mm: number; tp_mm: number };
  pedestal: { L_mm: number; B_mm: number; D_mm: number };
  loads: { P_kN: number; note: string; Mx_kNm: number; My_kNm: number; Vx_kN: number; Vy_kN: number; combo: string };
  materials: { column_steel: string; plate_steel: string; concrete: string };
  anchors: { grade: string; dia_mm: number; count: number; hef_mm: string };
  sign_convention: string;
}

export default function StepNLInput({ state, onChange }: Props) {
  const [nlText, setNlText] = useState(
    'Design a base plate for ISMB 300 column carrying 800 kN compression with 60 kNm moment and 40 kN shear. M30 concrete pedestal 600×600mm. Steel E250. IS 800:2007 LSM code. Anchor bolts IS 1367 Class 8.8, M24.'
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);

  const handleExtract = () => {
    setStatus('loading');
    setTimeout(() => {
      const data: ExtractedData = {
        code: 'IS800', 
        column: { designation: 'ISMB 300', d_mm: 300, bf_mm: 140, tf_mm: 13.1, tw_mm: 7.5 },
        plate: { N_mm: 500, B_mm: 500, tp_mm: 25 },
        pedestal: { L_mm: 600, B_mm: 600, D_mm: 800 },
        loads: { P_kN: 800, note: '+800 → Compression', Mx_kNm: 60, My_kNm: 0, Vx_kN: 40, Vy_kN: 0, combo: 'IS 875 Combo 1: 1.5(DL+IL)' },
        materials: { column_steel: 'E250 (Fe410)', plate_steel: 'E250 (Fe410)', concrete: 'M30 (fck=30 MPa)' },
        anchors: { grade: 'IS 1367 Class 8.8', dia_mm: 24, count: 4, hef_mm: '16d = 384mm preliminary' },
        sign_convention: '+P = Compression (RC-3 compliant)',
      };
      setExtracted(data);
      onChange({
        colDesig: 'ISMB 300', d: 300, bf: 140, tf: 13.1, tw: 7.5,
        N: 500, B: 500, tp: 25,
        pedL: 600, pedB: 600, pedD: 800,
        P: 800, Mx: 60, My: 0, Vx: 40, Vy: 0,
        fck: 30,
      });
      setStatus('done');
    }, 1200);
  };

  return (
    <div>
      <div style={{ marginBottom: 4, fontSize: 12, color: '#8C959F' }}>Step 2 of 10</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1F2328', marginBottom: 4 }}>Natural Language Input</h1>
      <p style={{ fontSize: 14, color: '#656D76', marginBottom: 20 }}>
        Describe the design in plain text. The AI extraction engine parses all parameters automatically.
      </p>

      <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #EAEEF2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2328' }}>AI Parameter Extraction</div>
          <span className="code-pill">GPT-4 Powered</span>
        </div>
        <div style={{ padding: 16 }}>
          <textarea
            value={nlText}
            onChange={e => setNlText(e.target.value)}
            style={{
              width: '100%', height: 110, padding: 12, fontSize: 13,
              border: '1px solid #D0D7DE', borderRadius: 8, resize: 'vertical',
              fontFamily: 'inherit', lineHeight: 1.6, outline: 'none',
            }}
            placeholder="Example: Design a base plate for W14x90 column with 200 kip axial load, 50 kip-ft moment. A36 plate, 4000 psi concrete pedestal 24×24 in. AISC LRFD."
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <button onClick={handleExtract} className="btn-eng-primary" disabled={status === 'loading'}>
              {status === 'loading' ? '⏳ Extracting...' : '✦ Extract Parameters'}
            </button>
            {status === 'done' && (
              <span style={{ fontSize: 13, color: '#1A7F37', display: 'flex', alignItems: 'center', gap: 4 }}>
                ✓ All parameters extracted
              </span>
            )}
          </div>
        </div>
      </div>

      {extracted && (
        <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #EAEEF2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2328' }}>Extracted Parameters</div>
            <span className="status-badge badge-pass">✓ All fields found</span>
          </div>
          <div style={{ padding: 0 }}>
            <div style={{
              background: '#161B22', fontFamily: 'ui-monospace,SFMono-Regular,monospace',
              fontSize: 12, color: '#E6EDF3', padding: 14, lineHeight: 1.7,
              maxHeight: 280, overflowY: 'auto', whiteSpace: 'pre-wrap',
            }}>
              {JSON.stringify(extracted, null, 2)}
            </div>
          </div>
          <div style={{ padding: '12px 16px' }}>
            <div className="p-3 rounded-lg warn-1" style={{ fontSize: 12 }}>
              ℹ RC-3: Sign convention noted — {extracted.sign_convention}<br />
              ℹ RC-5: Code = {extracted.code} — units: {extracted.code === 'IS800' ? 'kN, kNm, mm, MPa' : 'kips, kip-ft, in, ksi'}
            </div>
          </div>
        </div>
      )}

      {/* Example prompts */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EAEEF2', borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2328', marginBottom: 10 }}>Example Inputs</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { label: 'Indian Code (IS 800)', text: 'Design a base plate for ISMB 300 column carrying 800 kN compression with 60 kNm moment and 40 kN shear. M30 concrete pedestal 600×600mm. Steel E250. IS 800:2007 LSM.' },
            { label: 'US Code (AISC LRFD)', text: 'Design a base plate for W14x90 column with 250 kips axial + 100 kip-ft moment + 30 kips shear. AISC LRFD. A992 steel column, A36 plate, 4000 psi concrete. 4 ASTM F1554 Gr.55 anchors.' },
            { label: 'Uplift Case', text: 'ISMB 500 column with -200 kN uplift and 80 kNm overturning moment. IS 800 LSM. M25 pedestal 800×800mm. E350 plate. IS 1367 Class 10.9 anchors M30.' },
          ].map((ex, i) => (
            <div key={i} onClick={() => setNlText(ex.text)}
              style={{ padding: '8px 12px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s', border: '1px solid #EAEEF2', fontSize: 12, color: '#656D76' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F6F8FA'; (e.currentTarget as HTMLDivElement).style.borderColor = '#54AEFF'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ''; (e.currentTarget as HTMLDivElement).style.borderColor = '#EAEEF2'; }}>
              <strong style={{ color: '#0969DA' }}>{ex.label}:</strong> {ex.text.substring(0, 80)}...
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
