import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  ArrowRight,
  ChevronDown,
  X,
  FileCode,
  FileText,
  Mail,
  Phone,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Hash,
  ExternalLink,
  ChevronRight,
  Send,
  MessageSquare,
  Filter,
  Check,
  Building2,
  Calendar,
  Sparkles,
  Inbox,
  UserCheck,
  ArrowLeft,
  FileSpreadsheet,
  Download,
  Lock,
  Package,
} from 'lucide-react';
import { useCbam } from '../../context/CbamContext';

export type BuyerStatus = 'active' | 'dormant' | 'new';
export type ComplianceConfidence = 'up_to_date' | 'approaching_deadline' | 'behind_schedule';

export interface BuyerShareRecord {
  id: string;
  reportName: string;
  period: string;
  dateSent: string;
  format: 'eu_cbam_xml' | 'pdf_communication_sheet' | 'both';
  totalTonnage: number;
  totalEmbedded_tCO2e: number;
  verificationStatus: 'verified_accepted' | 'in_review' | 'revision_requested';
  acknowledgmentRef?: string;
  downloadUrl?: string;
}

export interface BuyerRecord {
  id: string;
  companyName: string;
  eoriNumber: string;
  declarantId: string;
  country: string;
  countryCode: string;
  sector: string;
  importedCnCodes: string[];
  importedProducts: string[];
  status: BuyerStatus;
  lastDataSharedDate: string;
  nextDeadlineDate: string;
  daysRemaining: number;
  confidence: ComplianceConfidence;
  primaryContact: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
  preferredFormat: 'eu_cbam_xml' | 'eu_official_excel' | 'buyer_custom_csv';
  notes: string;
  shareHistory: BuyerShareRecord[];
}

export interface BuyerRequestItem {
  id: string;
  buyerId: string;
  buyerName: string;
  countryCode: string;
  title: string;
  requestedPeriod: string;
  requestedFormat: string;
  dueDate: string;
  daysLeft: number;
  urgency: 'critical' | 'warning' | 'normal';
  notes: string;
}

