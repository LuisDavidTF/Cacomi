export const SELECTION_LOGIC = {
  EXPIRATION_RUSH: 'EXPIRATION_RUSH',     // Prioridad a alimentos por caducar
  BUDGET_SAVER: 'BUDGET_SAVER',           // Optimización de costos
  PROTEIN_FILL: 'PROTEIN_FILL',           // Prioridad a objetivos proteicos
  PANTRY_CLEARANCE: 'PANTRY_CLEARANCE',   // Limpieza de despensa general
  CALORIC_DENSITY: 'CALORIC_DENSITY'      // Enfoque en densidad calórica
} as const;

export type SelectionLogicCode = typeof SELECTION_LOGIC[keyof typeof SELECTION_LOGIC];

export const SELECTION_LOGIC_LABELS: Record<SelectionLogicCode, string> = {
  [SELECTION_LOGIC.EXPIRATION_RUSH]: 'Prioridad a alimentos por caducar',
  [SELECTION_LOGIC.BUDGET_SAVER]: 'Optimización de costos',
  [SELECTION_LOGIC.PROTEIN_FILL]: 'Prioridad a objetivos proteicos',
  [SELECTION_LOGIC.PANTRY_CLEARANCE]: 'Limpieza de despensa general',
  [SELECTION_LOGIC.CALORIC_DENSITY]: 'Enfoque en densidad calórica'
};
