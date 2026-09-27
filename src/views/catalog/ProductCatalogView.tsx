import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  ArrowRight,
  ChevronDown,
  X,
  FileCode,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Hash,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Filter,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Factory,
  Zap,
  Layers,
  Sparkles,
  Building2,
  Check,
  ArrowLeft,
  Flame,
  ShieldCheck,
  Upload,
  Download,
  Calendar,
  MoreVertical,
  Lock,
  FileSpreadsheet,
  FileUp,
} from 'lucide-react';
import { useCbam } from '../../context/CbamContext';

export type SectorType = 'iron_steel' | 'aluminium' | 'cement' | 'fertiliser' | 'hydrogen' | 'electricity';

export interface ProductPeriodData {
  period: string;
  quarterLabel: string;
  quantityProducedT: number;
  electricityConsumedMwh: number;
  naturalGasNm3: number;
  lightFuelOilT: number;
  usesActualData: boolean;
  directSEE: number;
  indirectSEE: number;
  totalSEE: number;
  isComplete: boolean;
  status: 'verified' | 'provisional' | 'incomplete';
}

export interface ProductMasterRecord {
  id: string;
  name: string;
  sku: string;
  cnCode: string;
  sector: SectorType;
  sectorLabel: string;
  productionRoute: string;
  isComplete: boolean;
  complianceStatus: 'compliant' | 'warning' | 'incomplete';
  incompleteReason?: string;
  installationName: string;
  installationCode: string;
  installationLocation: string;
  isSimpleGood: boolean;
  specificDirectSEE: number;
  specificIndirectSEE: number;
  specificPrecursorSEE: number;
  totalEmbeddedSEE: number;
  euDefaultBenchmark: number;
  periodsData: ProductPeriodData[];
  connectedBuyerNames: string[];
}

export interface ProductDocument {
  id: string;
  title: string;
  docType: 'verifier_opinion' | 'cems_calibration' | 'energy_bill' | 'raw_material_cert' | 'methodology';
  docTypeLabel: string;
  verifierName: string;
  issueDate: string;
  validUntil: string;
  fileSize: string;
  sha256Hash: string;
  status: 'verified_clean' | 'expiring_soon' | 'pending_audit';
  statusLabel: string;
  downloadFileName: string;
  retentionYearsRemaining: number;
}

const CN_CODE_REFERENCE_RANGES = [
  {
    range: '72xx, 73xx',
    sector: 'Iron & Steel',
    desc: 'Pig iron, sponge iron, ferro-alloys, crude steel, hot-rolled coils, wire rod, bars, structural hollow sections.',
    defaultSEE: '1.42 – 2.18 tCO₂e/t',
  },
  {
    range: '76xx',
    sector: 'Aluminium',
    desc: 'Unwrought aluminium, alloyed slabs, extrusion billets, wire, plates, foil, extruded structural profiles.',
    defaultSEE: '4.50 – 8.20 tCO₂e/t',
  },
  {
    range: '2523',
    sector: 'Cement',
    desc: 'Portland cement, grey clinker, aluminous cement, hydraulic cements.',
    defaultSEE: '0.62 – 0.94 tCO₂e/t',
  },
  {
    range: '28xx, 31xx',
    sector: 'Fertilisers',
    desc: 'Nitric acid, ammonia, urea, ammonium nitrate, pure and mixed fertilisers.',
    defaultSEE: '1.80 – 3.20 tCO₂e/t',
  },
  {
    range: '2804 10',
    sector: 'Hydrogen',
    desc: 'Pure compressed and liquefied hydrogen fuel and chemical feedstocks.',
    defaultSEE: '8.90 – 11.40 tCO₂e/t',
  },
  {
    range: '2716 00',
    sector: 'Electricity',
    desc: 'Cross-border physical electricity transmission from non-EU interconnected grids.',
    defaultSEE: '0.428 tCO₂e/MWh',
  },
];

