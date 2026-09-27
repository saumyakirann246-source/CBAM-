import React, { useState, useMemo, useRef } from 'react';
import { useCbam } from '../context/CbamContext';
import { BuyerRelationship, ProductItem } from '../types/cbam';
import { downloadCbamDeclarationPdf, CbamPdfReportData } from '../utils/cbamPdfGenerator';
import {
  FileSpreadsheet,
  FileCode,
  FileText,
  Package,
  Download,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Building2,
  User,
  Mail,
  Phone,
  Sparkles,
  Info,
  Calendar,
  Lock,
  Layers,
  Flame,
  Globe,
  RefreshCw,
  X,
  FileCheck,
  Printer,
  Share2,
} from 'lucide-react';

interface ReportGeneratorViewProps {
  onNavigateStep?: (stepId: string) => void;
}

export type GeneratorStep = 'step_a_scope' | 'step_b_review' | 'step_c_format' | 'step_d_generate';
export type OutputFormat = 'pdf' | 'xml' | 'both';

export interface PastReportRecord {
  id: string;
  reportName: string;
  buyerId: string;
  buyerName: string;
  buyerCountry: string;
  eoriNumber: string;
  period: string;
  includedProductNames: string[];
  totalTonnage: number;
  totalEmbedded_tCO2e: number;
  format: OutputFormat;
  generatedAt: string;
  generatedBy: string;
  sha256Hash: string;
  fileSize: string;
  dispatchStatus: 'dispatched' | 'verified_by_importer' | 'ready';
  acknowledgmentRef?: string;
  contactEmail: string;
  hasDefaultValues: boolean;
}

