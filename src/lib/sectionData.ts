import type { SectionProps } from '@/types';

// ============================================================
// IS 808:1989 SECTIONS
// ============================================================
export const IS_SECTIONS: Record<string, Record<string, SectionProps>> = {
  'ISMB': {
    'ISMB 100':  { d: 100, bf: 75,  tf: 7.5,  tw: 4.0,  source: 'IS 808:1989' },
    'ISMB 150':  { d: 150, bf: 80,  tf: 7.6,  tw: 4.8,  source: 'IS 808:1989' },
    'ISMB 200':  { d: 200, bf: 100, tf: 10.8, tw: 5.7,  source: 'IS 808:1989' },
    'ISMB 250':  { d: 250, bf: 125, tf: 12.5, tw: 6.9,  source: 'IS 808:1989' },
    'ISMB 300':  { d: 300, bf: 140, tf: 13.1, tw: 7.5,  source: 'IS 808:1989' },
    'ISMB 350':  { d: 350, bf: 140, tf: 14.2, tw: 8.1,  source: 'IS 808:1989' },
    'ISMB 400':  { d: 400, bf: 140, tf: 16.0, tw: 8.9,  source: 'IS 808:1989' },
    'ISMB 450':  { d: 450, bf: 150, tf: 17.4, tw: 9.4,  source: 'IS 808:1989' },
    'ISMB 500':  { d: 500, bf: 180, tf: 17.2, tw: 10.2, source: 'IS 808:1989' },
    'ISMB 550':  { d: 550, bf: 190, tf: 19.3, tw: 11.2, source: 'IS 808:1989' },
    'ISMB 600':  { d: 600, bf: 210, tf: 20.8, tw: 12.0, source: 'IS 808:1989' },
  },
  'ISHB': {
    'ISHB 150':  { d: 150, bf: 150, tf: 9.0,  tw: 5.4,  source: 'IS 808:1989' },
    'ISHB 200':  { d: 200, bf: 200, tf: 9.0,  tw: 6.1,  source: 'IS 808:1989' },
    'ISHB 225':  { d: 225, bf: 225, tf: 9.1,  tw: 6.5,  source: 'IS 808:1989' },
    'ISHB 250':  { d: 250, bf: 250, tf: 9.7,  tw: 6.9,  source: 'IS 808:1989' },
    'ISHB 300':  { d: 300, bf: 250, tf: 10.6, tw: 7.6,  source: 'IS 808:1989' },
    'ISHB 350':  { d: 350, bf: 250, tf: 11.6, tw: 8.3,  source: 'IS 808:1989' },
    'ISHB 400':  { d: 400, bf: 250, tf: 12.7, tw: 8.8,  source: 'IS 808:1989' },
  },
  'ISMC': {
    'ISMC 75':   { d: 75,  bf: 40,  tf: 7.3,  tw: 4.4,  source: 'IS 808:1989' },
    'ISMC 100':  { d: 100, bf: 50,  tf: 7.5,  tw: 4.7,  source: 'IS 808:1989' },
    'ISMC 150':  { d: 150, bf: 75,  tf: 9.0,  tw: 5.4,  source: 'IS 808:1989' },
    'ISMC 200':  { d: 200, bf: 75,  tf: 11.4, tw: 6.1,  source: 'IS 808:1989' },
    'ISMC 250':  { d: 250, bf: 80,  tf: 12.5, tw: 7.1,  source: 'IS 808:1989' },
    'ISMC 300':  { d: 300, bf: 90,  tf: 13.6, tw: 7.8,  source: 'IS 808:1989' },
    'ISMC 400':  { d: 400, bf: 100, tf: 16.0, tw: 8.8,  source: 'IS 808:1989' },
  },
  'Built-up / Custom': {
    'Custom': { d: 300, bf: 150, tf: 15.0, tw: 8.0, source: 'Custom' },
  },
};