const INITIAL_BUYERS: BuyerRecord[] = [
  {
    id: 'b-01',
    companyName: 'ThyssenKrupp Materials Services GmbH',
    eoriNumber: 'DE100492819882',
    declarantId: 'EU-DEC-DE-882190',
    country: 'Germany',
    countryCode: 'DE',
    sector: 'Iron & Steel',
    importedCnCodes: ['7208 39 00', '7214 20 00'],
    importedProducts: ['Hot-Rolled Steel Coils (S235JR)', 'Concrete Reinforcing Rebar (B500B)'],
    status: 'active',
    lastDataSharedDate: '2026-08-14',
    nextDeadlineDate: '2026-10-31',
    daysRemaining: 34,
    confidence: 'up_to_date',
    primaryContact: {
      name: 'Henrik von Berg',
      role: 'Head of Steel Import Compliance',
      email: 'henrik.vonberg@thyssenkrupp.com',
      phone: '+49 201 844 532100',
    },
    preferredFormat: 'eu_cbam_xml',
    notes: 'Requires XML Annex IV with direct EAF scrap factor explicitly attested.',
    shareHistory: [
      {
        id: 'rep-01',
        reportName: 'TK_Q2_2026_AnnexIV_Official_Declaration.xml',
        period: 'Q2 2026',
        dateSent: '2026-08-14',
        format: 'eu_cbam_xml',
        totalTonnage: 28500,
        totalEmbedded_tCO2e: 18667.5,
        verificationStatus: 'verified_accepted',
        acknowledgmentRef: 'TK-CBAM-ACK-2026-Q2-0918',
      },
      {
        id: 'rep-02',
        reportName: 'TK_Q1_2026_AnnexIV_Communication_Sheet.pdf',
        period: 'Q1 2026',
        dateSent: '2026-05-12',
        format: 'pdf_communication_sheet',
        totalTonnage: 26200,
        totalEmbedded_tCO2e: 18654.4,
        verificationStatus: 'verified_accepted',
        acknowledgmentRef: 'TK-CBAM-ACK-2026-Q1-0422',
      },
    ],
  },
  {
    id: 'b-02',
    companyName: 'ArcelorMittal Europe S.A.',
    eoriNumber: 'LU204918204911',
    declarantId: 'EU-DEC-LU-109283',
    country: 'Luxembourg',
    countryCode: 'LU',
    sector: 'Iron & Steel',
    importedCnCodes: ['7208 39 00'],
    importedProducts: ['Hot-Rolled Steel Coils (S235JR)'],
    status: 'active',
    lastDataSharedDate: '2026-07-28',
    nextDeadlineDate: '2026-10-15',
    daysRemaining: 18,
    confidence: 'approaching_deadline',
    primaryContact: {
      name: 'Sophie Dupont',
      role: 'Director of Sustainable Supply Chains',
      email: 'sophie.dupont@arcelormittal.com',
      phone: '+352 4792 2182',
    },
    preferredFormat: 'eu_cbam_xml',
    notes: 'Q3 data requested via Nemrut export route. Requires TÜV SÜD digital verification opinion.',
    shareHistory: [
      {
        id: 'rep-03',
        reportName: 'ArcelorMittal_Q2_2026_Communication_Sheet.pdf',
        period: 'Q2 2026',
        dateSent: '2026-07-28',
        format: 'pdf_communication_sheet',
        totalTonnage: 36200,
        totalEmbedded_tCO2e: 24760.8,
        verificationStatus: 'verified_accepted',
        acknowledgmentRef: 'AM-CBAM-2026-Q2-0881',
      },
    ],
  },
  {
    id: 'b-03',
    companyName: 'Klöckner & Co SE',
    eoriNumber: 'DE891028301928',
    declarantId: 'EU-DEC-DE-440192',
    country: 'Germany',
    countryCode: 'DE',
    sector: 'Metals & Distribution',
    importedCnCodes: ['7208 39 00', '7601 20 20'],
    importedProducts: ['Hot-Rolled Steel Coils', 'Aluminium Extrusion Billets (6063)'],
    status: 'active',
    lastDataSharedDate: '2026-06-30',
    nextDeadlineDate: '2026-11-12',
    daysRemaining: 46,
    confidence: 'up_to_date',
    primaryContact: {
      name: 'Marcus Lindemann',
      role: 'ESG & Low-Carbon Procurement',
      email: 'm.lindemann@kloeckner.com',
      phone: '+49 203 522 4110',
    },
    preferredFormat: 'buyer_custom_csv',
    notes: 'Klöckner Nexigen® platform requires CO2 intensity breakdown into their API format.',
    shareHistory: [
      {
        id: 'rep-04',
        reportName: 'Kloeckner_Nexigen_Q1_2026_Steel_Alu.xml',
        period: 'Q1 2026',
        dateSent: '2026-06-30',
        format: 'eu_cbam_xml',
        totalTonnage: 19400,
        totalEmbedded_tCO2e: 13812.8,
        verificationStatus: 'verified_accepted',
        acknowledgmentRef: 'KLO-NEX-2026-Q1-0914',
      },
    ],
  },
  {
    id: 'b-04',
    companyName: 'Outokumpu Stainless Oyj',
    eoriNumber: 'FI910293810293',
    declarantId: 'EU-DEC-FI-991204',
    country: 'Finland',
    countryCode: 'FI',
    sector: 'Specialty Steel & Alloys',
    importedCnCodes: ['7601 20 20'],
    importedProducts: ['Aluminium Extrusion Billets (6063)'],
    status: 'active',
    lastDataSharedDate: '2026-05-18',
    nextDeadlineDate: '2026-10-05',
    daysRemaining: 8,
    confidence: 'behind_schedule',
    primaryContact: {
      name: 'Matti Virtanen',
      role: 'CBAM Declarations Lead',
      email: 'matti.virtanen@outokumpu.com',
      phone: '+358 9 421 2100',
    },
    preferredFormat: 'eu_cbam_xml',
    notes: 'Precursor alumina verification certificate requested for 2026 imports.',
    shareHistory: [
      {
        id: 'rep-05',
        reportName: 'Outokumpu_Q1_2026_AnnexIV_Aluminium.pdf',
        period: 'Q1 2026',
        dateSent: '2026-05-18',
        format: 'pdf_communication_sheet',
        totalTonnage: 8400,
        totalEmbedded_tCO2e: 23604.0,
        verificationStatus: 'revision_requested',
        acknowledgmentRef: 'OUTO-CBAM-REV-REQ-03',
      },
    ],
  },
];

