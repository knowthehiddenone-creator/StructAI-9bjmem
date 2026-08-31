import type { SteelGrade, ConcreteGrade, AnchorGrade, LoadCombo } from '@/types';

// ============================================================
// STEEL GRADES
// ============================================================
export const STEEL_GRADES_IS: Record<string, SteelGrade> = {
  'E250 (Fe410)': { fy: 250, fu: 410, label: 'E250 (Fe410) — IS 2062' },
  'E300 (Fe440)': { fy: 300, fu: 440, label: 'E300 (Fe440) — IS 2062' },
  'E350 (Fe490)': { fy: 350, fu: 490, label: 'E350 (Fe490) — IS 2062' },
  'E410 (Fe540)': { fy: 410, fu: 540, label: 'E410 (Fe540) — IS 2062' },
  'E450 (Fe570)': { fy: 450, fu: 570, label: 'E450 (Fe570) — IS 2062' },
  'E550 (Fe670)': { fy: 550, fu: 670, label: 'E550 (Fe670) — IS 2062' },
};

export const STEEL_GRADES_AISC: Record<string, SteelGrade> = {
  'A36':         { fy: 248.2, fu: 400.0,  label: 'A36 — ASTM (Plate default)' },
  'A572-Gr50':   { fy: 344.7, fu: 448.2,  label: 'A572 Gr.50 — ASTM' },
  'A992':        { fy: 344.7, fu: 448.2,  label: 'A992 — ASTM (W-shapes default)' },
  'A500-GrB':    { fy: 317.2, fu: 400.0,  label: 'A500 GrB — ASTM (HSS)' },
  'A500-GrC':    { fy: 344.7, fu: 427.5,  label: 'A500 GrC — ASTM (HSS)' },
  'A53-GrB':     { fy: 241.3, fu: 413.7,  label: 'A53 GrB — ASTM (Pipe)' },
};

// ============================================================
// CONCRETE GRADES
// ============================================================
export const CONCRETE_IS: Record<string, ConcreteGrade> = {
  'M20': { fck: 20,   label: 'M20 (fck = 20 MPa)' },
  'M25': { fck: 25,   label: 'M25 (fck = 25 MPa)' },
  'M30': { fck: 30,   label: 'M30 (fck = 30 MPa)' },
  'M35': { fck: 35,   label: 'M35 (fck = 35 MPa)' },
  'M40': { fck: 40,   label: 'M40 (fck = 40 MPa)' },
  'M45': { fck: 45,   label: 'M45 (fck = 45 MPa)' },
  'M50': { fck: 50,   label: 'M50 (fck = 50 MPa)' },
};

export const CONCRETE_ACI: Record<string, ConcreteGrade> = {
  '3000 psi (20.7 MPa)': { fck: 20.7, label: "3000 psi (f'c = 20.7 MPa)" },
  '4000 psi (27.6 MPa)': { fck: 27.6, label: "4000 psi (f'c = 27.6 MPa)" },
  '5000 psi (34.5 MPa)': { fck: 34.5, label: "5000 psi (f'c = 34.5 MPa)" },
  '6000 psi (41.4 MPa)': { fck: 41.4, label: "6000 psi (f'c = 41.4 MPa)" },
  '8000 psi (55.2 MPa)': { fck: 55.2, label: "8000 psi (f'c = 55.2 MPa)" },
};

// ============================================================
// ANCHOR GRADES
// ============================================================
export const ANCHOR_GRADES_IS: Record<string, AnchorGrade> = {
  'IS 1367 Class 4.6': { fy: 240, fu: 400,  sizes: [12, 16, 20, 24, 30, 36],              label: 'IS 1367 Class 4.6' },
  'IS 1367 Class 5.6': { fy: 300, fu: 500,  sizes: [16, 20, 24, 30, 36],                  label: 'IS 1367 Class 5.6' },
  'IS 1367 Class 8.8': { fy: 640, fu: 800,  sizes: [16, 20, 24, 30, 36, 42, 48],          label: 'IS 1367 Class 8.8' },
  'IS 1367 Class 10.9': { fy: 900, fu: 1000, sizes: [16, 20, 24, 30, 36],                 label: 'IS 1367 Class 10.9' },
  'SS304 IS 3757':       { fy: 210, fu: 500,  sizes: [12, 16, 20, 24, 30, 36],             label: 'SS304 IS 3757 (Stainless)' },
  'SS316 IS 3757':       { fy: 210, fu: 500,  sizes: [12, 16, 20, 24, 30, 36],             label: 'SS316 IS 3757 (Stainless)' },
};