const INITIAL_PRODUCTS: ProductMasterRecord[] = [
  {
    id: 'prod-01',
    name: 'Hot-Rolled Steel Coil (Grade S235JR)',
    sku: 'HRC-S235JR-2.5MM',
    cnCode: '7208 39 00',
    sector: 'iron_steel',
    sectorLabel: 'Iron & Steel',
    productionRoute: 'EAF + 85% Scrap Recycling',
    isComplete: true,
    complianceStatus: 'compliant',
    installationName: 'Aegean Rolling Mill #04',
    installationCode: 'VANG-AEG-04',
    installationLocation: 'Aliağa, İzmir (Turkey)',
    isSimpleGood: false,
    specificDirectSEE: 0.385,
    specificIndirectSEE: 0.192,
    specificPrecursorSEE: 0.078,
    totalEmbeddedSEE: 0.655,
    euDefaultBenchmark: 1.89,
    connectedBuyerNames: [
      'ThyssenKrupp Materials Services GmbH',
      'ArcelorMittal Europe S.A.',
      'Klöckner & Co SE',
    ],
    periodsData: [
      {
        period: '2026-Q3',
        quarterLabel: 'Q3 2026 (Current)',
        quantityProducedT: 42500,
        electricityConsumedMwh: 21250,
        naturalGasNm3: 1785000,
        lightFuelOilT: 120,
        usesActualData: true,
        directSEE: 0.385,
        indirectSEE: 0.192,
        totalSEE: 0.655,
        isComplete: true,
        status: 'verified',
      },
      {
        period: '2026-Q2',
        quarterLabel: 'Q2 2026',
        quantityProducedT: 39800,
        electricityConsumedMwh: 20100,
        naturalGasNm3: 1720000,
        lightFuelOilT: 140,
        usesActualData: true,
        directSEE: 0.402,
        indirectSEE: 0.204,
        totalSEE: 0.684,
        isComplete: true,
        status: 'verified',
      },
      {
        period: '2026-Q1',
        quarterLabel: 'Q1 2026',
        quantityProducedT: 41200,
        electricityConsumedMwh: 21500,
        naturalGasNm3: 1810000,
        lightFuelOilT: 160,
        usesActualData: true,
        directSEE: 0.418,
        indirectSEE: 0.216,
        totalSEE: 0.712,
        isComplete: true,
        status: 'verified',
      },
    ],
  },
  {
    id: 'prod-02',
    name: 'Concrete Reinforcing Rebar (B500B)',
    sku: 'REB-B500B-12MM',
    cnCode: '7214 20 00',
    sector: 'iron_steel',
    sectorLabel: 'Iron & Steel',
    productionRoute: 'EAF Melt Shop + Slit Rolling',
    isComplete: true,
    complianceStatus: 'compliant',
    installationName: 'Aegean Rolling Mill #04',
    installationCode: 'VANG-AEG-04',
    installationLocation: 'Aliağa, İzmir (Turkey)',
    isSimpleGood: false,
    specificDirectSEE: 0.342,
    specificIndirectSEE: 0.155,
    specificPrecursorSEE: 0.058,
    totalEmbeddedSEE: 0.555,
    euDefaultBenchmark: 1.74,
    connectedBuyerNames: ['ThyssenKrupp Materials Services GmbH', 'Saint-Gobain Building Glass France'],
    periodsData: [
      {
        period: '2026-Q3',
        quarterLabel: 'Q3 2026 (Current)',
        quantityProducedT: 28400,
        electricityConsumedMwh: 13916,
        naturalGasNm3: 1107600,
        lightFuelOilT: 85,
        usesActualData: true,
        directSEE: 0.342,
        indirectSEE: 0.155,
        totalSEE: 0.555,
        isComplete: true,
        status: 'verified',
      },
      {
        period: '2026-Q2',
        quarterLabel: 'Q2 2026',
        quantityProducedT: 27100,
        electricityConsumedMwh: 13500,
        naturalGasNm3: 1080000,
        lightFuelOilT: 90,
        usesActualData: true,
        directSEE: 0.358,
        indirectSEE: 0.168,
        totalSEE: 0.584,
        isComplete: true,
        status: 'verified',
      },
      {
        period: '2026-Q1',
        quarterLabel: 'Q1 2026',
        quantityProducedT: 26500,
        electricityConsumedMwh: 13400,
        naturalGasNm3: 1075000,
        lightFuelOilT: 95,
        usesActualData: true,
        directSEE: 0.375,
        indirectSEE: 0.179,
        totalSEE: 0.612,
        isComplete: true,
        status: 'verified',
      },
    ],
  },
  {
    id: 'prod-03',
    name: 'Aluminium Extrusion Billets (6063)',
    sku: 'ALU-BIL-6063-T6',
    cnCode: '7601 20 20',
    sector: 'aluminium',
    sectorLabel: 'Aluminium',
    productionRoute: 'Secondary Re-melting (45% Scrap)',
    isComplete: true,
    complianceStatus: 'warning',
    installationName: 'Anatolia Light Metals & Smelting #02',
    installationCode: 'VANG-ANA-02',
    installationLocation: 'Bursa (Turkey)',
    isSimpleGood: false,
    specificDirectSEE: 0.62,
    specificIndirectSEE: 0.84,
    specificPrecursorSEE: 1.35,
    totalEmbeddedSEE: 2.81,
    euDefaultBenchmark: 6.94,
    connectedBuyerNames: ['Klöckner & Co SE', 'Outokumpu Stainless Oyj'],
    periodsData: [
      {
        period: '2026-Q3',
        quarterLabel: 'Q3 2026 (Current)',
        quantityProducedT: 14200,
        electricityConsumedMwh: 17040,
        naturalGasNm3: 1846000,
        lightFuelOilT: 45,
        usesActualData: true,
        directSEE: 0.62,
        indirectSEE: 0.84,
        totalSEE: 2.81,
        isComplete: true,
        status: 'provisional',
      },
      {
        period: '2026-Q2',
        quarterLabel: 'Q2 2026',
        quantityProducedT: 13800,
        electricityConsumedMwh: 16800,
        naturalGasNm3: 1820000,
        lightFuelOilT: 50,
        usesActualData: true,
        directSEE: 0.65,
        indirectSEE: 0.90,
        totalSEE: 2.95,
        isComplete: true,
        status: 'verified',
      },
    ],
  },
  {
    id: 'prod-04',
    name: 'Cold-Formed Structural Welded Tubes',
    sku: 'TUB-CFS-80X80X4',
    cnCode: '7306 61 92',
    sector: 'iron_steel',
    sectorLabel: 'Iron & Steel',
    productionRoute: 'Electric Resistance Welded (ERW)',
    isComplete: false,
    complianceStatus: 'incomplete',
    incompleteReason: 'Telemetry missing for Q3 2026 period — currently falling back to EU default values',
    installationName: 'Aegean Rolling Mill #04',
    installationCode: 'VANG-AEG-04',
    installationLocation: 'Aliağa, İzmir (Turkey)',
    isSimpleGood: true,
    specificDirectSEE: 0.0,
    specificIndirectSEE: 0.0,
    specificPrecursorSEE: 0.0,
    totalEmbeddedSEE: 1.58,
    euDefaultBenchmark: 1.58,
    connectedBuyerNames: ['Salzgitter Mannesmann International GmbH'],
    periodsData: [
      {
        period: '2026-Q3',
        quarterLabel: 'Q3 2026 (Current)',
        quantityProducedT: 8500,
        electricityConsumedMwh: 0,
        naturalGasNm3: 0,
        lightFuelOilT: 0,
        usesActualData: false,
        directSEE: 1.15,
        indirectSEE: 0.43,
        totalSEE: 1.58,
        isComplete: false,
        status: 'incomplete',
      },
    ],
  },
];

