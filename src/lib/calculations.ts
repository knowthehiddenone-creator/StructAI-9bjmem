import type {
  DesignState, DesignResults, CheckResult, EccentricityResult,
  PlateThicknessResult, DesignWarning, CheckStatus
} from '@/types';
import { getAnchorGrades } from './materialData';

// ============================================================
// HELPER UTILITIES
// ============================================================
export function getStatusColor(status: CheckStatus): string {
  switch (status) {
    case 'PASS':     return '#1A7F37';
    case 'CAUTION':  return '#9A6700';
    case 'WARNING':  return '#CF222E';
    case 'CRITICAL': return '#CF222E';
    case 'REDESIGN': return '#CF222E';
    default:         return '#656D76';
  }
}

export function getUtilColor(util: number): string {
  if (util <= 0.7)  return '#4AC26B';
  if (util <= 0.9)  return '#D4A72C';
  return '#CF222E';
}

export function getUtilStatus(util: number): CheckStatus {
  if (util <= 1.0) return 'PASS';
  return 'REDESIGN';
}

function emptyCheckResult(): CheckResult {
  return {
    status: 'PASS', utilization: 0, pass: true,
    warnings: [], intermediate: {}, formula: '', clause: '',
  };
}

// ============================================================
// MODULE 01 — ECCENTRICITY & LOAD CLASSIFICATION
// Source: AISC DG1 Eq.3.1 / IS 800:2007 Cl.7.4.1
// ============================================================
export function calcEccentricity(s: DesignState): EccentricityResult {
  const P_N  = s.P  * 1000;     // kN → N
  const Mx_N = s.Mx * 1_000_000; // kNm → N·mm

  const A1    = s.N * s.B;
  const Z_mm3 = (s.B * s.N * s.N) / 6.0;

  let ex = 0, ey = 0;
  if (Math.abs(P_N) > 1e-3) {
    ex = Math.abs(Mx_N / P_N);
    ey = 0;
  }

  const kern_x = s.N / 6.0;
  const kern_y = s.B / 6.0;
  const full_compression = ex <= kern_x && ey <= kern_y;

  let condition: 'COMPRESSION' | 'UPLIFT' | 'SHEAR_DOMINANT' = 'COMPRESSION';
  if (P_N < 0) condition = 'UPLIFT';
  else if (Math.abs(P_N) < 1e-3) condition = 'SHEAR_DOMINANT';

  const fp_avg = A1 > 0 ? P_N / A1 : 0;
  const fp_max = fp_avg + (Z_mm3 > 0 ? Math.abs(Mx_N) / Z_mm3 : 0);
  const fp_min = fp_avg - (Z_mm3 > 0 ? Math.abs(Mx_N) / Z_mm3 : 0);

  return {
    ex: +ex.toFixed(2),
    ey: +ey.toFixed(2),
    kern_x: +kern_x.toFixed(2),
    kern_y: +kern_y.toFixed(2),
    full_compression,
    condition,
    anchor_tension_required: !full_compression || condition === 'UPLIFT',
    fp_max: +fp_max.toFixed(4),
    fp_min: +fp_min.toFixed(4),
    fp_avg: +fp_avg.toFixed(4),
  };
}

