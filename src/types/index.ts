export type DesignCode = 'IS800' | 'AISC_LRFD' | 'AISC_ASD';
export type UnitSystem = 'SI' | 'US';
export type SupportType = 'PEDESTAL' | 'SLAB';
export type LoadCondition = 'COMPRESSION' | 'UPLIFT' | 'SHEAR_DOMINANT';
export type WarningLevel = 1 | 2 | 3 | 4 | 5;
export type CheckStatus = 'PASS' | 'CAUTION' | 'WARNING' | 'CRITICAL' | 'REDESIGN';

export interface DesignWarning {
  level: WarningLevel;
  title: string;
  message: string;
  clause: string;
  fix?: string[];
}

export interface CheckResult {
  status: CheckStatus;
  utilization: number;
  pass: boolean;
  warnings: DesignWarning[];
  intermediate: Record<string, number | string | boolean>;
  formula: string;
  clause: string;
}

export interface SectionProps {
  d: number;   // depth mm
  bf: number;  // flange width mm
  tf: number;  // flange thickness mm
  tw: number;  // web thickness mm
  source: string;
}

export interface SteelGrade {
  fy: number;  // MPa
  fu: number;  // MPa
  label: string;
}

export interface ConcreteGrade {
  fck: number; // MPa
  label: string;
}

export interface AnchorGrade {
  fy: number;
  fu: number;
  sizes: (number | string)[];
  label: string;
}

export interface LoadCombo {
  id: string;
  name: string;
  formula: string;
  pf: number;  // axial factor
  mf: number;  // moment factor
  vf: number;  // shear factor
  uplift?: boolean;
}

export interface DesignState {
  // Design basis
  code: DesignCode;
  method: string;
  loadType: 'Factored' | 'Service';
  units: UnitSystem;
  supportType: SupportType;
  currentStep: number;
  projectName: string;
  designer: string;
  revision: string;

  // Column
  colType: string;
  colDesig: string;
  d: number;
  bf: number;
  tf: number;
  tw: number;
  sectionLocked: boolean;
  manualDimsEdited: boolean;

  // Plate
  N: number;
  B: number;
  tp: number;
  overrideConfirmed: boolean;

  // Support
  pedL: number;
  pedB: number;
  pedD: number;
  slabTs: number;
  slabEdgeDist: number;

  // Loads
  P: number;   // kN or kips
  Mx: number;  // kNm or kip-ft
  My: number;
  Vx: number;  // kN or kips
  Vy: number;
  loadCombo: string;

  // Materials
  colGrade: string;
  plateGrade: string;
  concreteGrade: string;
  colFy: number;
  colFu: number;
  plateFy: number;
  plateFu: number;
  fck: number;
  concreteLightweight: boolean;
  crackedConcrete: boolean;

  // Anchors
  anchorType: string;
  anchorGrade: string;
  anchorDia: number;
  anchorCount: number;
  edgeDist: number;
  spacing_x: number;
  spacing_y: number;
  hef: number;

  // Welds
  weldSize: number;
  weldLength: number;
  electrode: string;

  // Results
  results: DesignResults | null;
}

export interface DesignResults {
  geometry: CheckResult;
  eccentricity: EccentricityResult;
  bearing: CheckResult;
  plate_thickness: PlateThicknessResult;
  anchor_tension: CheckResult;
  anchor_shear: CheckResult;
  anchor_interaction: CheckResult;
  embedment: CheckResult;
  overall: CheckStatus;
  overallUtil: number;
}

export interface EccentricityResult {
  ex: number;
  ey: number;
  kern_x: number;
  kern_y: number;
  full_compression: boolean;
  condition: LoadCondition;
  anchor_tension_required: boolean;
  fp_max: number;
  fp_min: number;
  fp_avg: number;
}

export interface PlateThicknessResult extends CheckResult {
  m: number;
  n: number;
  n_prime: number;
  l_crit: number;
  tp_required: number;
  tp_provided: number;
  stiffener_recommended: boolean;
}