const INITIAL_REQUESTS: BuyerRequestItem[] = [
  {
    id: 'req-01',
    buyerId: 'b-02',
    buyerName: 'ArcelorMittal Europe S.A.',
    countryCode: 'LU',
    title: 'Urgent: Q3 2026 Annex IV XML declaration package requested',
    requestedPeriod: 'Q3 2026',
    requestedFormat: 'EU CBAM XML v2.3',
    dueDate: '2026-10-15',
    daysLeft: 18,
    urgency: 'critical',
    notes: 'Need official declaration package for 36,200 tons shipped via Port of Nemrut before customs pre-clearance.',
  },
  {
    id: 'req-02',
    buyerId: 'b-04',
    buyerName: 'Outokumpu Stainless Oyj',
    countryCode: 'FI',
    title: 'Precursor Alumina ISO 14064 third-party audit revision needed',
    requestedPeriod: 'Q3 2026',
    requestedFormat: 'Signed PDF Statement',
    dueDate: '2026-10-05',
    daysLeft: 8,
    urgency: 'critical',
    notes: 'Finnish customs requires explicit verifier accreditation number on upstream raw material certificate.',
  },
  {
    id: 'req-03',
    buyerId: 'b-03',
    buyerName: 'Klöckner & Co SE',
    countryCode: 'DE',
    title: 'Nexigen® API Data Synchronisation for billet batch #B-2026-88',
    requestedPeriod: 'Q3 2026',
    requestedFormat: 'Buyer API / JSON',
    dueDate: '2026-11-12',
    daysLeft: 46,
    urgency: 'normal',
    notes: 'Routine quarterly carbon intensity feed update for green metals supply pass-through.',
  },
];

interface BuyerRelationshipManagerProps {
  onNavigateStep?: (stepId: string) => void;
}