// ============================================================
// MODULE 02 — GEOMETRY CHECK
// Source: AISC DG1 Eq.2.1 / IS 800:2007 Cl.7.4.1
// ============================================================
export function checkGeometry(s: DesignState): CheckResult {
  const proj  = 50; // mm each side
  const N_min = s.d + 2 * proj;
  const B_min = s.bf + 2 * proj;
  const A1    = s.N * s.B;
  const A2    = s.supportType === 'PEDESTAL' ? s.pedL * s.pedB : A1;
  const CF_raw = A1 > 0 ? Math.sqrt(A2 / A1) : 1;
  const CF     = Math.min(CF_raw, 2.0);

  const warnings: DesignWarning[] = [];
  if (s.N < N_min) {
    warnings.push({
      level: 3, title: 'Plate length too small',
      message: `N=${s.N}mm < N_min=${N_min}mm. Plate NOT auto-adjusted (RC-2).`,
      clause: 'AISC DG1 Eq.2.1 / IS 800 Cl.7.4.1',
      fix: [`Increase plate N to at least ${Math.ceil(N_min / 5) * 5}mm`],
    });
  }
  if (s.B < B_min) {
    warnings.push({
      level: 3, title: 'Plate width too small',
      message: `B=${s.B}mm < B_min=${B_min}mm. Plate NOT auto-adjusted (RC-2).`,
      clause: 'AISC DG1 Eq.2.1 / IS 800 Cl.7.4.1',
      fix: [`Increase plate B to at least ${Math.ceil(B_min / 5) * 5}mm`],
    });
  }
  if (s.supportType === 'PEDESTAL' && (s.pedL < s.N || s.pedB < s.B)) {
    warnings.push({
      level: 4, title: 'Pedestal smaller than plate',
      message: `Pedestal ${s.pedL}×${s.pedB}mm < plate ${s.N}×${s.B}mm. Edge distance critically low.`,
      clause: 'ACI 318-19 Cl.17.5.2 / IS 5624',
      fix: ['Increase pedestal plan size to exceed plate by ≥100mm each side'],
    });
  }

  const ok = s.N >= N_min && s.B >= B_min;
  return {
    status: ok ? 'PASS' : 'WARNING',
    utilization: Math.max(N_min / s.N, B_min / s.B),
    pass: ok,
    warnings,
    intermediate: { N_min, B_min, A1, A2, CF_raw: +CF_raw.toFixed(4), CF: +CF.toFixed(4) },
    formula: 'N_min=d+2×50  B_min=bf+2×50  A1=N×B  CF=min(√(A2/A1),2.0)',
    clause: 'AISC DG1 Eq.2.1 / IS 800:2007 Cl.7.4.1 / IS 456:2000 Cl.34.4',
  };
}

// ============================================================
// MODULE 03 — CONCRETE BEARING
// IS 800 path: fp_allow = 0.45 × fck × CF  [IS 456 Cl.34.4]
// AISC path:   φPp = φc × 0.85 × f'c × A1 × CF  [AISC 360-22 J8.1]
// ============================================================
export function checkBearing(s: DesignState, eco: EccentricityResult): CheckResult {
  const isIS   = s.code === 'IS800';
  const A1     = s.N * s.B;
  const A2     = s.supportType === 'PEDESTAL' ? s.pedL * s.pedB : A1;
  const CF_raw = A1 > 0 ? Math.sqrt(A2 / A1) : 1;
  const CF     = Math.min(CF_raw, 2.0) * (s.supportType === 'SLAB' ? 0.5 : 1.0); // CF=1.0 slab conservative
  const fp_use = eco.fp_max > 0 ? eco.fp_max : eco.fp_avg;

  let fp_allow = 0, util = 0;
  let formula = '', clause = '';

  if (isIS) {
    fp_allow = 0.45 * s.fck * (s.supportType === 'SLAB' ? 1.0 : CF);
    util     = fp_use / fp_allow;
    formula  = 'fp_allow = 0.45 × fck × CF';
    clause   = 'IS 456:2000 Cl.34.4 / IS 800:2007 Cl.7.4.1';
  } else {
    const phi_c  = 0.65;
    const Pp_N   = phi_c * 0.85 * s.fck * A1 * CF;
    fp_allow     = Pp_N / A1;
    util         = fp_use / fp_allow;
    formula      = 'φPp = φc × 0.85 × f\'c × A1 × CF';
    clause       = 'AISC 360-22 Section J8.1 / ACI 318-19';
  }

  const warnings: DesignWarning[] = [];
  if (util > 1.0) {
    warnings.push({
      level: 5, title: 'Bearing FAILS',
      message: `fp_actual=${fp_use.toFixed(3)} MPa > fp_allow=${fp_allow.toFixed(3)} MPa. Utilisation=${util.toFixed(3)}.`,
      clause,
      fix: [
        `Increase plate area (N×B) — currently ${s.N}×${s.B}mm`,
        `Use higher concrete grade — currently ${s.concreteGrade}`,
        s.supportType === 'PEDESTAL' ? 'Increase pedestal plan size' : 'Switch to pedestal footing',
      ],
    });
  } else if (util > 0.9) {
    warnings.push({
      level: 2, title: 'Bearing near limit',
      message: `Utilisation ${(util * 100).toFixed(1)}% > 90%. Consider increasing plate size.`,
      clause,
    });
  }

  return {
    status: util > 1.0 ? 'REDESIGN' : util > 0.9 ? 'CAUTION' : 'PASS',
    utilization: +util.toFixed(4),
    pass: util <= 1.0,
    warnings,
    intermediate: {
      A1: +A1.toFixed(0), A2: +A2.toFixed(0),
      CF_raw: +CF_raw.toFixed(4), CF: +CF.toFixed(4),
      fp_allow: +fp_allow.toFixed(4), fp_actual: +fp_use.toFixed(4),
      fck: s.fck,
    },
    formula, clause,
  };
}