// ============================================================
// AISC MANUAL 16th Ed W-SHAPES
// ============================================================
export const AISC_SECTIONS: Record<string, Record<string, SectionProps>> = {
  'W-Shape': {
    'W8x31':   { d: 203, bf: 203, tf: 11.0, tw: 7.2,  source: 'AISC Manual 16th Ed' },
    'W8x40':   { d: 210, bf: 205, tf: 14.2, tw: 8.1,  source: 'AISC Manual 16th Ed' },
    'W8x48':   { d: 216, bf: 206, tf: 17.4, tw: 9.1,  source: 'AISC Manual 16th Ed' },
    'W10x49':  { d: 253, bf: 254, tf: 14.2, tw: 8.6,  source: 'AISC Manual 16th Ed' },
    'W10x68':  { d: 260, bf: 256, tf: 19.6, tw: 10.0, source: 'AISC Manual 16th Ed' },
    'W12x53':  { d: 307, bf: 254, tf: 15.7, tw: 9.4,  source: 'AISC Manual 16th Ed' },
    'W12x72':  { d: 315, bf: 255, tf: 21.1, tw: 10.9, source: 'AISC Manual 16th Ed' },
    'W14x68':  { d: 358, bf: 254, tf: 18.0, tw: 10.5, source: 'AISC Manual 16th Ed' },
    'W14x90':  { d: 362, bf: 257, tf: 23.6, tw: 11.2, source: 'AISC Manual 16th Ed' },
    'W14x120': { d: 373, bf: 264, tf: 30.2, tw: 13.1, source: 'AISC Manual 16th Ed' },
    'W16x77':  { d: 410, bf: 260, tf: 18.9, tw: 11.9, source: 'AISC Manual 16th Ed' },
    'W18x97':  { d: 463, bf: 283, tf: 21.3, tw: 11.9, source: 'AISC Manual 16th Ed' },
    'W24x76':  { d: 599, bf: 222, tf: 14.4, tw: 8.9,  source: 'AISC Manual 16th Ed' },
  },
  'HSS Square': {
    'HSS8x8x1/2':   { d: 203, bf: 203, tf: 12.7, tw: 12.7, source: 'AISC Manual 16th Ed' },
    'HSS10x10x1/2': { d: 254, bf: 254, tf: 12.7, tw: 12.7, source: 'AISC Manual 16th Ed' },
    'HSS12x12x1/2': { d: 305, bf: 305, tf: 12.7, tw: 12.7, source: 'AISC Manual 16th Ed' },
  },
  'HSS Rectangular': {
    'HSS12x8x1/2': { d: 305, bf: 203, tf: 12.7, tw: 12.7, source: 'AISC Manual 16th Ed' },
    'HSS10x6x1/2': { d: 254, bf: 152, tf: 12.7, tw: 12.7, source: 'AISC Manual 16th Ed' },
  },
  'Pipe': {
    'Pipe6STD':   { d: 168, bf: 168, tf: 7.1,  tw: 7.1,  source: 'AISC Manual 16th Ed' },
    'Pipe8STD':   { d: 219, bf: 219, tf: 8.2,  tw: 8.2,  source: 'AISC Manual 16th Ed' },
    'Pipe10STD':  { d: 273, bf: 273, tf: 9.3,  tw: 9.3,  source: 'AISC Manual 16th Ed' },
  },
  'Built-up / Custom': {
    'Custom': { d: 300, bf: 200, tf: 20.0, tw: 10.0, source: 'Custom' },
  },
};

export function getSectionTypes(code: string): string[] {
  return Object.keys(code === 'IS800' ? IS_SECTIONS : AISC_SECTIONS);
}

export function getSectionsForType(code: string, type: string): Record<string, SectionProps> {
  const db = code === 'IS800' ? IS_SECTIONS : AISC_SECTIONS;
  return db[type] || {};
}

export function getSectionProps(code: string, type: string, desig: string): SectionProps | null {
  const db = code === 'IS800' ? IS_SECTIONS : AISC_SECTIONS;
  return db[type]?.[desig] || null;
}

export function getDefaultType(code: string): string {
  return code === 'IS800' ? 'ISMB' : 'W-Shape';
}

export function getDefaultSection(code: string): string {
  return code === 'IS800' ? 'ISMB 300' : 'W14x68';
}