const INITIAL_DOCUMENTS: Record<string, ProductDocument[]> = {
  'prod-01': [
    {
      id: 'doc-01',
      title: 'TÜV SÜD Periodic Verification Statement & Auditor Opinion (Annex IV)',
      docType: 'verifier_opinion',
      docTypeLabel: 'Auditor Opinion',
      verifierName: 'TÜV SÜD Industrie Service GmbH',
      issueDate: '2026-08-20',
      validUntil: '2027-08-19',
      fileSize: '4.8 MB',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      status: 'verified_clean',
      statusLabel: 'Verified & Signed',
      downloadFileName: 'TUV_SUD_Verification_Statement_Annex_IV_2026.pdf',
      retentionYearsRemaining: 5,
    },
    {
      id: 'doc-03',
      title: 'Eurofins Natural Gas Chromatography & Net Calorific Value Assay',
      docType: 'methodology',
      docTypeLabel: 'Lab Assay',
      verifierName: 'Eurofins Environmental Services TR',
      issueDate: '2026-07-15',
      validUntil: '2026-10-14',
      fileSize: '2.1 MB',
      sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      status: 'verified_clean',
      statusLabel: 'Verified & Signed',
      downloadFileName: 'Eurofins_Lab_Assay_Gas_Carbon_Q3_2026.pdf',
      retentionYearsRemaining: 5,
    },
    {
      id: 'doc-04',
      title: 'Renewable Power Purchase Agreement (PPA) & Guarantees of Origin',
      docType: 'energy_bill',
      docTypeLabel: 'PPA & GoO',
      verifierName: 'Enerjisa Geothermal & Solar Generation A.Ş.',
      issueDate: '2026-01-10',
      validUntil: '2028-12-31',
      fileSize: '3.4 MB',
      sha256Hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      status: 'verified_clean',
      statusLabel: 'Active Contract',
      downloadFileName: 'PPA_Renewable_GoO_Certificate_Enerjisa_2026.pdf',
      retentionYearsRemaining: 5,
    },
  ],
  'prod-02': [
    {
      id: 'doc-02',
      title: 'Bureau Veritas Annual Greenhouse Gas ISO 14064-3 Attestation',
      docType: 'verifier_opinion',
      docTypeLabel: 'Auditor Opinion',
      verifierName: 'Bureau Veritas Certification France',
      issueDate: '2026-06-12',
      validUntil: '2027-06-11',
      fileSize: '2.7 MB',
      sha256Hash: '8799793132e0e41b96a86e96901844b1c20f04f216e2b9c7cf72382e66699318',
      status: 'verified_clean',
      statusLabel: 'Verified & Signed',
      downloadFileName: 'BV_ISO14064_Verification_Attestation_2026.pdf',
      retentionYearsRemaining: 5,
    },
    {
      id: 'doc-05',
      title: 'CEMS Continuous Emission Monitoring Calibration & QAL2 Report',
      docType: 'cems_calibration',
      docTypeLabel: 'CEMS Calibration',
      verifierName: 'SICK AG Industrial Instrumentation',
      issueDate: '2026-05-20',
      validUntil: '2027-05-19',
      fileSize: '5.1 MB',
      sha256Hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
      status: 'verified_clean',
      statusLabel: 'Verified & Signed',
      downloadFileName: 'CEMS_QAL2_Calibration_Report_SICK_2026.pdf',
      retentionYearsRemaining: 4,
    },
  ],
  'prod-03': [
    {
      id: 'doc-06',
      title: 'Supplier Precursor Certificate: Smelter Alumina Grade P1020',
      docType: 'raw_material_cert',
      docTypeLabel: 'Precursor Cert',
      verifierName: 'Bureau Veritas Australia Pty Ltd',
      issueDate: '2026-03-14',
      validUntil: '2026-12-31',
      fileSize: '1.9 MB',
      sha256Hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      status: 'expiring_soon',
      statusLabel: 'Expiring Soon (90d)',
      downloadFileName: 'BV_Alumina_Precursor_Audit_Gladstone_2026.pdf',
      retentionYearsRemaining: 4,
    },
  ],
  'prod-04': [],
};