// ============================================================
// MODULE 04 — PLATE THICKNESS
// AISC path: tp_req = l × √(2fp / φFy)  [AISC DG1 Eq.2.6]
// IS 800 path: tp_req = √(6 × Md × γm0 / Fy)  [IS 800 Cl.7.4.3]
// ============================================================
export function checkPlateThickness(s: DesignState, eco: EccentricityResult): PlateThicknessResult {
  const isIS    = s.code === 'IS800';
  const A1      = s.N * s.B;
  const P_N     = s.P * 1000;
  const fp_use  = Math.max(eco.fp_max, eco.fp_avg, 0);
  const fp_N    = Math.max(P_N / A1, 0.001);

  const m       = (s.N - 0.95 * s.d) / 2;
  const n       = (s.B - 0.80 * s.bf) / 2;
  const n_prime = Math.sqrt(s.d * s.bf) / 4;
  const l_crit  = Math.max(m, n, n_prime, 1.0);

  let tp_required = 0, formula = '', clause = '';

  if (isIS) {
    // IS 800:2007 Cl.7.4.3 — cantilever plate method
    const gamma_m0 = 1.10;
    const Md       = fp_use * (l_crit ** 2) / 2.0; // N·mm/mm
    tp_required    = Math.sqrt(6 * Md * gamma_m0 / s.plateFy);
    formula        = 'tp = √(6 × Md × γm0 / Fy)   Md = fp × l²/2';
    clause         = 'IS 800:2007 Cl.7.4.3';
  } else {
    // AISC DG1 Eq.2.6
    const phi_b    = 0.90;
    const fp_plate = Math.max(fp_N, 0.001);
    const denom    = phi_b * s.plateFy;
    tp_required    = denom > 0 ? l_crit * Math.sqrt(2 * fp_plate / denom) : 0;
    formula        = 'tp = l × √(2fp / φFy)   where l = max(m, n, λn\')';
    clause         = 'AISC Design Guide 1 Eq.2.3 and Eq.2.6 / AISC 360-22 J8.2';
  }

  const util            = tp_required / s.tp;
  const stiffener_rec   = tp_required > 40;
  const prying_risk     = s.anchorDia > s.tp;

  const warnings: DesignWarning[] = [];
  if (util > 1.0) {
    warnings.push({
      level: 5, title: 'Plate thickness FAILS — REDESIGN REQUIRED',
      message: `tp_provided=${s.tp}mm < tp_required=${tp_required.toFixed(1)}mm. Utilisation=${util.toFixed(3)}.`,
      clause,
      fix: [
        `Increase plate thickness to minimum ${Math.ceil(tp_required / 2) * 2}mm`,
        `Add stiffener plates (reduces effective l_crit)`,
        `Increase plate plan size to reduce bearing pressure`,
      ],
    });
  }
  if (stiffener_rec && util <= 1.0) {
    warnings.push({
      level: 2, title: 'Stiffener plates recommended',
      message: `tp_required=${tp_required.toFixed(1)}mm > 40mm. Add stiffener plates to reduce demand.`,
      clause: 'AISC DG1 Section 2.2 / IS 800 Cl.7.4.3',
    });
  }
  if (prying_risk) {
    warnings.push({
      level: 3, title: 'Anchor diameter > plate thickness — prying risk',
      message: `Anchor Ø${s.anchorDia}mm > tp ${s.tp}mm. Prying action and local bending concern. NOT a code failure.`,
      clause: 'AISC DG1 Commentary / Engineering Judgment',
      fix: [
        'Increase plate thickness tp',
        'Add washer plate (min 2×bolt dia, washer tp ≥ bolt dia)',
        'Add stiffener plates around anchor holes',
      ],
    });
  }

  return {
    status: util > 1.0 ? 'REDESIGN' : stiffener_rec ? 'CAUTION' : 'PASS',
    utilization: +util.toFixed(4),
    pass: util <= 1.0,
    warnings,
    intermediate: {
      m: +m.toFixed(2), n: +n.toFixed(2), n_prime: +n_prime.toFixed(2),
      l_crit: +l_crit.toFixed(2), fp_use: +fp_use.toFixed(4),
      tp_required: +tp_required.toFixed(2),
    },
    formula, clause,
    m: +m.toFixed(2),
    n: +n.toFixed(2),
    n_prime: +n_prime.toFixed(2),
    l_crit: +l_crit.toFixed(2),
    tp_required: +tp_required.toFixed(2),
    tp_provided: s.tp,
    stiffener_recommended: stiffener_rec,
  };
}

