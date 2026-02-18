/* -------------------------------------------------------------------------- */
/*  crm-territory-map — Barrel Exports                                        */
/* -------------------------------------------------------------------------- */

export { TerritoryMap, default } from './TerritoryMap';
export type { TerritoryMapProps } from './TerritoryMap';

export type {
  Territory,
  SalesRep,
  TerritoryMetrics,
  MapConfig,
} from './types';

export {
  calculateQuotaAttainment,
  getAttainmentColor,
  sortTerritoriesByAttainment,
  getUnassignedTerritories,
  formatCurrency,
  calculateTotalMetrics,
} from './territory-utils';
