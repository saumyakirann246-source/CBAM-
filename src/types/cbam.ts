export type SectorType = 'iron_steel' | 'aluminium' | 'fertilizers' | 'cement' | 'chemicals' | 'hydrogen';

export type BuyerFormat = 'eu_cbam_xml' | 'eu_official_excel' | 'buyer_custom_csv' | 'direct_api';

export type DispatchStatus = 'ready' | 'dispatched' | 'buyer_accepted' | 'revision_requested';

export type VerificationStatus = 'verified_clean' | 'verified_with_comments' | 'in_audit' | 'expiring_soon';

export interface PrecursorItem {
  id: string;
  name: string;
  cnCode: string;
  supplierName: string;
  countryOfOrigin: string;
  consumptionPerTon: number; // tons per ton of final good
  directEmissionFactor: number; // tCO2e / t
  indirectEmissionFactor: number; // tCO2e / t
  isVerified: boolean;
  verifierCertificateRef?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  cnCode: string;
  sector: SectorType;
  productionRoute: string;
  isSimpleGood: boolean; // simple vs complex
  directEmissions_tCO2e_per_t: number;
  indirectEmissions_tCO2e_per_t: number;
  precursorEmissions_tCO2e_per_t: number;
  totalEmissions_tCO2e_per_t: number;
  euDefaultBenchmark_tCO2e_per_t: number;
  quarterlyProductionTons: number;
  precursors: PrecursorItem[];
  installationFacilityId: string;
  measurementMethod: 'calculation_based' | 'measurement_based_cems';
}

export interface BuyerRelationship {
  id: string;
  companyName: string;
  buyerCountry: string;
  eoriNumber: string;
  primaryContact: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
  preferredFormat: BuyerFormat;
  allocatedProductIds: string[];
  quarterlyShippedTons: number;
  embeddedEmissionsTotal_tCO2e: number;
  status: DispatchStatus;
  lastDispatchDate: string | null;
  acknowledgmentRef?: string;
  customMappingNotes?: string;
  portalLink?: string;
}

export interface FuelEntry {
  id: string;
  fuelType: string;
  amount: number;
  unit: string;
  netCalorificValue: number; // GJ/unit
  emissionFactor: number; // tCO2/GJ
  totalEmissions_tCO2e: number;
}

export interface ProcessEmissionEntry {
  id: string;
  source: string; // e.g. Limestone calcination, graphite electrodes
  activityAmount: number;
  unit: string;
  emissionFactor: number;
  totalEmissions_tCO2e: number;
}

export interface EmissionsQuarterData {
  quarter: string; // e.g. "Q3 2026"
  year: number;
  status: 'draft' | 'under_audit' | 'verified_locked';
  grossProductionTons: number;
  directEmissions: {
    fuels: FuelEntry[];
    process: ProcessEmissionEntry[];
    totalDirect_tCO2e: number;
  };
  indirectEmissions: {
    electricityConsumptionMWh: number;
    gridEmissionFactor: number; // tCO2/MWh
    ppaFactor: number;
    usePPA: boolean;
    totalIndirect_tCO2e: number;
  };
  heatBalance: {
    netImportedHeatTJ: number;
    emissionFactorHeat: number;
  };
  verifierId?: string;
  verificationStatementId?: string;
  lockedAt?: string;
}

export interface DocumentVaultItem {
  id: string;
  title: string;
  docType: 'verification_statement' | 'iso14064_report' | 'lab_assay' | 'ppa_contract' | 'cems_calibration' | 'raw_material_cert';
  verifierName: string;
  accreditationBody: string;
  accreditationNumber: string;
  issueDate: string;
  validUntil: string;
  fileSize: string;
  sha256Hash: string;
  status: VerificationStatus;
  auditOpinion: string;
  coveredProductIds: string[];
  downloadFileName: string;
}

export interface ComplianceMilestone {
  id: string;
  title: string;
  deadlineDate: string;
  quarterTag: string;
  category: 'eu_submission' | 'data_freeze' | 'verifier_audit' | 'buyer_reconciliation';
  status: 'urgent' | 'upcoming' | 'completed';
  assignedTo: string;
  description: string;
  daysRemaining: number;
}

export type NotificationType =
  | 'deadline_alert'
  | 'buyer_request'
  | 'verification_update'
  | 'regulatory_update'
  | 'team_activity'
  | 'carbon_price'
  | 'system';

export type NotificationCategory = 'critical' | 'informational' | 'system';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  dateIso?: string;
  type: NotificationType;
  category?: NotificationCategory;
  urgency: 'critical' | 'warning' | 'info';
  isRead: boolean;
  actionLabel?: string;
  targetView?: string;
  targetStepId?: string;
  referenceCode?: string;
  actor?: {
    name: string;
    avatar: string;
    role?: string;
  };
}

export interface NotificationPreferenceSetting {
  id: string;
  categoryKey:
    | 'deadline_alerts'
    | 'buyer_requests'
    | 'verification_status'
    | 'regulatory_updates'
    | 'team_activity';
  label: string;
  description: string;
  inApp: boolean;
  email: boolean;
  frequency: 'instant' | 'daily_digest' | 'weekly_summary';
  minUrgency: 'all' | 'critical_only';
}

export interface InstallationFacility {
  id: string;
  name: string;
  code: string;
  unLocode: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  sector: SectorType;
  competentAuthority: string;
  annualCapacityTons: number;
  subInstallations: string[];
}

export interface UserPersona {
  id: string;
  name: string;
  role: string;
  organization: string;
  email: string;
  avatarText: string;
  badge: string;
}