// ============================================================
// MODULE 05 — ANCHOR TENSION DEMAND
// Source: AISC DG1 Section 3.2 / IS 800:2007 Cl.7.4.3
// ============================================================
export function calcAnchorTension(s: DesignState): { T_total: number; T_per: number; n_tension: number } {
  const P_N   = s.P * 1000;
  const Mx_N  = s.Mx * 1_000_000;
  const lever = 0.9 * s.N;
  const uplift = P_N < 0;

  let T_total = 0;
  if (uplift) {
    T_total = Math.abs(P_N) + (lever > 0 ? Math.abs(Mx_N) / lever : 0);
  } else {
    T_total = Math.max(0, (lever > 0 ? Math.abs(Mx_N) / lever : 0) - Math.abs(P_N) / 2);
  }

  const n_tension = Math.max(2, Math.floor(s.anchorCount / 2));
  const T_per     = n_tension > 0 ? T_total / n_tension : 0;
  return { T_total: +T_total.toFixed(1), T_per: +T_per.toFixed(1), n_tension };
}

// ============================================================
// MODULE 06 — ANCHOR STEEL CAPACITY
// AISC: ACI 318-19 Chapter 17
// IS:   IS 800:2007 Cl.10.3.5, 10.3.6
// ============================================================
export function checkAnchorSteel(s: DesignState): { tension: CheckResult; shear: CheckResult; interaction: CheckResult } {
  const isIS  = s.code === 'IS800';
  const db    = getAnchorGrades(s.code);
  const ap    = db[s.anchorGrade] || { fy: 640, fu: 800, sizes: [], label: '' };
  const dia   = s.anchorDia;

  const { T_per } = calcAnchorTension(s);
  const V_per  = (s.Vx * 1000) / s.anchorCount;

  let phi_Nsa = 0, phi_Vsa = 0, t_ratio = 0, v_ratio = 0, interaction_val = 0;
  let t_formula = '', t_clause = '', v_formula = '', v_clause = '', i_clause = '';

  if (isIS) {
    // IS 800:2007 Cl.10.3.5, 10.3.6
    const gamma_m1 = 1.25;
    const Anc      = Math.PI * dia * dia / 4;
    phi_Nsa = 0.9 * ap.fu * Anc / gamma_m1;
    phi_Vsa = ap.fu * Anc / (Math.sqrt(3) * gamma_m1);
    t_ratio = T_per / phi_Nsa;
    v_ratio = V_per / phi_Vsa;
    interaction_val = t_ratio ** 2 + v_ratio ** 2;
    t_formula = 'Tnd = 0.9 × fu × Anc / γm1';
    t_clause  = 'IS 800:2007 Cl.10.3.5';
    v_formula = 'Vnd = fu × Anc / (√3 × γm1)';
    v_clause  = 'IS 800:2007 Cl.10.3.5';
    i_clause  = 'IS 800:2007 Cl.10.3.6: (T/Tnd)² + (V/Vnd)² ≤ 1.0';
  } else {
    // ACI 318-19 Ch.17
    const Ase  = Math.PI * (0.9 * dia) ** 2 / 4;
    phi_Nsa = 0.75 * Ase * ap.fu;
    phi_Vsa = 0.65 * 0.6 * Ase * ap.fu;
    t_ratio = T_per / phi_Nsa;
    v_ratio = V_per / phi_Vsa;
    interaction_val = (Math.max(t_ratio, 0) ** (5 / 3)) + (Math.max(v_ratio, 0) ** (5 / 3));
    t_formula = 'φNsa = 0.75 × Ase × fu';
    t_clause  = 'ACI 318-19 Section 17.5.1';
    v_formula = 'φVsa = 0.65 × 0.6 × Ase × fu';
    v_clause  = 'ACI 318-19 Section 17.7.1';
    i_clause  = 'ACI 318-19 17.8.3: (T/φNsa)^5/3 + (V/φVsa)^5/3 ≤ 1.0';
  }

  const tensionWarn: DesignWarning[] = [];
  if (t_ratio > 1.0) {
    tensionWarn.push({
      level: 5, title: 'Anchor tension FAILS',
      message: `T_per=${(T_per / 1000).toFixed(2)}kN > φNsa=${(phi_Nsa / 1000).toFixed(2)}kN. Ratio=${t_ratio.toFixed(3)}`,
      clause: t_clause,
      fix: [`Increase anchor count (currently ${s.anchorCount})`, `Increase anchor diameter (currently Ø${dia}mm)`],
    });
  }

  const shearWarn: DesignWarning[] = [];
  if (v_ratio > 1.0) {
    shearWarn.push({
      level: 5, title: 'Anchor shear FAILS',
      message: `V_per=${(V_per / 1000).toFixed(2)}kN > φVsa=${(phi_Vsa / 1000).toFixed(2)}kN. Ratio=${v_ratio.toFixed(3)}`,
      clause: v_clause,
      fix: ['Increase anchor count', 'Add shear key / shear lug'],
    });
  }

  const interWarn: DesignWarning[] = [];
  if (interaction_val > 1.0) {
    interWarn.push({
      level: 5, title: 'Tension-shear interaction FAILS',
      message: `Interaction=${interaction_val.toFixed(3)} > 1.0.`,
      clause: i_clause,
      fix: ['Increase anchor size or count', 'Add shear key to reduce shear on anchors'],
    });
  }

  return {
    tension: {
      status: t_ratio > 1 ? 'REDESIGN' : 'PASS', utilization: +t_ratio.toFixed(4), pass: t_ratio <= 1.0,
      warnings: tensionWarn,
      intermediate: { T_per_N: T_per, phi_Nsa_N: +phi_Nsa.toFixed(1), t_ratio: +t_ratio.toFixed(4), dia, n_anchors: s.anchorCount },
      formula: t_formula, clause: t_clause,
    },
    shear: {
      status: v_ratio > 1 ? 'REDESIGN' : 'PASS', utilization: +v_ratio.toFixed(4), pass: v_ratio <= 1.0,
      warnings: shearWarn,
      intermediate: { V_per_N: +V_per.toFixed(1), phi_Vsa_N: +phi_Vsa.toFixed(1), v_ratio: +v_ratio.toFixed(4) },
      formula: v_formula, clause: v_clause,
    },
    interaction: {
      status: interaction_val > 1 ? 'REDESIGN' : 'PASS', utilization: +interaction_val.toFixed(4), pass: interaction_val <= 1.0,
      warnings: interWarn,
      intermediate: { interaction: +interaction_val.toFixed(4), t_ratio: +t_ratio.toFixed(4), v_ratio: +v_ratio.toFixed(4) },
      formula: isIS ? '(T/Tnd)² + (V/Vnd)² ≤ 1.0' : '(T/φNsa)^5/3 + (V/φVsa)^5/3 ≤ 1.0',
      clause: i_clause,
    },
  };
}