export const ANCHOR_GRADES_AISC: Record<string, AnchorGrade> = {
  'ASTM F1554 Gr.36':  { fy: 248.2, fu: 400.0,  sizes: ['1/2', '5/8', '3/4', '7/8', '1', '1-1/4', '1-1/2', '1-3/4', '2'],  label: 'ASTM F1554 Gr.36' },
  'ASTM F1554 Gr.55':  { fy: 379.2, fu: 517.1,  sizes: ['1/2', '5/8', '3/4', '7/8', '1', '1-1/4', '1-1/2', '1-3/4', '2'],  label: 'ASTM F1554 Gr.55' },
  'ASTM F1554 Gr.105': { fy: 723.9, fu: 861.9,  sizes: ['3/4', '7/8', '1', '1-1/4', '1-1/2'],                               label: 'ASTM F1554 Gr.105' },
  'ASTM A307':         { fy: 248.2, fu: 413.7,  sizes: ['1/4', '3/8', '1/2', '5/8', '3/4', '7/8', '1'],                    label: 'ASTM A307' },
  'ASTM A325':         { fy: 634.7, fu: 827.4,  sizes: ['1/2', '5/8', '3/4', '7/8', '1', '1-1/4', '1-1/2'],                label: 'ASTM A325' },
  'ASTM A490':         { fy: 896.4, fu: 1034.2, sizes: ['1/2', '5/8', '3/4', '7/8', '1', '1-1/4', '1-1/2'],                label: 'ASTM A490' },
  'SS304 ASTM F593':   { fy: 206.8, fu: 517.1,  sizes: ['1/4', '3/8', '1/2', '5/8', '3/4', '7/8', '1'],                   label: 'SS304 ASTM F593 (Stainless)' },
};

// ============================================================
// LOAD COMBINATIONS
// ============================================================
export const LOAD_COMBOS_IS800_FACTORED: LoadCombo[] = [
  { id: 'IS-C1', name: 'Combo 1', formula: '1.5(DL + IL)',          pf: 1.5, mf: 1.5, vf: 1.5 },
  { id: 'IS-C2', name: 'Combo 2', formula: '1.5(DL + WL)',          pf: 1.5, mf: 1.5, vf: 1.5 },
  { id: 'IS-C3', name: 'Combo 3', formula: '1.2(DL + IL + WL)',     pf: 1.2, mf: 1.2, vf: 1.2 },
  { id: 'IS-C4', name: 'Combo 4', formula: '1.2(DL + IL + EL)',     pf: 1.2, mf: 1.2, vf: 1.2 },
  { id: 'IS-C5', name: 'Combo 5 (Uplift)', formula: '0.9DL + 1.5WL', pf: 0.9, mf: 1.5, vf: 1.5, uplift: true },
  { id: 'IS-C6', name: 'Combo 6 (Seismic)', formula: '0.9DL + 1.5EL', pf: 0.9, mf: 1.5, vf: 1.5, uplift: true },
];

export const LOAD_COMBOS_AISC_LRFD: LoadCombo[] = [
  { id: 'LRFD-C1', name: 'Combo 1', formula: '1.4D',                        pf: 1.4, mf: 1.4, vf: 1.4 },
  { id: 'LRFD-C2', name: 'Combo 2', formula: '1.2D + 1.6L + 0.5Lr',        pf: 1.2, mf: 1.6, vf: 1.6 },
  { id: 'LRFD-C3', name: 'Combo 3', formula: '1.2D + 1.6Lr + L',           pf: 1.2, mf: 1.6, vf: 1.0 },
  { id: 'LRFD-C4', name: 'Combo 4', formula: '1.2D + 1.0W + L',            pf: 1.2, mf: 1.0, vf: 1.0 },
  { id: 'LRFD-C5', name: 'Combo 5 (Uplift)', formula: '0.9D + 1.0W',       pf: 0.9, mf: 1.0, vf: 1.0, uplift: true },
  { id: 'LRFD-C6', name: 'Combo 6 (Seismic)', formula: '1.2D + 1.0E + L',  pf: 1.2, mf: 1.0, vf: 1.0 },
  { id: 'LRFD-C7', name: 'Combo 7 (Seismic)', formula: '0.9D + 1.0E',      pf: 0.9, mf: 1.0, vf: 1.0, uplift: true },
];

