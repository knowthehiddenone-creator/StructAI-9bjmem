import type { DesignState } from '@/types';
import {
  DEFAULT_COL_GRADE, DEFAULT_PLATE_GRADE, DEFAULT_CONCRETE_GRADE,
  DEFAULT_ANCHOR_GRADE, getSteelGrades, getConcreteGrades,
} from './materialData';
import { getDefaultType, getDefaultSection, getSectionProps } from './sectionData';

export function createDefaultState(): DesignState {
  const code = 'IS800';
  const colGrade = DEFAULT_COL_GRADE[code];
  const plateGrade = DEFAULT_PLATE_GRADE[code];
  const concreteGrade = DEFAULT_CONCRETE_GRADE[code];
  const steelDb = getSteelGrades(code);
  const concDb  = getConcreteGrades(code);
  const colType = getDefaultType(code);
  const colDesig = getDefaultSection(code);
  const sec = getSectionProps(code, colType, colDesig);

  return {
    code,
    method: 'LSM',
    loadType: 'Factored',
    units: 'SI',
    supportType: 'PEDESTAL',
    currentStep: 1,
    projectName: 'Industrial Building — Column C3',
    designer: 'Sr. Structural Engineer',
    revision: 'R0 — Final',
    colType,
    colDesig,
    d:  sec?.d  ?? 300,
    bf: sec?.bf ?? 140,
    tf: sec?.tf ?? 13.1,
    tw: sec?.tw ?? 7.5,
    sectionLocked: true,
    manualDimsEdited: false,
    N: 500, B: 500, tp: 25,
    overrideConfirmed: false,
    pedL: 600, pedB: 600, pedD: 800,
    slabTs: 300, slabEdgeDist: 200,
    P: 800, Mx: 60, My: 0, Vx: 40, Vy: 0,
    loadCombo: 'IS-C1',
    colGrade,
    plateGrade,
    concreteGrade,
    colFy:    steelDb[colGrade]?.fy   ?? 250,
    colFu:    steelDb[colGrade]?.fu   ?? 410,
    plateFy:  steelDb[plateGrade]?.fy ?? 250,
    plateFu:  steelDb[plateGrade]?.fu ?? 410,
    fck:      concDb[concreteGrade]?.fck ?? 30,
    concreteLightweight: false,
    crackedConcrete: true,
    anchorType:  'Cast-in Headed',
    anchorGrade: DEFAULT_ANCHOR_GRADE[code],
    anchorDia:   24,
    anchorCount: 4,
    edgeDist:    100,
    spacing_x:   350,
    spacing_y:   350,
    hef:         400,
    weldSize:    10,
    weldLength:  600,
    electrode:   'E41XX',
    results: null,
  };
}

export function applyCodeDefaults(state: DesignState): Partial<DesignState> {
  const code = state.code;
  const units: 'SI' | 'US' = code === 'IS800' ? 'SI' : 'US';
  const colGrade    = DEFAULT_COL_GRADE[code];
  const plateGrade  = DEFAULT_PLATE_GRADE[code];
  const concreteGrade = DEFAULT_CONCRETE_GRADE[code];
  const anchorGrade = DEFAULT_ANCHOR_GRADE[code];
  const steelDb     = getSteelGrades(code);
  const concDb      = getConcreteGrades(code);
  const colType     = getDefaultType(code);
  const colDesig    = getDefaultSection(code);
  const sec         = getSectionProps(code, colType, colDesig);

  return {
    units,
    colGrade, plateGrade, concreteGrade, anchorGrade,
    colFy:   steelDb[colGrade]?.fy   ?? 250,
    colFu:   steelDb[colGrade]?.fu   ?? 410,
    plateFy: steelDb[plateGrade]?.fy ?? 250,
    plateFu: steelDb[plateGrade]?.fu ?? 410,
    fck:     concDb[concreteGrade]?.fck ?? 30,
    colType, colDesig,
    d:  sec?.d  ?? 300,
    bf: sec?.bf ?? 140,
    tf: sec?.tf ?? 13.1,
    tw: sec?.tw ?? 7.5,
    sectionLocked: true,
    manualDimsEdited: false,
    anchorDia: code === 'IS800' ? 24 : 25, // M24 vs 1in
    hef: code === 'IS800' ? 400 : 16,
    electrode: code === 'IS800' ? 'E41XX' : 'E70XX',
  };
}