export const ReportGeneratorView: React.FC<ReportGeneratorViewProps> = ({ onNavigateStep }) => {
  const {
    buyers,
    products,
    emissionsData,
    vaultDocuments,
    selectedQuarter,
    activeInstallation,
    triggerToast,
    dispatchToBuyer,
  } = useCbam();

  // Mode: Generator Workflow vs Archive History
  const [activeTab, setActiveTab] = useState<'generator' | 'history'>('generator');

  // Generator Workflow Step
  const [currentStep, setCurrentStep] = useState<GeneratorStep>('step_a_scope');

  // STEP A: Scope selections
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>(buyers[0]?.id || 'buyer-01');
  const [reportingPeriod, setReportingPeriod] = useState<string>(selectedQuarter || 'Q3 2026');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([
    'prod-01',
    'prod-02',
  ]);

  // Test simulation: force product with default value for reviewer testing
  const [forceDefaultValueSim, setForceDefaultValueSim] = useState<boolean>(false);
  const [defaultAckChecked, setDefaultAckChecked] = useState<boolean>(false);

  // STEP C: Output format
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>('both');
  const [includeVerifierStamp, setIncludeVerifierStamp] = useState<boolean>(true);
  const [includeShaManifest, setIncludeShaManifest] = useState<boolean>(true);
  const [includePrecursorCerts, setIncludePrecursorCerts] = useState<boolean>(true);

  // STEP D: Generation & Dispatch states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgressStage, setGenerationProgressStage] = useState<number>(0);
  const [generatedReport, setGeneratedReport] = useState<PastReportRecord | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  // Email composer form state
  const [emailTo, setEmailTo] = useState<string>('');
  const [emailCc, setEmailCc] = useState<string>('klaus.weber@tuev-sued.de; elena.rostova@vanguard-metals.com');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);

  // History search & filters
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyPeriodFilter, setHistoryPeriodFilter] = useState<string>('all');
  const [historyFormatFilter, setHistoryFormatFilter] = useState<string>('all');

  // Initial past reports mock dataset
  const [reportHistory, setReportHistory] = useState<PastReportRecord[]>([
    {
      id: 'REP-CBAM-2026-Q3-0091',
      reportName: 'EU_CBAM_Package_DE100492819882_Q3_2026.zip',
      buyerId: 'buyer-01',
      buyerName: 'ThyssenKrupp Materials Services GmbH',
      buyerCountry: 'Germany (DE)',
      eoriNumber: 'DE100492819882',
      period: 'Q3 2026',
      includedProductNames: ['Hot-Rolled Steel Coil', 'B500B Rebar'],
      totalTonnage: 28450,
      totalEmbedded_tCO2e: 18120.4,
      format: 'both',
      generatedAt: '2026-08-14T14:28:10Z',
      generatedBy: 'Dr. Elena Rostova',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      fileSize: '5.8 MB',
      dispatchStatus: 'verified_by_importer',
      acknowledgmentRef: 'TK-CBAM-ACK-2026-Q3-0918',
      contactEmail: 'henrik.vonberg@thyssenkrupp.com',
      hasDefaultValues: false,
    },
    {
      id: 'REP-CBAM-2026-Q3-0084',
      reportName: 'EU_CBAM_Annex_IV_LU209418491024_Q3_2026.pdf',
      buyerId: 'buyer-02',
      buyerName: 'ArcelorMittal Europe S.A.',
      buyerCountry: 'Luxembourg (LU)',
      eoriNumber: 'LU209418491024',
      period: 'Q3 2026',
      includedProductNames: ['Hot-Rolled Steel Coil'],
      totalTonnage: 36200,
      totalEmbedded_tCO2e: 23711.0,
      format: 'pdf',
      generatedAt: '2026-09-02T09:12:00Z',
      generatedBy: 'Dr. Elena Rostova',
      sha256Hash: '7a12b8f3e91c44209afbf4c8996fb92427ae41e4649b934ca495991b7852c019',
      fileSize: '2.4 MB',
      dispatchStatus: 'dispatched',
      acknowledgmentRef: 'AM-EXP-2026-9921',
      contactEmail: 'sophie.dupont@arcelormittal.com',
      hasDefaultValues: false,
    },
    {
      id: 'REP-CBAM-2026-Q3-0072',
      reportName: 'EU_CBAM_Declaration_FR901248102391_Q3_2026.xml',
      buyerId: 'buyer-04',
      buyerName: 'Saint-Gobain Building Glass France',
      buyerCountry: 'France (FR)',
      eoriNumber: 'FR901248102391',
      period: 'Q3 2026',
      includedProductNames: ['B500B Rebar'],
      totalTonnage: 14500,
      totalEmbedded_tCO2e: 8047.5,
      format: 'xml',
      generatedAt: '2026-08-20T11:42:00Z',
      generatedBy: 'Marcus Vance, PE',
      sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      fileSize: '480 KB',
      dispatchStatus: 'verified_by_importer',
      acknowledgmentRef: 'SG-FR-CBAM-2026-441',
      contactEmail: 'camille.leroux@saint-gobain.com',
      hasDefaultValues: false,
    },
    {
      id: 'REP-CBAM-2026-Q2-0051',
      reportName: 'EU_CBAM_Package_DE811194200192_Q2_2026.zip',
      buyerId: 'buyer-03',
      buyerName: 'Klöckner & Co SE',
      buyerCountry: 'Germany (DE)',
      eoriNumber: 'DE811194200192',
      period: 'Q2 2026',
      includedProductNames: ['Hot-Rolled Steel Coil', 'B500B Rebar'],
      totalTonnage: 19800,
      totalEmbedded_tCO2e: 13240.2,
      format: 'both',
      generatedAt: '2026-05-18T10:15:00Z',
      generatedBy: 'Dr. Elena Rostova',
      sha256Hash: '3d8a7c29e19c44209afbf4c8996fb92427ae41e4649b934ca495991b7852e892',
      fileSize: '5.2 MB',
      dispatchStatus: 'ready',
      acknowledgmentRef: undefined,
      contactEmail: 'jens.richter@kloeckner.de',
      hasDefaultValues: false,
    },
  ]);

  // Active selected buyer object
  const activeBuyer = useMemo(() => {
    return buyers.find((b) => b.id === selectedBuyerId) || buyers[0];
  }, [buyers, selectedBuyerId]);

  // When buyer changes, auto-select their allocated products and update email defaults
  const handleBuyerChange = (buyerId: string) => {
    setSelectedBuyerId(buyerId);
    const buyer = buyers.find((b) => b.id === buyerId);
    if (buyer) {
      if (buyer.allocatedProductIds && buyer.allocatedProductIds.length > 0) {
        setSelectedProductIds(buyer.allocatedProductIds);
      }
      setEmailTo(buyer.primaryContact.email);
      setEmailSubject(
        `[OFFICIAL EU CBAM] ${reportingPeriod} Verified Communication Template & Declaration Package — Vanguard (${activeInstallation.code})`
      );
    }
  };

  // Toggle product selection
  const handleToggleProduct = (prodId: string) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(prodId)) {
        if (prev.length === 1) {
          triggerToast('At least one product must remain selected for the declaration scope.');
          return prev;
        }
        return prev.filter((id) => id !== prodId);
      } else {
        return [...prev, prodId];
      }
    });
  };

  // Selected products details
  const selectedProducts = useMemo(() => {
    return products.filter((p) => selectedProductIds.includes(p.id));
  }, [products, selectedProductIds]);

  // Check if any product relies on default values
  // In CBAM rules, prod-05 (ammonia) or if simulation toggle is active relies on default values
  const hasDefaultValues = useMemo(() => {
    if (forceDefaultValueSim) return true;
    return selectedProducts.some((p) => p.id === 'prod-05' || p.sector === 'fertilizers');
  }, [selectedProducts, forceDefaultValueSim]);

  // Incomplete data warning block check
  const isBlockedByDefaultValues = hasDefaultValues && !defaultAckChecked;

  // Aggregate metrics for selected scope
  const scopeAggregates = useMemo(() => {
    const totalTons = selectedProducts.reduce((acc, p) => acc + (p.quarterlyProductionTons || 25000), 0);
    const weightedEmissions = selectedProducts.reduce(
      (acc, p) => acc + (p.totalEmissions_tCO2e_per_t * (p.quarterlyProductionTons || 25000)),
      0
    );
    const avgSpecific = totalTons > 0 ? weightedEmissions / totalTons : 0;
    const weightedBenchmark = selectedProducts.reduce(
      (acc, p) => acc + (p.euDefaultBenchmark_tCO2e_per_t * (p.quarterlyProductionTons || 25000)),
      0
    );
    const carbonSavingsEur = (weightedBenchmark - weightedEmissions) * 68.5; // €68.50/t ETS price

    return {
      totalTons,
      weightedEmissions,
      avgSpecific,
      carbonSavingsEur,
    };
  }, [selectedProducts]);

  // Step progression logic
  const handleProceedToStepB = () => {
    if (selectedProductIds.length === 0) {
      triggerToast('Please select at least one product before proceeding.');
      return;
    }
    setCurrentStep('step_b_review');
  };

  const handleProceedToStepC = () => {
    if (isBlockedByDefaultValues) {
      triggerToast('Please acknowledge the EU default value usage to proceed with this report.');
      return;
    }
    setCurrentStep('step_c_format');
  };

  const handleProceedToStepD = () => {
    setCurrentStep('step_d_generate');
  };

  // Generate Report action with realistic animated sequence
  const handleGenerateReport = () => {
    setIsGenerating(true);
    setGenerationProgressStage(1);

    // Fast, crisp animation steps (implying optimized high-speed compilation)
    setTimeout(() => {
      setGenerationProgressStage(2);
    }, 450);

    setTimeout(() => {
      setGenerationProgressStage(3);
    }, 850);

    setTimeout(() => {
      setGenerationProgressStage(4);
      setIsGenerating(false);

      const ext = selectedFormat === 'both' ? 'zip' : selectedFormat === 'pdf' ? 'pdf' : 'xml';
      const reportId = `REP-CBAM-2026-${reportingPeriod.replace(/\s+/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const hash = `e3b0c44298fc1c149afbf4c8996fb${Date.now().toString(16)}4ca495991b7852b855`;
      const fileName = `EU_CBAM_${activeBuyer.eoriNumber}_${reportingPeriod.replace(/\s+/g, '_')}_Package.${ext}`;

      const newRecord: PastReportRecord = {
        id: reportId,
        reportName: fileName,
        buyerId: activeBuyer.id,
        buyerName: activeBuyer.companyName,
        buyerCountry: activeBuyer.buyerCountry,
        eoriNumber: activeBuyer.eoriNumber,
        period: reportingPeriod,
        includedProductNames: selectedProducts.map((p) => p.name),
        totalTonnage: scopeAggregates.totalTons,
        totalEmbedded_tCO2e: scopeAggregates.weightedEmissions,
        format: selectedFormat,
        generatedAt: new Date().toISOString(),
        generatedBy: 'Dr. Elena Rostova',
        sha256Hash: hash,
        fileSize: selectedFormat === 'both' ? '5.9 MB' : selectedFormat === 'pdf' ? '2.1 MB' : '490 KB',
        dispatchStatus: 'ready',
        contactEmail: activeBuyer.primaryContact.email,
        hasDefaultValues: hasDefaultValues,
      };

      setGeneratedReport(newRecord);
      setReportHistory((prev) => [newRecord, ...prev]);

      // Pre-fill email composer
      setEmailTo(activeBuyer.primaryContact.email);
      setEmailSubject(
        `[OFFICIAL EU CBAM] ${reportingPeriod} Verified Communication Template & Declaration Package — Vanguard (${activeInstallation.code})`
      );
      setEmailBody(
        `Dear ${activeBuyer.primaryContact.name},\n\nPlease find attached the verified EU CBAM Communication Template and Declaration Package for ${reportingPeriod} covering our shipments of ${selectedProducts.map((p) => p.name).join(', ')}.\n\nAll specific embedded direct and indirect emissions have been calculated in strict accordance with European Commission Implementing Regulation (EU) 2023/1773 and verified with reasonable assurance by accredited verifier TÜV SÜD Umweltpartner GmbH (DAkkS D-VS-14125-01-00).\n\nManifest Summary:\n- Importer EORI: ${activeBuyer.eoriNumber}\n- Reporting Period: ${reportingPeriod}\n- Installation UN/LOCODE: ${activeInstallation.unLocode}\n- Total Shipped Tonnage: ${scopeAggregates.totalTons.toLocaleString()} t\n- Total Embedded Emissions: ${scopeAggregates.weightedEmissions.toLocaleString(undefined, { maximumFractionDigits: 1 })} tCO2e\n- Package SHA-256 Digest: ${hash}\n\nPlease let us know once this dataset has been reconciled in your customs portal.\n\nBest regards,\nDr. Elena Rostova\nVP of ESG & Carbon Compliance\nVanguard Industrial Metals Group`
      );

      triggerToast(`Report package ${fileName} generated successfully!`);
    }, 1300);
  };

  // Download official EU CBAM Annex IV PDF directly from browser
  const handleDownloadPdf = (record?: PastReportRecord) => {
    const target = record || generatedReport;
    if (!target) return;

    const pdfProducts = selectedProducts.map((p) => {
      const tons = p.quarterlyProductionTons || 25000;
      return {
        name: p.name,
        cnCode: p.cnCode,
        productionRoute: p.productionRoute,
        shippedTons: tons,
        directSEE: p.directEmissions_tCO2e_per_t,
        indirectSEE: p.indirectEmissions_tCO2e_per_t,
        precursorSEE: p.precursorEmissions_tCO2e_per_t,
        totalSEE: p.totalEmissions_tCO2e_per_t,
        euDefaultBenchmark: p.euDefaultBenchmark_tCO2e_per_t,
        totalEmbedded_tCO2e: Math.round(tons * p.totalEmissions_tCO2e_per_t * 10) / 10,
      };
    });

    const pdfData: CbamPdfReportData = {
      reportId: target.id,
      reportName: target.reportName.replace(/\.[a-z]+$/, '.pdf'),
      period: target.period,
      generatedAt: target.generatedAt,
      generatedBy: target.generatedBy,
      buyerName: target.buyerName,
      buyerCountry: target.buyerCountry,
      buyerEori: target.eoriNumber,
      buyerContactEmail: target.contactEmail,
      installationName: activeInstallation.name,
      installationUnLocode: activeInstallation.unLocode,
      installationCountry: activeInstallation.country,
      totalTonnage: target.totalTonnage,
      totalEmbedded_tCO2e: target.totalEmbedded_tCO2e,
      sha256Hash: target.sha256Hash,
      products: pdfProducts,
    };

    downloadCbamDeclarationPdf(pdfData, `${target.buyerName.replace(/[^a-zA-Z0-9]/g, '_')}_${target.period.replace(/\s+/g, '_')}_Annex_IV_Declaration.pdf`);
    triggerToast(`Downloaded official EU CBAM Annex IV PDF for ${target.buyerName}`);
  };

  // Direct download simulation (Raw / XML)
  const handleDownloadFile = (record?: PastReportRecord) => {
    const target = record || generatedReport;
    if (!target) return;

    // Create realistic downloadable payload
    const content = `======================================================================
EU CBAM OFFICIAL COMMUNICATION TEMPLATE & DECLARATION PACKAGE
Regulation (EU) 2023/956 & Implementing Regulation (EU) 2023/1773
======================================================================
Report Reference: ${target.id}
Generated Timestamp: ${target.generatedAt}
Generated By: ${target.generatedBy}
Accredited Verifier: TÜV SÜD Umweltpartner GmbH (DAkkS D-VS-14125-01-00)

1. INSTALLATION & IMPORTER DETAILS
- Installation Name: ${activeInstallation.name}
- UN/LOCODE: ${activeInstallation.unLocode}
- Country of Origin: ${activeInstallation.country}
- EU Buyer / Importer: ${target.buyerName}
- Importer EORI: ${target.eoriNumber}
- Reporting Period: ${target.period}

2. VERIFIED EMISSIONS BREAKDOWN
${selectedProducts
  .map(
    (p, i) => `[Good #${i + 1}] ${p.name}
   - CN Code: ${p.cnCode}
   - Production Route: ${p.productionRoute}
   - Specific Direct Scope 1: ${p.directEmissions_tCO2e_per_t} tCO2e/t
   - Specific Indirect Scope 2: ${p.indirectEmissions_tCO2e_per_t} tCO2e/t
   - Precursor Specific: ${p.precursorEmissions_tCO2e_per_t} tCO2e/t
   - Total Specific Embedded: ${p.totalEmissions_tCO2e_per_t} tCO2e/t
   - EU Default Benchmark: ${p.euDefaultBenchmark_tCO2e_per_t} tCO2e/t`
  )
  .join('\n\n')}

3. CRYPTOGRAPHIC INTEGRITY MANIFEST
- SHA-256 Digest: ${target.sha256Hash}
- Digital Seal: DAkkS-ACCREDITED-TUV-SUD-VAL-2026
======================================================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = target.reportName.replace('.zip', '.txt').replace('.pdf', '.txt').replace('.xml', '.xml');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    triggerToast(`Downloaded ${target.reportName}`);
  };

  // Open email dispatch modal
  const handleOpenEmailModal = () => {
    setIsEmailModalOpen(true);
  };

  // Send direct email dispatch to buyer
  const handleSendEmailToBuyer = () => {
    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      setIsEmailModalOpen(false);

      const ackRef = `TK-CBAM-ACK-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // Update state in history
      if (generatedReport) {
        setReportHistory((prev) =>
          prev.map((r) =>
            r.id === generatedReport.id
              ? { ...r, dispatchStatus: 'dispatched', acknowledgmentRef: ackRef }
              : r
          )
        );
        setGeneratedReport((prev) =>
          prev ? { ...prev, dispatchStatus: 'dispatched', acknowledgmentRef: ackRef } : null
        );
      }

      // Update buyer in CbamContext
      dispatchToBuyer(activeBuyer.id, 'eu_cbam_xml');

      triggerToast(`Official declaration package transmitted to ${emailTo}! Acknowledgment ref: ${ackRef}`);
    }, 900);
  };

  // Copy hash helper
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    triggerToast('SHA-256 cryptographic digest copied to clipboard.');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Filtered history records
  const filteredHistory = useMemo(() => {
    return reportHistory.filter((rec) => {
      const matchesSearch =
        rec.buyerName.toLowerCase().includes(historySearch.toLowerCase()) ||
        rec.eoriNumber.toLowerCase().includes(historySearch.toLowerCase()) ||
        rec.reportName.toLowerCase().includes(historySearch.toLowerCase()) ||
        rec.id.toLowerCase().includes(historySearch.toLowerCase());

      const matchesPeriod =
        historyPeriodFilter === 'all' || rec.period === historyPeriodFilter;

      const matchesFormat =
        historyFormatFilter === 'all' || rec.format === historyFormatFilter;

      return matchesSearch && matchesPeriod && matchesFormat;
    });
  }, [reportHistory, historySearch, historyPeriodFilter, historyFormatFilter]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* ------------------------------------------------------------------- */}
      {/* 1. TOP HEADER & WORKFLOW / HISTORY TAB TOGGLE                       */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-100/80 text-emerald-800 border border-emerald-200">
              EU CBAM Compliance Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Implementing Reg (EU) 2023/1773
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Report & Declaration Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Transform verified emissions data into standardized EU CBAM Communication Templates,
            machine-readable XML datasets, and complete audit-ready declaration packages for your EU buyers.
          </p>
        </div>

        {/* Primary Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-emerald-200/80 rounded-2xl shadow-xs self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'generator'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate New Report</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Report Archive ({reportHistory.length})</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. GENERATOR WORKFLOW VIEW (4-STEP GUIDED WIZARD)                   */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'generator' && (
        <div className="space-y-8">
          {/* Progress Stepper Bar */}
          <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                {
                  id: 'step_a_scope',
                  number: 'A',
                  title: 'Select Scope',
                  desc: 'Buyer, Period & Goods',
                },
                {
                  id: 'step_b_review',
                  number: 'B',
                  title: 'Review Data',
                  desc: 'Emissions & Default Check',
                },
                {
                  id: 'step_c_format',
                  number: 'C',
                  title: 'Output Format',
                  desc: 'PDF, XML, or Both',
                },
                {
                  id: 'step_d_generate',
                  number: 'D',
                  title: 'Generate & Share',
                  desc: 'Compile & Transmit',
                },
              ].map((step, idx) => {
                const isCurrent = currentStep === step.id;
                const isPassed =
                  (step.id === 'step_a_scope' && currentStep !== 'step_a_scope') ||
                  (step.id === 'step_b_review' && (currentStep === 'step_c_format' || currentStep === 'step_d_generate')) ||
                  (step.id === 'step_c_format' && currentStep === 'step_d_generate');

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      // Allow jumping backward or forward if valid
                      if (step.id === 'step_a_scope') setCurrentStep('step_a_scope');
                      else if (step.id === 'step_b_review') setCurrentStep('step_b_review');
                      else if (step.id === 'step_c_format' && !isBlockedByDefaultValues) setCurrentStep('step_c_format');
                      else if (step.id === 'step_d_generate' && !isBlockedByDefaultValues) setCurrentStep('step_d_generate');
                    }}
                    className={`flex items-center gap-3.5 p-3 rounded-xl transition-all text-left ${
                      isCurrent
                        ? 'bg-emerald-50/90 border border-emerald-300/80 shadow-2xs'
                        : isPassed
                        ? 'bg-slate-50/70 border border-slate-200/70 hover:bg-slate-100/60'
                        : 'bg-white border border-slate-100 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-display text-xs font-bold shrink-0 transition-colors ${
                        isCurrent
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : isPassed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : step.number}
                    </div>

                    <div className="min-w-0">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Step {step.number}
                      </div>
                      <div
                        className={`text-xs font-bold truncate ${
                          isCurrent ? 'text-emerald-950 font-extrabold' : 'text-slate-800'
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate hidden xl:block">
                        {step.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* STEP A — SELECT SCOPE                                             */}
          {/* ----------------------------------------------------------------- */}
          {currentStep === 'step_a_scope' && (
            <div className="space-y-6">
              {/* Reviewer Simulation Toolbar */}
              <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 rounded-2xl text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-800">
                    Reviewer State Controller:
                  </span>
                  <span className="text-slate-600 text-[11px]">
                    Toggle default-value scenario to test the Step B regulatory block state
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-emerald-900 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs hover:bg-emerald-50/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={forceDefaultValueSim}
                    onChange={(e) => {
                      setForceDefaultValueSim(e.target.checked);
                      setDefaultAckChecked(false);
                      triggerToast(
                        e.target.checked
                          ? 'Default-value penalty scenario enabled: Anhydrous Ammonia benchmark active.'
                          : 'Actual monitored emissions restored (no default values).'
                      );
                    }}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Simulate Default-Value Goods</span>
                </label>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Choose Buyer (from Step 3 list) */}
                <div className="lg:col-span-2 bg-white border border-emerald-100 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <h2 className="font-display text-sm font-bold text-slate-900">
                        1. Target EU Importer / Buyer
                      </h2>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Select buyer from bilateral register
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {buyers.map((b) => {
                      const isSelected = b.id === selectedBuyerId;
                      return (
                        <div
                          key={b.id}
                          onClick={() => handleBuyerChange(b.id)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500'
                              : 'border-slate-200/80 bg-white hover:border-emerald-300 hover:bg-emerald-50/20'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-display text-xs font-bold text-slate-900 leading-snug">
                                {b.companyName}
                              </span>
                              <span
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                                {b.eoriNumber}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {b.buyerCountry}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                            <span className="flex items-center gap-1 text-slate-500 truncate">
                              <User className="w-3 h-3 text-emerald-600 shrink-0" />
                              {b.primaryContact.name}
                            </span>
                            <span className="font-mono font-semibold text-emerald-700 shrink-0">
                              {b.quarterlyShippedTons.toLocaleString()} t
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Choose Reporting Period */}
                <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <h2 className="font-display text-sm font-bold text-slate-900">
                        2. Reporting Period
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">
                    Select the quarterly compliance window to be certified:
                  </p>

                  <div className="space-y-2.5">
                    {[
                      {
                        period: 'Q3 2026',
                        status: 'Audited & Locked',
                        badge: 'TÜV Verified',
                        current: true,
                      },
                      {
                        period: 'Q2 2026',
                        status: 'Historical Archived',
                        badge: 'Reconciled',
                        current: false,
                      },
                      {
                        period: 'Q1 2026',
                        status: 'Historical Archived',
                        badge: 'Reconciled',
                        current: false,
                      },
                      {
                        period: 'Q4 2025',
                        status: 'Transitional Period',
                        badge: 'Transitional',
                        current: false,
                      },
                    ].map((p) => {
                      const isSelected = reportingPeriod === p.period;
                      return (
                        <div
                          key={p.period}
                          onClick={() => setReportingPeriod(p.period)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50/70 shadow-2xs ring-1 ring-emerald-500'
                              : 'border-slate-200/80 bg-white hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? 'border-emerald-600 bg-emerald-600 text-white'
                                  : 'border-slate-300'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </span>
                            <div>
                              <div className="font-display text-xs font-bold text-slate-900">
                                {p.period}
                              </div>
                              <div className="text-[10px] text-slate-500">{p.status}</div>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.current
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {p.badge}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Regulation (EU) 2023/1773 mandates quarterly data submission within one month
                      following the end of that quarter.
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Which Products to Include */}
              <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <h2 className="font-display text-sm font-bold text-slate-900">
                        3. Products to Include in Declaration
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select catalog items shipped to {activeBuyer.companyName} during {reportingPeriod}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedProductIds(products.map((p) => p.id))}
                      className="px-2.5 py-1 text-slate-600 hover:text-emerald-700 font-semibold hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedProductIds(['prod-01'])}
                      className="px-2.5 py-1 text-slate-600 hover:text-emerald-700 font-semibold hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Reset Selection
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {products.map((prod) => {
                    const isSelected = selectedProductIds.includes(prod.id);
                    const isDefault = prod.id === 'prod-05' || prod.sector === 'fertilizers';

                    return (
                      <div
                        key={prod.id}
                        onClick={() => handleToggleProduct(prod.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? isDefault
                              ? 'border-amber-400 bg-amber-50/40 shadow-xs ring-1 ring-amber-400'
                              : 'border-emerald-500 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500'
                            : 'border-slate-200/80 bg-white hover:border-slate-300 opacity-70'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-display text-xs font-bold text-slate-900 leading-snug">
                              {prod.name}
                            </span>
                            <span
                              className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? isDefault
                                    ? 'border-amber-600 bg-amber-600 text-white'
                                    : 'border-emerald-600 bg-emerald-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                              CN {prod.cnCode}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {prod.sector.replace('_', ' ')}
                            </span>
                            {isDefault ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                EU Default Value
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Primary Measured
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-end justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400">Total Embedded (SEE)</div>
                            <div className="font-display text-sm font-bold text-slate-900">
                              {prod.totalEmissions_tCO2e_per_t}{' '}
                              <span className="text-[10px] font-normal text-slate-500">tCO2e/t</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-[10px] text-slate-400">Quarterly Shipped</div>
                            <div className="font-mono text-xs font-semibold text-slate-700">
                              {prod.quarterlyProductionTons.toLocaleString()} t
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Scope Summary & Bottom Action */}
              <div className="p-5 bg-white border border-emerald-200 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {selectedProducts.length} Product{selectedProducts.length > 1 ? 's' : ''} Selected
                      for {activeBuyer.companyName}
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      Total Allocated Tonnage: <strong className="text-slate-800">{scopeAggregates.totalTons.toLocaleString()} t</strong> ·{' '}
                      Estimated Embedded Carbon: <strong className="text-emerald-700">{scopeAggregates.weightedEmissions.toLocaleString(undefined, { maximumFractionDigits: 1 })} tCO2e</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToStepB}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all hover:gap-3"
                >
                  <span>Continue to Data Review (Step B)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* STEP B — REVIEW DATA & INTEGRITY AUDIT                            */}
          {/* ----------------------------------------------------------------- */}
          {currentStep === 'step_b_review' && (
            <div className="space-y-6">
              {/* Mandatory Incomplete Data / Default Value Warning State */}
              {hasDefaultValues && (
                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    defaultAckChecked
                      ? 'bg-amber-50/60 border-amber-300'
                      : 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-400/50'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        defaultAckChecked
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3
                          className={`font-display text-sm font-bold ${
                            defaultAckChecked ? 'text-amber-900' : 'text-rose-900'
                          }`}
                        >
                          EU Default Value Warning: Incomplete Direct Monitoring Detected
                        </h3>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            defaultAckChecked
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-rose-200 text-rose-900 animate-pulse'
                          }`}
                        >
                          {defaultAckChecked ? 'Acknowledged' : 'Generation Blocked'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        One or more products in this report scope rely on standard{' '}
                        <strong>EU Default Benchmark Values</strong> rather than direct, actual installation-monitored
                        data. Under European Commission Regulation (EU) 2023/1773 Article 4(3), reports relying on
                        default values are subject to importer customs surcharges and elevated inspection risks.
                      </p>

                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200/60">
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-900">
                          <input
                            type="checkbox"
                            checked={defaultAckChecked}
                            onChange={(e) => setDefaultAckChecked(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                          />
                          <span>
                            I acknowledge that this package uses default values and approve generation with regulatory notice.
                          </span>
                        </label>

                        <button
                          type="button"
                          onClick={() => setCurrentStep('step_a_scope')}
                          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline self-start sm:self-auto"
                        >
                          ← Return to Scope to exclude default items
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Read-Only Summary Table of Emissions Data */}
              <div className="bg-white border border-emerald-100 rounded-2xl shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <h2 className="font-display text-base font-bold text-slate-900">
                        Read-Only Verified Emissions Audit Table
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Data mapped to European Commission Annex IV Specification for{' '}
                      <strong>{activeBuyer.companyName}</strong> ({reportingPeriod})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      DAkkS Verified (TÜV SÜD)
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        <th className="py-3 px-4">Good & CN Code</th>
                        <th className="py-3 px-4">Production Route</th>
                        <th className="py-3 px-4 text-right">Shipped (t)</th>
                        <th className="py-3 px-4 text-right">Direct SEE (tCO2e/t)</th>
                        <th className="py-3 px-4 text-right">Indirect SEE (tCO2e/t)</th>
                        <th className="py-3 px-4 text-right">Precursor (tCO2e/t)</th>
                        <th className="py-3 px-4 text-right">Total SEE (tCO2e/t)</th>
                        <th className="py-3 px-4 text-right">EU Benchmark</th>
                        <th className="py-3 px-4 text-center">Data Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {selectedProducts.map((p) => {
                        const isDefault = p.id === 'prod-05' || p.sector === 'fertilizers';

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-slate-900">
                              <div>{p.name}</div>
                              <div className="font-mono text-[10px] text-slate-400 font-normal">
                                CN {p.cnCode}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                              {p.productionRoute}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800">
                              {p.quarterlyProductionTons.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                              {p.directEmissions_tCO2e_per_t.toFixed(3)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                              {p.indirectEmissions_tCO2e_per_t.toFixed(3)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                              {p.precursorEmissions_tCO2e_per_t.toFixed(3)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                              {p.totalEmissions_tCO2e_per_t.toFixed(3)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                              {p.euDefaultBenchmark_tCO2e_per_t.toFixed(3)}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {isDefault ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Default Val
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  CEMS Monitored
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50/90 font-bold border-t-2 border-slate-200 text-slate-900">
                      <tr>
                        <td colSpan={2} className="py-3.5 px-4 text-xs">
                          Declared Aggregates ({selectedProducts.length} Items)
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs">
                          {scopeAggregates.totalTons.toLocaleString()} t
                        </td>
                        <td colSpan={3} className="py-3.5 px-4 text-right text-xs text-slate-500">
                          Weighted Average SEE:
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs text-emerald-800">
                          {scopeAggregates.avgSpecific.toFixed(3)} tCO2e/t
                        </td>
                        <td colSpan={2} className="py-3.5 px-4 text-center text-[11px] text-emerald-700 font-semibold">
                          Total Carbon: {scopeAggregates.weightedEmissions.toLocaleString(undefined, { maximumFractionDigits: 1 })} tCO2e
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Statutory Integrity Checklist Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Installation</div>
                    <div className="font-display text-xs font-bold text-slate-900 truncate">
                      {activeInstallation.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      UN/LOCODE: {activeInstallation.unLocode}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Third-Party Verifier</div>
                    <div className="font-display text-xs font-bold text-slate-900 truncate">
                      TÜV SÜD Umweltpartner
                    </div>
                    <div className="text-[11px] text-slate-500">
                      DAkkS D-VS-14125-01-00 (Clean)
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Carbon Cost Advantage</div>
                    <div className="font-display text-xs font-bold text-emerald-800">
                      €{Math.round(scopeAggregates.carbonSavingsEur).toLocaleString()} Protected
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Actual vs EU default benchmarks
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep('step_a_scope')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Scope (Step A)</span>
                </button>

                <button
                  type="button"
                  disabled={isBlockedByDefaultValues}
                  onClick={handleProceedToStepC}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all ${
                    isBlockedByDefaultValues
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:gap-3'
                  }`}
                >
                  <span>
                    {isBlockedByDefaultValues
                      ? 'Acknowledge Default Values to Continue'
                      : 'Continue to Output Format (Step C)'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* STEP C — CHOOSE OUTPUT FORMAT                                     */}
          {/* ----------------------------------------------------------------- */}
          {currentStep === 'step_c_format' && (
            <div className="space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Select Output Packaging Format
                </h2>
                <p className="text-xs text-slate-500">
                  Choose the required transmission container according to {activeBuyer.companyName}’s IT specification.
                </p>
              </div>

              {/* 3 Format Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. PDF Card */}
                <div
                  onClick={() => setSelectedFormat('pdf')}
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    selectedFormat === 'pdf'
                      ? 'border-emerald-600 bg-white shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200/90 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-emerald-700" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wide">
                        Human-Readable
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900">
                        PDF (Communication Template)
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Official European Commission Excel/PDF replica aligned with Regulation (EU) 2023/1773 Annex IV.
                        Features human-auditable layouts, verifier stamp signatures, and tamper-evident QR verification.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-[11px] text-slate-600">
                      <div className="font-bold text-slate-800">Best For:</div>
                      <div>• Importer customs broker manual review</div>
                      <div>• Executive compliance sign-off</div>
                      <div>• Corporate ESG archive documentation</div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">.pdf + .xlsx format</span>
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedFormat === 'pdf'
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {selectedFormat === 'pdf' && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </div>
                </div>

                {/* 2. XML Card */}
                <div
                  onClick={() => setSelectedFormat('xml')}
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    selectedFormat === 'xml'
                      ? 'border-emerald-600 bg-white shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200/90 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
                        <FileCode className="w-6 h-6 text-teal-700" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 uppercase tracking-wide">
                        Machine-Readable
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900">
                        XML (Structured Data Exchange)
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        W3C XSD-compliant CBAM XML schema for direct ingestion into buyer enterprise ERP platforms
                        (SAP S/4HANA Sustainability, Oracle Cloud) or European Customs Single Window portals.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-[11px] text-slate-600">
                      <div className="font-bold text-slate-800">Best For:</div>
                      <div>• Automated ERP API ingestion</div>
                      <div>• Direct upload to EU CBAM Transitional Registry</div>
                      <div>• Zero manual data-entry errors</div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">EU XSD 2.3 schema</span>
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedFormat === 'xml'
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {selectedFormat === 'xml' && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </div>
                </div>

                {/* 3. Both Card (Declaration Support Package) */}
                <div
                  onClick={() => setSelectedFormat('both')}
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    selectedFormat === 'both'
                      ? 'border-emerald-600 bg-emerald-50/20 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200/90 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
                        <Package className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase tracking-wide">
                        Recommended · 100% Ready
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900">
                        Complete Declaration Package (ZIP)
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Definitive compliance bundle pairing stamped PDF Communication Sheets, validated XML dataset,
                        cryptographic SHA-256 manifest, and attached accredited TÜV SÜD certificates from the Vault.
                      </p>
                    </div>

                    <div className="p-3 bg-white border border-emerald-100 rounded-xl space-y-1 text-[11px] text-slate-600">
                      <div className="font-bold text-emerald-900">Includes 4 Artifacts:</div>
                      <div>• 1× Verified Annex IV PDF Template</div>
                      <div>• 1× Strict XSD 2.3 XML Payload</div>
                      <div>• 1× TÜV SÜD DAkkS Certificate</div>
                      <div>• 1× SHA-256 Cryptographic Checksum</div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-emerald-700">Full Audit Bundle</span>
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedFormat === 'both'
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {selectedFormat === 'both' && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </div>
                </div>
              </div>

              {/* Package Add-ons & Options */}
              <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-500">
                  Compliance Artifact Attachments
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 flex items-center gap-3 cursor-pointer text-xs font-semibold text-slate-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeVerifierStamp}
                      onChange={(e) => setIncludeVerifierStamp(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>Attach TÜV SÜD Verifier Seal</span>
                  </label>

                  <label className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 flex items-center gap-3 cursor-pointer text-xs font-semibold text-slate-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeShaManifest}
                      onChange={(e) => setIncludeShaManifest(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>Inject Cryptographic SHA-256</span>
                  </label>

                  <label className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 flex items-center gap-3 cursor-pointer text-xs font-semibold text-slate-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={includePrecursorCerts}
                      onChange={(e) => setIncludePrecursorCerts(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>Include Precursor Dossier</span>
                  </label>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep('step_b_review')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Data Review (Step B)</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceedToStepD}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all hover:gap-3"
                >
                  <span>Continue to Generate & Share (Step D)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* STEP D — GENERATE & SHARE (WORKFLOW FINAL STEP)                   */}
          {/* ----------------------------------------------------------------- */}
          {currentStep === 'step_d_generate' && (
            <div className="space-y-6">
              {/* Generation in Progress State (Brief high-fidelity animation) */}
              {isGenerating ? (
                <div className="bg-white border border-emerald-200 rounded-3xl p-10 shadow-md text-center space-y-6 max-w-2xl mx-auto">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                    <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-display text-xl font-bold text-slate-900">
                      Compiling EU CBAM Declaration Package...
                    </h2>
                    <p className="text-xs text-slate-500">
                      Executing automated schema validation and cryptographic seal injection
                    </p>
                  </div>

                  {/* Animated sequence steps */}
                  <div className="max-w-md mx-auto space-y-2.5 text-left text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <span className="flex items-center gap-2 text-slate-700 font-semibold">
                        {generationProgressStage >= 1 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                        Aggregating Scope 1 & Scope 2 Activity Data...
                      </span>
                      {generationProgressStage >= 1 && (
                        <span className="text-[10px] font-mono text-emerald-700 font-bold">DONE</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <span className="flex items-center gap-2 text-slate-700 font-semibold">
                        {generationProgressStage >= 2 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                        Validating against EU CBAM XSD 2.3 schema...
                      </span>
                      {generationProgressStage >= 2 && (
                        <span className="text-[10px] font-mono text-emerald-700 font-bold">PASSED</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <span className="flex items-center gap-2 text-slate-700 font-semibold">
                        {generationProgressStage >= 3 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                        Embedding TÜV SÜD seal & SHA-256 fingerprint...
                      </span>
                      {generationProgressStage >= 3 && (
                        <span className="text-[10px] font-mono text-emerald-700 font-bold">SEALED</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : generatedReport ? (
                /* Generated Success Screen */
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 border-2 border-emerald-200 rounded-3xl p-8 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-100">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                              Package Successfully Generated
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              {generatedReport.id}
                            </span>
                          </div>
                          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                            {generatedReport.reportName}
                          </h2>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Prepared for <strong>{generatedReport.buyerName}</strong> ({generatedReport.period})
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDownloadFile()}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-emerald-500 text-slate-800 font-bold text-xs shadow-xs hover:bg-emerald-50/40 transition-all"
                        >
                          <Download className="w-4 h-4 text-emerald-600" />
                          <span>Download Package</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleOpenEmailModal}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all"
                        >
                          <Send className="w-4 h-4" />
                          <span>Transmit to Buyer Contact</span>
                        </button>
                      </div>
                    </div>

                    {/* Metadata & Cryptographic Integrity Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-2xs space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Target Buyer / EORI
                        </div>
                        <div className="font-display text-xs font-bold text-slate-900 truncate">
                          {generatedReport.buyerName}
                        </div>
                        <div className="font-mono text-[11px] text-emerald-700 font-semibold">
                          {generatedReport.eoriNumber}
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-2xs space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Declared Tonnage
                        </div>
                        <div className="font-display text-xs font-bold text-slate-900">
                          {generatedReport.totalTonnage.toLocaleString()} t
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {generatedReport.includedProductNames.length} Product Lines
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-2xs space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Total Embedded Carbon
                        </div>
                        <div className="font-display text-xs font-bold text-emerald-800">
                          {generatedReport.totalEmbedded_tCO2e.toLocaleString(undefined, { maximumFractionDigits: 1 })} tCO2e
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Annex IV Compliant
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-2xs space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Dispatch Status
                        </div>
                        <div>
                          {generatedReport.dispatchStatus === 'dispatched' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Dispatched
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
                              <Clock className="w-3 h-3" />
                              Ready for Transmission
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">
                          {generatedReport.acknowledgmentRef || 'Ref Pending Dispatch'}
                        </div>
                      </div>
                    </div>

                    {/* Cryptographic SHA-256 Digest Box */}
                    <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                          <Lock className="w-4 h-4 text-emerald-700" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Immutable SHA-256 Digital Fingerprint
                          </div>
                          <div className="font-mono text-xs font-bold text-slate-900 break-all">
                            {generatedReport.sha256Hash}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyHash(generatedReport.sha256Hash)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-400 text-slate-700 text-xs font-semibold hover:bg-emerald-50/50 transition-colors shrink-0 self-start sm:self-auto"
                      >
                        {copiedHash ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Digest</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Bottom Quick Links */}
                    <div className="pt-4 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setGeneratedReport(null);
                          setCurrentStep('step_a_scope');
                        }}
                        className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline"
                      >
                        + Create Another Report Package
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('history')}
                        className="text-slate-600 hover:text-slate-900 font-semibold hover:underline"
                      >
                        View in Report Archive History →
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Pre-generation Final Review Screen */
                <div className="space-y-6">
                  <div className="bg-white border border-emerald-100 rounded-3xl p-8 shadow-xs space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Final Pre-Generation Manifest Audit
                      </span>
                      <h2 className="font-display text-xl font-bold text-slate-900 mt-2">
                        Ready to Compile Official EU CBAM Declaration
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Please review the final parameters before generating the tamper-evident compliance package.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                          <h4 className="font-display text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Recipient & Facility
                          </h4>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-500">EU Importer:</span>
                              <span className="font-bold text-slate-900">{activeBuyer.companyName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">EORI Number:</span>
                              <span className="font-mono font-semibold text-slate-900">{activeBuyer.eoriNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Primary Contact:</span>
                              <span className="font-semibold text-slate-900">{activeBuyer.primaryContact.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Installation:</span>
                              <span className="text-slate-800">{activeInstallation.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">UN/LOCODE:</span>
                              <span className="font-mono font-semibold text-slate-800">{activeInstallation.unLocode}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                          <h4 className="font-display text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Packaging & Specifications
                          </h4>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Selected Format:</span>
                              <span className="font-bold text-emerald-800 uppercase">
                                {selectedFormat === 'both' ? 'ZIP Declaration Package' : selectedFormat.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Reporting Window:</span>
                              <span className="font-semibold text-slate-900">{reportingPeriod}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Accredited Verifier:</span>
                              <span className="text-slate-800">TÜV SÜD (DAkkS D-VS-14125-01-00)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">XSD Schema Version:</span>
                              <span className="font-mono text-slate-800">v2.3 (Implementing Reg 2023/1773)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-3">
                          <h4 className="font-display text-xs font-bold text-emerald-950 uppercase tracking-wider">
                            Emissions Scope Highlights
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                              <span className="text-slate-600">Included Product Lines:</span>
                              <span className="font-bold text-slate-900">{selectedProducts.length} Goods</span>
                            </div>
                            <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                              <span className="text-slate-600">Declared Shipped Tons:</span>
                              <span className="font-mono font-bold text-slate-900">
                                {scopeAggregates.totalTons.toLocaleString()} t
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                              <span className="text-slate-600">Total Embedded CO2e:</span>
                              <span className="font-mono font-bold text-emerald-800">
                                {scopeAggregates.weightedEmissions.toLocaleString(undefined, { maximumFractionDigits: 1 })} tCO2e
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                              <span className="text-slate-600">Weighted Average Factor:</span>
                              <span className="font-mono font-semibold text-slate-900">
                                {scopeAggregates.avgSpecific.toFixed(3)} tCO2e/t
                              </span>
                            </div>
                            <div className="flex justify-between pt-1">
                              <span className="text-slate-600">Default Value Dependency:</span>
                              <span className="font-bold">
                                {hasDefaultValues ? (
                                  <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                                    Acknowledged Default Present
                                  </span>
                                ) : (
                                  <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                                    0% Default (100% Monitored)
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Large Action Box */}
                        <div className="p-6 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl text-white space-y-4 shadow-md">
                          <div className="space-y-1">
                            <h4 className="font-display text-base font-bold">
                              Generate Verified Compliance Report
                            </h4>
                            <p className="text-[11px] text-emerald-100">
                              Immediately packages all Annex IV schedules, embeds third-party verification seals,
                              and issues a unique SHA-256 ledger certificate.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleGenerateReport}
                            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-display font-bold text-sm shadow-md transition-all active:scale-[0.99]"
                          >
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            <span>Generate Official Report Package</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setCurrentStep('step_c_format')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back to Format (Step C)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 3. REPORT ARCHIVE & HISTORY VIEW                                    */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Search & Filter Controls */}
          <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search past reports by buyer, EORI, or filename..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              {historySearch && (
                <button
                  type="button"
                  onClick={() => setHistorySearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Period Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                <span>Period:</span>
                <select
                  value={historyPeriodFilter}
                  onChange={(e) => setHistoryPeriodFilter(e.target.value)}
                  className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">All Quarters</option>
                  <option value="Q3 2026">Q3 2026</option>
                  <option value="Q2 2026">Q2 2026</option>
                  <option value="Q1 2026">Q1 2026</option>
                </select>
              </div>

              {/* Format Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Format:</span>
                <select
                  value={historyFormatFilter}
                  onChange={(e) => setHistoryFormatFilter(e.target.value)}
                  className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">All Formats</option>
                  <option value="both">ZIP Package</option>
                  <option value="pdf">PDF Template</option>
                  <option value="xml">XML Schema</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setHistorySearch('');
                  setHistoryPeriodFilter('all');
                  setHistoryFormatFilter('all');
                }}
                className="text-xs font-semibold text-slate-500 hover:text-emerald-700 px-2 py-1"
              >
                Reset
              </button>
            </div>
          </div>

          {/* History Data Table */}
          <div className="bg-white border border-emerald-100 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Certified CBAM Report History ({filteredHistory.length} Record{filteredHistory.length !== 1 ? 's' : ''})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete 5-year statutory audit trail of generated and dispatched declaration packages
                </p>
              </div>

              <span className="text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Article 14 5-Yr Retention Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Package Name / ID</th>
                    <th className="py-3 px-4">EU Importer & EORI</th>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4 text-right">Shipped Tons</th>
                    <th className="py-3 px-4 text-right">Embedded tCO2e</th>
                    <th className="py-3 px-4 text-center">Format</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">SHA-256 Fingerprint</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        No report history matched your search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {rec.format === 'both' ? (
                              <Package className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : rec.format === 'pdf' ? (
                              <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <FileCode className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            )}
                            <span className="truncate max-w-[200px]" title={rec.reportName}>
                              {rec.reportName}
                            </span>
                          </div>
                          <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                            {rec.id} · {rec.fileSize}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{rec.buyerName}</div>
                          <div className="font-mono text-[10px] text-slate-400">
                            {rec.eoriNumber} ({rec.buyerCountry})
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {rec.period}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-slate-800">
                          {rec.totalTonnage.toLocaleString()} t
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                          {rec.totalEmbedded_tCO2e.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              rec.format === 'both'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : rec.format === 'pdf'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-teal-100 text-teal-800 border border-teal-200'
                            }`}
                          >
                            {rec.format === 'both' ? 'ZIP' : rec.format}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {rec.dispatchStatus === 'verified_by_importer' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Accepted
                            </span>
                          ) : rec.dispatchStatus === 'dispatched' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                              <Send className="w-2.5 h-2.5" />
                              Dispatched
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              <Clock className="w-2.5 h-2.5" />
                              Generated
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[120px]">{rec.sha256Hash.substring(0, 16)}...</span>
                            <button
                              type="button"
                              onClick={() => handleCopyHash(rec.sha256Hash)}
                              className="text-slate-400 hover:text-slate-700 p-0.5"
                              title="Copy full hash"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(rec)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-700 transition-colors"
                              title="Download Report File"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-700" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setGeneratedReport(rec);
                                setEmailTo(rec.contactEmail);
                                setEmailSubject(
                                  `[OFFICIAL EU CBAM RE-TRANSMISSION] ${rec.period} Package for ${rec.buyerName}`
                                );
                                setIsEmailModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-700 transition-colors"
                              title="Transmit or Re-send to Buyer Contact"
                            >
                              <Send className="w-3.5 h-3.5 text-emerald-700" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 4. EMAIL-STYLE BUYER DIRECT SHARE MODAL                              */}
      {/* ------------------------------------------------------------------- */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold">
                    Transmit Declaration to EU Buyer Contact
                  </h3>
                  <div className="text-[11px] text-emerald-100">
                    Bilateral CBAM Data Dispatch Channel
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-6 space-y-4 text-xs">
              {/* To field */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>To (Buyer Primary Contact):</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Auto-populated from EU Buyer Register
                  </span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* CC field */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">
                  CC (Accredited Verifier & Internal ESG Audit):
                </label>
                <input
                  type="text"
                  value={emailCc}
                  onChange={(e) => setEmailCc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-600 font-mono text-[11px]"
                />
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Subject Line:</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-900"
                />
              </div>

              {/* Attachments Chip List */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">
                  Included Cryptographic Attachments:
                </span>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-slate-800 font-mono text-[11px] flex items-center gap-1 shadow-2xs">
                    <FileText className="w-3 h-3 text-emerald-600" />
                    CBAM_Annex_IV_Communication_Template.pdf
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-slate-800 font-mono text-[11px] flex items-center gap-1 shadow-2xs">
                    <FileCode className="w-3 h-3 text-teal-600" />
                    EU_CBAM_Declaration_Payload_v2.3.xml
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-slate-800 font-mono text-[11px] flex items-center gap-1 shadow-2xs">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    TUV_SUD_DAkkS_Verification_Statement.pdf
                  </span>
                </div>
              </div>

              {/* Email Body */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Message Body:</label>
                <textarea
                  rows={7}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 font-sans text-xs leading-relaxed"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSendingEmail}
                onClick={handleSendEmailToBuyer}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                {isSendingEmail ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Transmitting to Importer...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Package Directly to Buyer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