// ============================================================
// MODULE 07 — EMBEDMENT CHECK
// Source: ACI 318-19 Sec 17.5.2 / IS 5624:1993
// ============================================================
export function checkEmbedment(s: DesignState): CheckResult {
  const { T_per } = calcAnchorTension(s);
  const uplift    = s.P < 0;
  const hef_req   = uplift ? s.anchorDia * 16 : s.anchorDia * 12;

  // Basic ACI breakout
  const kc    = 24.0;
  const lam   = s.concreteLightweight ? 0.75 : 1.0;
  const Nb_N  = kc * lam * Math.sqrt(s.fck) * Math.pow(s.hef, 1.5);

  // Edge modification ψ_ed
  const ca_min = s.edgeDist;
  const psi_ed = ca_min >= 1.5 * s.hef ? 1.0 : 0.7 + 0.3 * ca_min / (1.5 * s.hef);
  const psi_c  = s.crackedConcrete ? 1.0 : 1.25;
  const phi_Ncb = 0.70 * psi_ed * psi_c * Nb_N;

  const util_emb = hef_req / s.hef;
  const warnings: DesignWarning[] = [];

  if (s.hef < hef_req) {
    warnings.push({
      level: 4, title: 'Embedment depth insufficient',
      message: `hef_provided=${s.hef}mm < hef_required=${hef_req}mm (${uplift ? '16d uplift' : '12d compression'}).`,
      clause: 'ACI 318-19 17.5.2 / IS 5624:1993',
      fix: [`Increase embedment to minimum ${hef_req}mm`],
    });
  }

  if (s.supportType === 'SLAB') {
    const hef_max_slab = s.slabTs - 75;
    if (s.hef > hef_max_slab) {
      warnings.push({
        level: 4, title: 'Embedment exceeds slab depth',
        message: `hef=${s.hef}mm > slab_ts − 75mm = ${hef_max_slab}mm.`,
        clause: 'ACI 318-19 Section 26.2',
        fix: ['Increase slab thickness', 'Switch to pedestal footing'],
      });
    }
  }

  return {
    status: s.hef >= hef_req ? 'PASS' : 'WARNING',
    utilization: +util_emb.toFixed(4),
    pass: s.hef >= hef_req,
    warnings,
    intermediate: {
      hef_required: hef_req, hef_provided: s.hef,
      Nb_N: +Nb_N.toFixed(0), psi_ed: +psi_ed.toFixed(4), psi_c,
      phi_Ncb_N: +phi_Ncb.toFixed(0), T_per_kN: +(T_per / 1000).toFixed(2),
    },
    formula: 'Nb = kc × λ × √f\'c × hef^1.5   φNcb = φ × ψ_ed × ψ_c × Nb',
    clause: 'ACI 318-19 Section 17.5.2 / IS 5624:1993',
  };
}