interface ProductCatalogViewProps {
  onNavigateStep?: (stepId: string) => void;
}

export const ProductCatalogView: React.FC<ProductCatalogViewProps> = ({ onNavigateStep }) => {
  const { triggerToast, activeInstallation, setIsAddProductOpen, products: contextProducts } = useCbam();

  const [products, setProducts] = useState<ProductMasterRecord[]>(INITIAL_PRODUCTS);
  const [documentsMap, setDocumentsMap] = useState<Record<string, ProductDocument[]>>(INITIAL_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductMasterRecord | null>(null);

  // Active Tab inside Product Detail: 'overview' | 'production_data' | 'documents'
  const [detailTab, setDetailTab] = useState<'overview' | 'production_data' | 'documents'>('overview');

  // Secondary Panels & Modals
  const [isCnRefOpen, setIsCnRefOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isVerifierModalOpen, setIsVerifierModalOpen] = useState(false);
  const [selectedVerifier, setSelectedVerifier] = useState('TÜV SÜD Industrie Service GmbH');

  // Sync new products added via context AddProductModal
  useEffect(() => {
    if (contextProducts && contextProducts.length > 0) {
      setProducts((current) => {
        const existingIds = new Set(current.map((p) => p.id));
        const newOnes: ProductMasterRecord[] = contextProducts
          .filter((cp) => !existingIds.has(cp.id))
          .map((cp) => ({
            id: cp.id,
            name: cp.name,
            sku: cp.cnCode.replace(/\s+/g, '-') + '-01',
            cnCode: cp.cnCode,
            sector: cp.sector as SectorType,
            sectorLabel: cp.sector.replace('_', ' ').toUpperCase(),
            productionRoute: cp.productionRoute,
            isComplete: true,
            complianceStatus: 'compliant',
            installationName: activeInstallation.name,
            installationCode: activeInstallation.code || 'VANG-AEG-04',
            installationLocation: `${activeInstallation.city}, ${activeInstallation.country}`,
            isSimpleGood: cp.isSimpleGood,
            specificDirectSEE: cp.directEmissions_tCO2e_per_t,
            specificIndirectSEE: cp.indirectEmissions_tCO2e_per_t,
            specificPrecursorSEE: cp.precursorEmissions_tCO2e_per_t,
            totalEmbeddedSEE: cp.totalEmissions_tCO2e_per_t,
            euDefaultBenchmark: cp.euDefaultBenchmark_tCO2e_per_t,
            periodsData: [
              {
                period: '2026-Q3',
                quarterLabel: 'Q3 2026 (Current)',
                quantityProducedT: cp.quarterlyProductionTons || 25000,
                electricityConsumedMwh: 12500,
                naturalGasNm3: 1050000,
                lightFuelOilT: 75,
                usesActualData: true,
                directSEE: cp.directEmissions_tCO2e_per_t,
                indirectSEE: cp.indirectEmissions_tCO2e_per_t,
                totalSEE: cp.totalEmissions_tCO2e_per_t,
                isComplete: true,
                status: 'verified',
              },
            ],
            connectedBuyerNames: ['ThyssenKrupp Materials Services GmbH'],
          }));
        if (newOnes.length === 0) return current;
        return [...current, ...newOnes];
      });
    }
  }, [contextProducts, activeInstallation]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cnCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSector = sectorFilter === 'all' || p.sector === sectorFilter;
      return matchSearch && matchSector;
    });
  }, [products, searchQuery, sectorFilter]);

  // Production data entry inputs for selected period
  const [activePeriodIndex, setActivePeriodIndex] = useState(0);

  const handleUpdateTelemetry = (
    field: 'quantityProducedT' | 'electricityConsumedMwh' | 'naturalGasNm3' | 'lightFuelOilT' | 'usesActualData',
    value: any
  ) => {
    if (!selectedProduct) return;
    const updatedPeriods = [...selectedProduct.periodsData];
    const currentPeriod = { ...updatedPeriods[activePeriodIndex], [field]: value };

    // Real-time calculation using CBAM math
    if (currentPeriod.usesActualData) {
      const gasTj = (currentPeriod.naturalGasNm3 * 38.2) / 1000000;
      const gasCO2 = gasTj * 56.1 * 0.998;
      const oilCO2 = (currentPeriod.lightFuelOilT * 42.8 * 74.1) / 1000;
      const directTotal = gasCO2 + oilCO2;
      const directSEE = currentPeriod.quantityProducedT > 0 ? directTotal / currentPeriod.quantityProducedT : 0;

      const indirectTotal = currentPeriod.electricityConsumedMwh * 0.384;
      const indirectSEE = currentPeriod.quantityProducedT > 0 ? indirectTotal / currentPeriod.quantityProducedT : 0;

      currentPeriod.directSEE = Math.round(directSEE * 1000) / 1000;
      currentPeriod.indirectSEE = Math.round(indirectSEE * 1000) / 1000;
      currentPeriod.totalSEE = Math.round((directSEE + indirectSEE + selectedProduct.specificPrecursorSEE) * 1000) / 1000;
      currentPeriod.isComplete = currentPeriod.quantityProducedT > 0;
      currentPeriod.status = 'verified';
    } else {
      currentPeriod.directSEE = selectedProduct.euDefaultBenchmark * 0.7;
      currentPeriod.indirectSEE = selectedProduct.euDefaultBenchmark * 0.3;
      currentPeriod.totalSEE = selectedProduct.euDefaultBenchmark;
      currentPeriod.status = 'incomplete';
    }

    updatedPeriods[activePeriodIndex] = currentPeriod;
    const updatedProd = { ...selectedProduct, periodsData: updatedPeriods };
    setSelectedProduct(updatedProd);
    setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
  };

  const handleSaveProductionData = () => {
    triggerToast('Production data and calculated emissions saved successfully.');
  };

  const handleUploadDocument = () => {
    if (!selectedProduct) return;
    const newDoc: ProductDocument = {
      id: `doc-${Date.now()}`,
      title: `Quarterly Calibration & Verification Statement (${new Date().toLocaleDateString('en-GB')})`,
      docType: 'verifier_opinion',
      docTypeLabel: 'Auditor Statement',
      verifierName: 'TÜV SÜD Industrie Service GmbH',
      issueDate: new Date().toISOString().split('T')[0],
      validUntil: '2027-09-30',
      fileSize: '3.1 MB',
      sha256Hash: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
      status: 'verified_clean',
      statusLabel: 'Verified & Signed',
      downloadFileName: `Verification_Report_${selectedProduct.sku}.pdf`,
      retentionYearsRemaining: 5,
    };

    setDocumentsMap((prev) => ({
      ...prev,
      [selectedProduct.id]: [newDoc, ...(prev[selectedProduct.id] || [])],
    }));

    triggerToast('Document uploaded and SHA-256 hash verified into audit vault.');
  };

  const handleBulkImportConfirm = () => {
    setIsBulkImportOpen(false);
    triggerToast('Batch telemetry records imported from ERP spreadsheet successfully.');
  };

  const handleRequestVerification = () => {
    setIsVerifierModalOpen(false);
    triggerToast(`Verification audit request formally dispatched to ${selectedVerifier}!`);
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------- */}
      {/* IF A PRODUCT IS SELECTED: SHOW 3-TAB PRODUCT DETAIL PAGE            */}
      {/* ------------------------------------------------------------------- */}
      {selectedProduct ? (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Bar: Back Action & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors inline-flex items-center gap-1.5 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Products</span>
              </button>
              <div className="h-5 w-px bg-slate-200 hidden sm:block" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold font-display text-slate-900">
                    {selectedProduct.name}
                  </h1>
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    CN {selectedProduct.cnCode}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                  <span>SKU: {selectedProduct.sku}</span>
                  <span>·</span>
                  <span>{selectedProduct.sectorLabel}</span>
                  <span>·</span>
                  <span>{selectedProduct.installationName}</span>
                </div>
              </div>
            </div>

            {/* Compliance Badge & Actions */}
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  selectedProduct.complianceStatus === 'compliant'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : selectedProduct.complianceStatus === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {selectedProduct.complianceStatus === 'compliant' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                <span>
                  {selectedProduct.complianceStatus === 'compliant'
                    ? 'Compliant (Actual Data)'
                    : selectedProduct.complianceStatus === 'warning'
                    ? 'Provisional Audit'
                    : 'Incomplete Telemetry'}
                </span>
              </span>

              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Close View
              </button>
            </div>
          </div>

          {/* TAB BAR: 3 TABS (Overview, Production Data, Documents) */}
          <div className="flex items-center gap-2 border-b border-slate-200/80 pb-px">
            <button
              type="button"
              onClick={() => setDetailTab('overview')}
              className={`pb-3 px-4 text-xs font-bold transition-all relative ${
                detailTab === 'overview'
                  ? 'text-emerald-700'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>1. Overview</span>
              {detailTab === 'overview' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setDetailTab('production_data')}
              className={`pb-3 px-4 text-xs font-bold transition-all relative ${
                detailTab === 'production_data'
                  ? 'text-emerald-700'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>2. Production Data</span>
              {detailTab === 'production_data' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setDetailTab('documents')}
              className={`pb-3 px-4 text-xs font-bold transition-all relative ${
                detailTab === 'documents'
                  ? 'text-emerald-700'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>3. Documents</span>
              {detailTab === 'documents' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {detailTab === 'overview' && (
            <div className="space-y-6">
              {/* SEE Metric Summary Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Specific Embedded Emissions (SEE)
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-bold font-display text-slate-900 tabular-nums">
                        {selectedProduct.totalEmbeddedSEE.toFixed(3)}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">tCO₂e / t output</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-medium text-slate-500">EU Default Benchmark</span>
                    <div className="text-lg font-bold text-slate-600 mt-0.5">
                      {selectedProduct.euDefaultBenchmark.toFixed(2)} tCO₂e/t
                    </div>
                    <span className="text-xs font-bold text-emerald-700">
                      {Math.round(
                        ((selectedProduct.euDefaultBenchmark - selectedProduct.totalEmbeddedSEE) /
                          selectedProduct.euDefaultBenchmark) *
                          100
                      )}
                      % lower than EU default
                    </span>
                  </div>
                </div>

                {/* Sub-Components (Direct, Indirect, Precursor) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
                  <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                    <span className="text-slate-500 font-medium">Direct Emissions (Scope 1)</span>
                    <div className="text-base font-bold text-slate-900">
                      {selectedProduct.specificDirectSEE} <span className="text-xs font-normal">t/t</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Natural gas + fuel oil combustion</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                    <span className="text-slate-500 font-medium">Indirect Emissions (Scope 2)</span>
                    <div className="text-base font-bold text-slate-900">
                      {selectedProduct.specificIndirectSEE} <span className="text-xs font-normal">t/t</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Grid electricity + renewable PPA credit</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                    <span className="text-slate-500 font-medium">Embedded Precursor Materials</span>
                    <div className="text-base font-bold text-slate-900">
                      {selectedProduct.specificPrecursorSEE} <span className="text-xs font-normal">t/t</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Upstream ferro-alloys & scrap factor</span>
                  </div>
                </div>
              </div>

              {/* Technical Route & Connected Buyers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold font-display text-slate-900">
                    Production Route & Installation
                  </h3>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500">Production Route:</span>
                      <strong className="text-slate-900">{selectedProduct.productionRoute}</strong>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500">Installation Facility:</span>
                      <strong className="text-slate-900">{selectedProduct.installationName}</strong>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500">UN/LOCODE / Code:</span>
                      <strong className="text-slate-900">{selectedProduct.installationCode}</strong>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500">Good Classification:</span>
                      <strong className="text-slate-900">
                        {selectedProduct.isSimpleGood ? 'Simple Good' : 'Complex Good (Precursors)'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold font-display text-slate-900">
                    Connected EU Buyers Importing This Good
                  </h3>
                  <div className="space-y-2 text-xs">
                    {selectedProduct.connectedBuyerNames.map((bName) => (
                      <div
                        key={bName}
                        className="p-3 bg-slate-50 rounded-xl flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800">{bName}</span>
                        <button
                          type="button"
                          onClick={() => onNavigateStep && onNavigateStep('step_3_buyers')}
                          className="text-emerald-700 hover:underline font-bold text-[11px]"
                        >
                          View Buyer
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTION DATA (EMISSIONS DATA ENTRY SCOPED TO THIS PRODUCT) */}
          {detailTab === 'production_data' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold font-display text-slate-900">
                    Quarterly Production Data & Telemetry
                  </h3>
                  <p className="text-xs text-slate-500">
                    Input actual production volumes and utility consumption to compute verified direct and indirect emissions.
                  </p>
                </div>

                {/* Period Selector Tabs & Bulk Import */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBulkImportOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Import Spreadsheet/ERP</span>
                  </button>

                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
                    {selectedProduct.periodsData.map((pd, idx) => (
                      <button
                        key={pd.period}
                        type="button"
                        onClick={() => setActivePeriodIndex(idx)}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                          activePeriodIndex === idx
                            ? 'bg-white text-slate-900 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {pd.quarterLabel}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Form for Selected Period */}
              {selectedProduct.periodsData[activePeriodIndex] && (
                <div className="space-y-6">
                  {/* Actual Data vs Default Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                    <div>
                      <span className="font-bold text-slate-800">Emissions Methodology</span>
                      <p className="text-slate-500 text-[11px]">
                        Using verified actual plant data saves certificate costs vs EU transitional default values.
                      </p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProduct.periodsData[activePeriodIndex].usesActualData}
                        onChange={(e) => handleUpdateTelemetry('usesActualData', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                      />
                      <span className="font-bold text-slate-700">Use Actual Plant Telemetry</span>
                    </label>
                  </div>

                  {/* Input Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Quantity Produced (t)
                      </label>
                      <input
                        type="number"
                        value={selectedProduct.periodsData[activePeriodIndex].quantityProducedT}
                        onChange={(e) =>
                          handleUpdateTelemetry('quantityProducedT', Number(e.target.value))
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Electricity Consumed (MWh)
                      </label>
                      <input
                        type="number"
                        value={selectedProduct.periodsData[activePeriodIndex].electricityConsumedMwh}
                        onChange={(e) =>
                          handleUpdateTelemetry('electricityConsumedMwh', Number(e.target.value))
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Natural Gas (Nm³)
                      </label>
                      <input
                        type="number"
                        value={selectedProduct.periodsData[activePeriodIndex].naturalGasNm3}
                        onChange={(e) =>
                          handleUpdateTelemetry('naturalGasNm3', Number(e.target.value))
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Light Fuel Oil (t)
                      </label>
                      <input
                        type="number"
                        value={selectedProduct.periodsData[activePeriodIndex].lightFuelOilT}
                        onChange={(e) =>
                          handleUpdateTelemetry('lightFuelOilT', Number(e.target.value))
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Computed Results Banner */}
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider block">
                        Live Computed Specific Embedded Emissions
                      </span>
                      <div className="flex items-center gap-4 mt-1 font-mono font-bold text-slate-900">
                        <span>
                          Direct: {selectedProduct.periodsData[activePeriodIndex].directSEE} tCO₂e/t
                        </span>
                        <span>·</span>
                        <span>
                          Indirect: {selectedProduct.periodsData[activePeriodIndex].indirectSEE} tCO₂e/t
                        </span>
                        <span>·</span>
                        <span className="text-emerald-700">
                          Total: {selectedProduct.periodsData[activePeriodIndex].totalSEE} tCO₂e/t
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveProductionData}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
                    >
                      Save Production Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DOCUMENTS (VERIFICATION VAULT SCOPED TO THIS PRODUCT) */}
          {detailTab === 'documents' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold font-display text-slate-900">
                    Supporting Documents & Audit Trail
                  </h3>
                  <p className="text-xs text-slate-500">
                    Accredited third-party verification statements, laboratory assays, and 5-year statutory retention records.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVerifierModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Assign Verifier</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleUploadDocument}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Supporting Document</span>
                  </button>
                </div>
              </div>

              {/* Documents List */}
              {(!documentsMap[selectedProduct.id] || documentsMap[selectedProduct.id].length === 0) ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No documents uploaded yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Upload accredited third-party verification opinions, stack CEMS reports, or gas assays for this product.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
                  {documentsMap[selectedProduct.id].map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900">{doc.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            <span className="font-medium text-slate-700">{doc.docTypeLabel}</span>
                            <span>·</span>
                            <span>{doc.verifierName}</span>
                            <span>·</span>
                            <span>Valid to {doc.validUntil}</span>
                            <span>·</span>
                            <span className="font-mono text-slate-400">
                              SHA: {doc.sha256Hash.substring(0, 10)}...
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 pl-12 sm:pl-0">
                        <span className="text-[11px] font-semibold text-slate-500">
                          {doc.retentionYearsRemaining} yrs retention left
                        </span>
                        <button
                          type="button"
                          onClick={() => triggerToast(`Downloading ${doc.downloadFileName}...`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ------------------------------------------------------------------- */
        /* SIMPLIFIED PRODUCTS LIST SCREEN: JUST A CLEAN TABLE                 */
        /* ------------------------------------------------------------------- */
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <h1 className="text-xl font-bold font-display text-slate-900 tracking-tight">
                Products & Production Routes
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Classified goods exported to the EU. Click any row to view overview, production telemetry, and audit documents.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCnRefOpen(!isCnRefOpen)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>CN Reference Guide</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddProductOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* CN Code Reference Drawer / Panel */}
          {isCnRefOpen && (
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Official CBAM Scope — Combined Nomenclature (CN) Code Ranges
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCnRefOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {CN_CODE_REFERENCE_RANGES.map((cn) => (
                  <div key={cn.range} className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-400 text-xs">{cn.range}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">{cn.sector}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{cn.desc}</p>
                    <div className="text-[10px] text-slate-400 pt-1">
                      EU Benchmark: <strong className="text-slate-200">{cn.defaultSEE}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products or CN code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1 text-xs overflow-x-auto">
              {[
                { id: 'all', label: 'All Sectors' },
                { id: 'iron_steel', label: 'Iron & Steel' },
                { id: 'aluminium', label: 'Aluminium' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSectorFilter(s.id)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    sectorFilter === s.id
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Simple Clean Table: Name, CN Code, Sector, Compliance Status */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[600px]">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">Product Name & SKU</th>
                    <th className="py-3 px-3">CN Code</th>
                    <th className="py-3 px-3">Sector</th>
                    <th className="py-3 px-3 text-right">Specific SEE</th>
                    <th className="py-3 px-4 text-center">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((prod) => (
                    <tr
                      key={prod.id}
                      onClick={() => {
                        setSelectedProduct(prod);
                        setDetailTab('overview');
                      }}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {prod.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {prod.sku}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 text-xs">
                          {prod.cnCode}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-700 font-medium">
                        {prod.sectorLabel}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {prod.totalEmbeddedSEE.toFixed(3)} t/t
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            prod.complianceStatus === 'compliant'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : prod.complianceStatus === 'warning'
                              ? 'bg-amber-50 border-amber-200 text-amber-800'
                              : 'bg-red-50 border-red-200 text-red-800'
                          }`}
                        >
                          {prod.complianceStatus === 'compliant' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          <span>
                            {prod.complianceStatus === 'compliant'
                              ? 'Compliant'
                              : prod.complianceStatus === 'warning'
                              ? 'Provisional'
                              : 'Incomplete'}
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* BULK IMPORT FROM SPREADSHEET / ERP MODAL (TAB 2)                    */}
      {/* ------------------------------------------------------------------- */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsBulkImportOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl z-10 border border-slate-200 space-y-5 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm font-display">
                  Bulk Telemetry Import (CSV / Excel / ERP)
                </h3>
              </div>
              <button type="button" onClick={() => setIsBulkImportOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-2 hover:border-emerald-400 transition-colors bg-slate-50/50">
              <FileUp className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-bold text-slate-800">Drop your production CSV or Excel sheet here</div>
              <div className="text-[11px] text-slate-500">Supports SAP S/4HANA, Oracle ERP, or custom SCADA extracts</div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-slate-800">Automatic Column Mapping Detected:</div>
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>Column A: <span className="font-mono text-emerald-700 font-bold">Production (t)</span></div>
                <div>Column B: <span className="font-mono text-emerald-700 font-bold">Electricity (MWh)</span></div>
                <div>Column C: <span className="font-mono text-emerald-700 font-bold">Natural Gas (Nm³)</span></div>
                <div>Column D: <span className="font-mono text-emerald-700 font-bold">Fuel Oil (t)</span></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkImportOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkImportConfirm}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-2xs"
              >
                Apply Telemetry to Q3 2026
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* VERIFIER ASSIGNMENT MODAL (TAB 3)                                   */}
      {/* ------------------------------------------------------------------- */}
      {isVerifierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsVerifierModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-10 border border-slate-200 space-y-5 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm font-display">
                  Assign Independent CBAM Verifier
                </h3>
              </div>
              <button type="button" onClick={() => setIsVerifierModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block font-bold text-slate-700">Select Accredited Verification Body</label>
              {[
                { name: 'TÜV SÜD Industrie Service GmbH', id: 'TUV-SUD', acc: 'DAkkS (Germany) / ISO 14065' },
                { name: 'Bureau Veritas Certification France', id: 'BV-FR', acc: 'COFRAC / ISO 14065' },
                { name: 'DNV GL Business Assurance', id: 'DNV', acc: 'RvA (Netherlands) / ISO 14065' },
              ].map((v) => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVerifier(v.name)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedVerifier === v.name
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-slate-900">{v.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Accreditation: {v.acc}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsVerifierModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestVerification}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-2xs"
              >
                Dispatch Audit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