export const LOAD_COMBOS_AISC_ASD: LoadCombo[] = [
  { id: 'ASD-C1', name: 'Combo 1', formula: 'D',                           pf: 1.0, mf: 1.0, vf: 1.0 },
  { id: 'ASD-C2', name: 'Combo 2', formula: 'D + L',                       pf: 1.0, mf: 1.0, vf: 1.0 },
  { id: 'ASD-C3', name: 'Combo 3', formula: 'D + Lr',                      pf: 1.0, mf: 1.0, vf: 1.0 },
  { id: 'ASD-C4', name: 'Combo 4', formula: 'D + 0.75L + 0.75Lr',         pf: 1.0, mf: 0.75, vf: 0.75 },
  { id: 'ASD-C5', name: 'Combo 5', formula: 'D + 0.6W (or 0.7E)',         pf: 1.0, mf: 0.6, vf: 0.6 },
  { id: 'ASD-C6', name: 'Combo 6 (Uplift)', formula: '0.6D + 0.6W',       pf: 0.6, mf: 0.6, vf: 0.6, uplift: true },
  { id: 'ASD-C7', name: 'Combo 7 (Uplift)', formula: '0.6D + 0.7E',       pf: 0.6, mf: 0.7, vf: 0.7, uplift: true },
];

export function getLoadCombos(code: string): LoadCombo[] {
  if (code === 'IS800') return LOAD_COMBOS_IS800_FACTORED;
  if (code === 'AISC_LRFD') return LOAD_COMBOS_AISC_LRFD;
  return LOAD_COMBOS_AISC_ASD;
}

export function getSteelGrades(code: string): Record<string, SteelGrade> {
  return code === 'IS800' ? STEEL_GRADES_IS : STEEL_GRADES_AISC;
}

export function getConcreteGrades(code: string): Record<string, ConcreteGrade> {
  return code === 'IS800' ? CONCRETE_IS : CONCRETE_ACI;
}

export function getAnchorGrades(code: string): Record<string, AnchorGrade> {
  return code === 'IS800' ? ANCHOR_GRADES_IS : ANCHOR_GRADES_AISC;
}

// Default grades per code
export const DEFAULT_COL_GRADE: Record<string, string> = {
  IS800: 'E250 (Fe410)',
  AISC_LRFD: 'A992',
  AISC_ASD: 'A992',
};
export const DEFAULT_PLATE_GRADE: Record<string, string> = {
  IS800: 'E250 (Fe410)',
  AISC_LRFD: 'A36',
  AISC_ASD: 'A36',
};
export const DEFAULT_CONCRETE_GRADE: Record<string, string> = {
  IS800: 'M30',
  AISC_LRFD: '4000 psi (27.6 MPa)',
  AISC_ASD: '4000 psi (27.6 MPa)',
};
export const DEFAULT_ANCHOR_GRADE: Record<string, string> = {
  IS800: 'IS 1367 Class 8.8',
  AISC_LRFD: 'ASTM F1554 Gr.55',
  AISC_ASD: 'ASTM F1554 Gr.55',
};

// Unit labels
export const UNIT_LABELS: Record<string, Record<string, string>> = {
  IS800: { force: 'kN', moment: 'kNm', length: 'mm', stress: 'MPa', area: 'mm²', longer: 'm' },
  AISC_LRFD: { force: 'kips', moment: 'kip-ft', length: 'in', stress: 'ksi', area: 'in²', longer: 'ft' },
  AISC_ASD:  { force: 'kips', moment: 'kip-ft', length: 'in', stress: 'ksi', area: 'in²', longer: 'ft' },
};