// ============================================================
// MASTER CALCULATION RUNNER
// ============================================================
export function runAllCalculations(s: DesignState): DesignResults {
  const eco      = calcEccentricity(s);
  const geom     = checkGeometry(s);
  const bearing  = checkBearing(s, eco);
  const plateTp  = checkPlateThickness(s, eco);
  const anchors  = checkAnchorSteel(s);
  const embed    = checkEmbedment(s);

  const allUtils = [bearing.utilization, plateTp.utilization, anchors.tension.utilization, anchors.shear.utilization, anchors.interaction.utilization];
  const maxUtil  = Math.max(...allUtils);

  let overall: CheckStatus = 'PASS';
  if (maxUtil > 1.0) overall = 'REDESIGN';
  else if (maxUtil > 0.9) overall = 'CAUTION';

  return {
    geometry:          geom,
    eccentricity:      eco,
    bearing,
    plate_thickness:   plateTp,
    anchor_tension:    anchors.tension,
    anchor_shear:      anchors.shear,
    anchor_interaction: anchors.interaction,
    embedment:         embed,
    overall,
    overallUtil:       +maxUtil.toFixed(4),
  };
}

// ============================================================
// REPORT TEXT GENERATOR
// ============================================================
export function generateReportText(s: DesignState, r: DesignResults): string {
  const isIS = s.code === 'IS800';
  const unitF = isIS ? 'kN' : 'kips';
  const unitM = isIS ? 'kNm' : 'kip-ft';

  return `================================================================
STRUCTAI BASEPLATE — DESIGN CALCULATION REPORT
================================================================
Product    : StructAI BasePlate v4.0
Code       : ${s.code}
Method     : ${isIS ? 'Limit State Method (LSM)' : s.code === 'AISC_LRFD' ? 'LRFD' : 'ASD'}
Support    : ${s.supportType}
Date       : ${new Date().toLocaleDateString()}
================================================================

SECTION 01 — PROJECT DETAILS
Project    : ${s.projectName}
Designer   : ${s.designer}
Revision   : ${s.revision}
Code Refs  : ${isIS ? 'IS 800:2007 + IS 456:2000 + IS 1367 + IS 5624' : 'AISC 360-22 + ACI 318-19 + ASCE 7-22'}

NOTE: +P = Compression | −P = Uplift (RC-3 Sign Convention)
NOTE: Plate dimensions NOT auto-adjusted (RC-2 Compliance)
================================================================

SECTION 02 — DESIGN BASIS
Code       : ${s.code}
Load Combo : ${s.loadCombo}
Support    : ${s.supportType} — ${s.supportType === 'PEDESTAL' ? 'Full ACI 318-19 Ch.17' : 'Reduced ACI 318-19 Sec.26.2'}
Condition  : ${r.eccentricity.condition} (P = ${s.P} ${unitF})

================================================================

SECTION 03 — INPUT SUMMARY
Column     : ${s.colDesig} (d=${s.d}mm, bf=${s.bf}mm, tf=${s.tf}mm, tw=${s.tw}mm)
Plate      : ${s.N} × ${s.B} × ${s.tp} mm (${s.plateGrade}, Fy=${s.plateFy} MPa)
Support    : ${s.supportType === 'PEDESTAL' ? `${s.pedL}×${s.pedB}×${s.pedD}mm pedestal` : `${s.slabTs}mm slab on grade`}
Concrete   : ${s.concreteGrade} (fck = ${s.fck} MPa)
Loads      : P = ${s.P} ${unitF}  Mx = ${s.Mx} ${unitM}  Vx = ${s.Vx} ${unitF}
Anchors    : ${s.anchorCount} × Ø${s.anchorDia}mm (${s.anchorGrade}), hef=${s.hef}mm

================================================================

SECTION 05 — PLATE GEOMETRY CHECK
Formula    : N_min = d + 2×50mm  |  B_min = bf + 2×50mm
N_min      = ${s.d} + 100 = ${s.d + 100} mm
B_min      = ${s.bf} + 100 = ${s.bf + 100} mm
N_prov     = ${s.N} mm  →  ${s.N >= s.d + 100 ? 'PASS ✓' : 'FAIL ✗'}
B_prov     = ${s.B} mm  →  ${s.B >= s.bf + 100 ? 'PASS ✓' : 'FAIL ✗'}
Status     : ${r.geometry.status}
Clause     : ${r.geometry.clause}

================================================================

SECTION 06 — BEARING PRESSURE
A1         = ${s.N} × ${s.B} = ${s.N * s.B} mm²
A2         = ${s.pedL} × ${s.pedB} = ${s.pedL * s.pedB} mm²
CF         = min(√(${s.pedL * s.pedB}/${s.N * s.B}), 2.0) = ${r.bearing.intermediate.CF}
fp_allow   = ${isIS ? `0.45 × ${s.fck} × ${r.bearing.intermediate.CF}` : `0.65 × 0.85 × ${s.fck} × A1 × CF / A1`} = ${r.bearing.intermediate.fp_allow} MPa
fp_actual  = ${r.bearing.intermediate.fp_actual} MPa
Util       = ${(r.bearing.utilization * 100).toFixed(1)}%
Status     : ${r.bearing.status}
Clause     : ${r.bearing.clause}

================================================================

SECTION 07 — PLATE THICKNESS
m          = (${s.N} - 0.95×${s.d}) / 2 = ${r.plate_thickness.m} mm
n          = (${s.B} - 0.80×${s.bf}) / 2 = ${r.plate_thickness.n} mm
n'         = √(${s.d}×${s.bf}) / 4 = ${r.plate_thickness.n_prime} mm
l_crit     = max(m,n,n') = ${r.plate_thickness.l_crit} mm  ← GOVERNS
tp_required= ${r.plate_thickness.tp_required} mm
tp_provided= ${s.tp} mm
Util       = ${(r.plate_thickness.utilization * 100).toFixed(1)}%
Status     : ${r.plate_thickness.status}
Clause     : ${r.plate_thickness.clause}

================================================================

SECTION 08 — ANCHOR STEEL CAPACITY (${s.anchorGrade})
T_per      = ${(r.anchor_tension.intermediate.T_per_N as number / 1000).toFixed(2)} kN
φNsa       = ${(r.anchor_tension.intermediate.phi_Nsa_N as number / 1000).toFixed(2)} kN
T_ratio    = ${r.anchor_tension.utilization.toFixed(3)}  →  ${r.anchor_tension.status}
V_per      = ${(r.anchor_shear.intermediate.V_per_N as number / 1000).toFixed(2)} kN
φVsa       = ${(r.anchor_shear.intermediate.phi_Vsa_N as number / 1000).toFixed(2)} kN
V_ratio    = ${r.anchor_shear.utilization.toFixed(3)}  →  ${r.anchor_shear.status}
Interaction= ${r.anchor_interaction.utilization.toFixed(3)}  →  ${r.anchor_interaction.status}
Clause     : ${r.anchor_tension.clause}

================================================================

SECTION 09 — EMBEDMENT CHECK
hef_required (${s.P < 0 ? '16d uplift' : '12d compression'}) = ${r.embedment.intermediate.hef_required} mm
hef_provided = ${s.hef} mm
Status       : ${r.embedment.status}
Nb_basic     = ${r.embedment.intermediate.Nb_N} N (ACI 318-19 17.5.2.2)
φNcb         = ${r.embedment.intermediate.phi_Ncb_N} N
Clause       : ${r.embedment.clause}

================================================================

SECTION 21 — ENGINEERING NOTES (RC Compliance)
RC-2: Plate dimensions confirmed as entered — NOT auto-adjusted
RC-3: P=${s.P}kN → ${r.eccentricity.condition}
RC-10: ${s.supportType} mode applied — ${s.supportType === 'PEDESTAL' ? 'Full Ch.17' : 'Reduced Sec.26.2'}
Load combo: ${s.loadCombo} | Code: ${s.code}

================================================================
OVERALL STATUS: ${r.overall}
Bearing:${(r.bearing.utilization * 100).toFixed(0)}%  PlateTp:${(r.plate_thickness.utilization * 100).toFixed(0)}%  AnchorT:${(r.anchor_tension.utilization * 100).toFixed(0)}%  AnchorV:${(r.anchor_shear.utilization * 100).toFixed(0)}%  Interaction:${(r.anchor_interaction.utilization * 100).toFixed(0)}%
================================================================
END OF REPORT — StructAI BasePlate v4.0
================================================================`;
}