export const BuyerRelationshipManagerView: React.FC<BuyerRelationshipManagerProps> = ({
  onNavigateStep,
}) => {
  const { triggerToast, setIsAddBuyerOpen, buyers: contextBuyers } = useCbam();

  const [buyers, setBuyers] = useState<BuyerRecord[]>(INITIAL_BUYERS);
  const [requests, setRequests] = useState<BuyerRequestItem[]>(INITIAL_REQUESTS);
  const [activeTab, setActiveTab] = useState<'directory' | 'requests'>('directory');
  const [selectedBuyer, setSelectedBuyer] = useState<BuyerRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'at_risk'>('all');

  // Inline Report Generator Modal State
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  const [generatorStep, setGeneratorStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPeriod, setSelectedPeriod] = useState('Q3 2026');
  const [selectedFormat, setSelectedFormat] = useState<'eu_cbam_xml' | 'pdf_communication_sheet' | 'both'>('eu_cbam_xml');
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync with contextBuyers when added through AddBuyerModal
  useEffect(() => {
    if (contextBuyers && contextBuyers.length > 0) {
      setBuyers((current) => {
        const existingIds = new Set(current.map((b) => b.id));
        const newOnes: BuyerRecord[] = contextBuyers
          .filter((cb) => !existingIds.has(cb.id))
          .map((cb) => ({
            id: cb.id,
            companyName: cb.companyName,
            eoriNumber: cb.eoriNumber,
            declarantId: `EU-DEC-${cb.buyerCountry.slice(0, 2).toUpperCase()}-990142`,
            country: cb.buyerCountry,
            countryCode: cb.buyerCountry.slice(0, 2).toUpperCase(),
            sector: 'Industrial Exports',
            importedCnCodes: ['7208 39 00'],
            importedProducts: ['Hot-Rolled Coils'],
            status: 'active',
            lastDataSharedDate: '—',
            nextDeadlineDate: '2026-10-31',
            daysRemaining: 34,
            confidence: 'up_to_date',
            primaryContact: cb.primaryContact,
            preferredFormat: 'eu_cbam_xml',
            notes: cb.customMappingNotes || 'Registered EU Importer.',
            shareHistory: [],
          }));
        if (newOnes.length === 0) return current;
        return [...current, ...newOnes];
      });
    }
  }, [contextBuyers]);

  // Filtered buyers list
  const filteredBuyers = useMemo(() => {
    return buyers.filter((b) => {
      const matchSearch =
        b.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.importedProducts.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;
      if (statusFilter === 'active') return b.status === 'active';
      if (statusFilter === 'at_risk') return b.confidence !== 'up_to_date';
      return true;
    });
  }, [buyers, searchQuery, statusFilter]);

  // Handle Generate Report Flow
  const handleOpenGenerator = (b?: BuyerRecord) => {
    if (b) setSelectedBuyer(b);
    setGeneratorStep(1);
    setIsGeneratorModalOpen(true);
  };

  const handleFinishGeneration = () => {
    if (!selectedBuyer) return;
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      setIsGeneratorModalOpen(false);

      const newReport: BuyerShareRecord = {
        id: `rep-${Date.now()}`,
        reportName: `${selectedBuyer.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedPeriod.replace(' ', '_')}_Official_Declaration.${selectedFormat === 'eu_cbam_xml' ? 'xml' : 'pdf'}`,
        period: selectedPeriod,
        dateSent: new Date().toISOString().split('T')[0],
        format: selectedFormat,
        totalTonnage: 32000,
        totalEmbedded_tCO2e: 20960.0,
        verificationStatus: 'verified_accepted',
        acknowledgmentRef: `CBAM-${selectedBuyer.countryCode}-${Date.now().toString().slice(-6)}`,
      };

      const updatedBuyer = {
        ...selectedBuyer,
        lastDataSharedDate: newReport.dateSent,
        shareHistory: [newReport, ...selectedBuyer.shareHistory],
      };

      setSelectedBuyer(updatedBuyer);
      setBuyers((prev) => prev.map((b) => (b.id === updatedBuyer.id ? updatedBuyer : b)));

      triggerToast(`Report package for ${selectedBuyer.companyName} generated and registered in history!`);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------- */}
      {/* IF A BUYER IS SELECTED: SHOW INLINE DETAIL PAGE                     */}
      {/* ------------------------------------------------------------------- */}
      {selectedBuyer ? (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Header & Back Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedBuyer(null)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors inline-flex items-center gap-1.5 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Buyers</span>
              </button>
              <div className="h-5 w-px bg-slate-200 hidden sm:block" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold font-display text-slate-900">
                    {selectedBuyer.companyName}
                  </h1>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                    {selectedBuyer.country} ({selectedBuyer.countryCode})
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  EORI: {selectedBuyer.eoriNumber} · Declarant: {selectedBuyer.declarantId}
                </div>
              </div>
            </div>

            {/* Top Action */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleOpenGenerator()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all hover:scale-[1.01]"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Generate Report</span>
              </button>
            </div>
          </div>

          {/* Buyer Profile Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Primary Counterparty Contact
              </span>
              <div className="space-y-1.5 pt-1">
                <div className="font-bold text-slate-900 text-sm">
                  {selectedBuyer.primaryContact.name}
                </div>
                <div className="text-slate-500">{selectedBuyer.primaryContact.role}</div>
                <div className="flex items-center gap-2 text-slate-600 pt-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a
                    href={`mailto:${selectedBuyer.primaryContact.email}`}
                    className="hover:underline text-emerald-700"
                  >
                    {selectedBuyer.primaryContact.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedBuyer.primaryContact.phone}</span>
                </div>
              </div>
            </div>

            {/* Imported Scope Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Imported Products & CN Codes
              </span>
              <div className="space-y-2 pt-1">
                {selectedBuyer.importedProducts.map((prod, idx) => (
                  <div key={prod} className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{prod}</span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {selectedBuyer.importedCnCodes[idx] || selectedBuyer.importedCnCodes[0]}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Preferred Output Format:</span>
                  <span className="font-bold text-slate-700 uppercase">
                    {selectedBuyer.preferredFormat.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Deadline & Status */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Declaration Cadence & Deadlines
              </span>
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Next Filing Deadline:</span>
                  <strong className="text-slate-900 font-mono">
                    {selectedBuyer.nextDeadlineDate} ({selectedBuyer.daysRemaining}d left)
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Last Data Shared:</span>
                  <span className="text-slate-700">{selectedBuyer.lastDataSharedDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Confidence Status:</span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                      selectedBuyer.confidence === 'up_to_date'
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {selectedBuyer.confidence === 'up_to_date' ? 'Up to Date' : 'Deadline Approaching'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* REPORT GENERATION & REPORT HISTORY SECTION (INLINE)                */}
          {/* ----------------------------------------------------------------- */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900">
                  Report History & Generated Communication Packages
                </h3>
                <p className="text-xs text-slate-500">
                  Official EU CBAM Communication Sheets (Annex IV) and O3CI XML submission bundles generated for {selectedBuyer.companyName}.
                </p>
              </div>

              {/* Prominent "Generate Report" action */}
              <button
                type="button"
                onClick={() => handleOpenGenerator()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Generate New Report for this Buyer</span>
              </button>
            </div>

            {/* Report History Table */}
            {selectedBuyer.shareHistory.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No reports generated yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click "Generate Report" above to create an official Annex IV communication sheet or XML bundle for this buyer.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200/80">
                    <tr>
                      <th className="py-3 px-4">Package / Report Name</th>
                      <th className="py-3 px-3">Period</th>
                      <th className="py-3 px-3 text-right">Tonnage</th>
                      <th className="py-3 px-3 text-right">Embedded CO₂e</th>
                      <th className="py-3 px-3 text-center">Format</th>
                      <th className="py-3 px-3">Date Shared</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedBuyer.shareHistory.map((rep) => (
                      <tr key={rep.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-sans">
                          <div className="font-bold text-slate-900 text-xs">{rep.reportName}</div>
                          {rep.acknowledgmentRef && (
                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                              Ref: {rep.acknowledgmentRef}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-3 font-semibold text-slate-700">
                          {rep.period}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-800 tabular-nums">
                          {rep.totalTonnage.toLocaleString()} t
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {rep.totalEmbedded_tCO2e.toLocaleString(undefined, { maximumFractionDigits: 1 })} t
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {rep.format === 'eu_cbam_xml' ? 'XML' : 'PDF'}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-slate-600">
                          {rep.dateSent}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                              rep.verificationStatus === 'verified_accepted'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-amber-50 border-amber-200 text-amber-800'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>
                              {rep.verificationStatus === 'verified_accepted' ? 'Accepted' : 'In Review'}
                            </span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => triggerToast(`Downloading ${rep.reportName}...`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            <span>Get File</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------------- */
        /* SIMPLIFIED BUYERS LIST SCREEN + INCOMING REQUESTS INBOX             */
        /* ------------------------------------------------------------------- */
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <h1 className="text-xl font-bold font-display text-slate-900 tracking-tight">
                EU Buyer Relationships
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                European importer counterparties. Click any row to view profile, report history, or generate new declarations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddBuyerOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Buyer</span>
            </button>
          </div>

          {/* Sub-Tab Navigation: All Buyers vs Incoming Requests Inbox */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className={`pb-3 px-4 text-xs font-bold transition-all relative ${
                activeTab === 'directory'
                  ? 'text-emerald-700'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>All Buyers ({buyers.length})</span>
              {activeTab === 'directory' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
                activeTab === 'requests'
                  ? 'text-emerald-700'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Incoming Requests Inbox</span>
              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                {requests.length}
              </span>
              {activeTab === 'requests' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </button>
          </div>

          {/* VIEW A: BUYERS DIRECTORY */}
          {activeTab === 'directory' ? (
            <div className="space-y-4">
              {/* Search & Status Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="relative flex-1 sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search buyer name, country, or product..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1 text-xs">
                  {[
                    { id: 'all', label: 'All Buyers' },
                    { id: 'active', label: 'Active' },
                    { id: 'at_risk', label: 'Deadline Approaching' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStatusFilter(s.id as any)}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                        statusFilter === s.id
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clean Table: Buyer Name, Country, Products, Status, Next Deadline */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left min-w-[650px]">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200/80">
                      <tr>
                        <th className="py-3 px-4">EU Buyer Company</th>
                        <th className="py-3 px-3">Country</th>
                        <th className="py-3 px-3">Imported Goods</th>
                        <th className="py-3 px-3">Next Deadline</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredBuyers.map((b) => (
                        <tr
                          key={b.id}
                          onClick={() => setSelectedBuyer(b)}
                          className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                        >
                          <td className="py-3.5 px-4 font-sans">
                            <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {b.companyName}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                              EORI: {b.eoriNumber}
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-slate-700 font-medium">
                            {b.country}
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="text-slate-600 line-clamp-1">
                              {b.importedProducts.join(', ')}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 font-mono font-semibold text-slate-800">
                            {b.nextDeadlineDate}{' '}
                            <span className="text-[11px] text-slate-400 font-sans">
                              ({b.daysRemaining}d)
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                b.confidence === 'up_to_date'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-amber-50 border-amber-200 text-amber-800'
                              }`}
                            >
                              {b.confidence === 'up_to_date' ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <AlertTriangle className="w-3 h-3" />
                              )}
                              <span>
                                {b.confidence === 'up_to_date' ? 'Active' : 'Approaching'}
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
          ) : (
            /* VIEW B: INCOMING REQUESTS INBOX */
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>3 pending counterparty data requests:</strong> Fulfill before quarterly declaration window locks to avoid customs delivery holds.
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-100 bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                {requests.map((req) => (
                  <div key={req.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors text-xs">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                          req.urgency === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {req.urgency.toUpperCase()}
                        </span>
                        <span className="font-bold text-slate-800">{req.buyerName}</span>
                        <span>·</span>
                        <span className="text-slate-500 font-mono">Period: {req.requestedPeriod}</span>
                        <span>·</span>
                        <span className="text-rose-700 font-bold">Due {req.dueDate} ({req.daysLeft}d left)</span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm">{req.title}</h4>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{req.notes}</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const matchedBuyer = buyers.find((b) => b.id === req.buyerId) || buyers[0];
                          handleOpenGenerator(matchedBuyer);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Fulfill via Report Generator</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* STEP-BY-STEP REPORT GENERATOR MODAL / PANEL OVER THIS PAGE         */}
      {/* ----------------------------------------------------------------- */}
      {isGeneratorModalOpen && selectedBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsGeneratorModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-10 border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-base font-bold font-display text-slate-900">
                  Generate CBAM Report Package
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Destination: {selectedBuyer.companyName} ({selectedBuyer.country})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsGeneratorModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress */}
            <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200/60 flex items-center justify-between text-xs font-semibold">
              <div className={`flex items-center gap-1.5 ${generatorStep >= 1 ? 'text-emerald-700' : 'text-slate-400'}`}>
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                <span>Scope</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <div className={`flex items-center gap-1.5 ${generatorStep >= 2 ? 'text-emerald-700' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${generatorStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
                <span>Review</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <div className={`flex items-center gap-1.5 ${generatorStep >= 3 ? 'text-emerald-700' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${generatorStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
                <span>Format</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <div className={`flex items-center gap-1.5 ${generatorStep >= 4 ? 'text-emerald-700' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${generatorStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>4</span>
                <span>Dispatch</span>
              </div>
            </div>

            {/* Modal Body: Content By Step */}
            <div className="p-6 space-y-5 text-xs">
              {generatorStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">Reporting Period</label>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Q3 2026">Q3 2026 (Current Period)</option>
                      <option value="Q2 2026">Q2 2026</option>
                      <option value="Q1 2026">Q1 2026</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">Included Product Lines</label>
                    <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      {selectedBuyer.importedProducts.map((pName) => (
                        <label key={pName} className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                          <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                          <span>{pName}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {generatorStep === 2 && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>All product lines utilize verified actual plant telemetry. Zero penalty markup applied.</span>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>Total Shipped Tonnage:</span>
                      <span className="font-mono text-slate-900">32,000 t</span>
                    </div>
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>Specific Embedded Emissions (Weighted):</span>
                      <span className="font-mono text-slate-900">0.655 tCO₂e/t</span>
                    </div>
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>Total Embedded Carbon Footprint:</span>
                      <span className="font-mono text-emerald-700 font-bold">20,960 tCO₂e</span>
                    </div>
                  </div>
                </div>
              )}

              {generatorStep === 3 && (
                <div className="space-y-3">
                  <label className="block text-slate-700 font-bold mb-1">Select Output Format</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setSelectedFormat('eu_cbam_xml')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedFormat === 'eu_cbam_xml'
                          ? 'border-emerald-600 bg-emerald-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-xs">EU CBAM Communication XML</div>
                      <p className="text-[11px] text-slate-500 mt-1">Official machine-readable schema for EU declarant portals.</p>
                    </div>

                    <div
                      onClick={() => setSelectedFormat('pdf_communication_sheet')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedFormat === 'pdf_communication_sheet'
                          ? 'border-emerald-600 bg-emerald-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-xs">Annex IV PDF Sheet</div>
                      <p className="text-[11px] text-slate-500 mt-1">Standard human-readable signed declaration with verifier hash.</p>
                    </div>
                  </div>
                </div>
              )}

              {generatorStep === 4 && (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto">
                    <Package className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Ready to Generate Package</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Your verified package will be saved to this buyer's permanent audit history and ready for direct download.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (generatorStep > 1) {
                    setGeneratorStep((prev) => (prev - 1) as any);
                  } else {
                    setIsGeneratorModalOpen(false);
                  }
                }}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                {generatorStep === 1 ? 'Cancel' : 'Back'}
              </button>

              <button
                type="button"
                disabled={isGenerating}
                onClick={() => {
                  if (generatorStep < 4) {
                    setGeneratorStep((prev) => (prev + 1) as any);
                  } else {
                    handleFinishGeneration();
                  }
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5"
              >
                {isGenerating ? (
                  <span>Generating Package...</span>
                ) : generatorStep === 4 ? (
                  <span>Generate & Save to History</span>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
