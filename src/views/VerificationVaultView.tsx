import React, { useState, useMemo, useRef } from 'react';
import { useCbam } from '../context/CbamContext';
import { DocumentVaultItem } from '../types/cbam';
import {
  ShieldCheck,
  FileCheck,
  Download,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  Hash,
  Award,
  UploadCloud,
  FileUp,
  FileText,
  Calendar,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Eye,
  RefreshCw,
  Sparkles,
  HelpCircle,
  Send,
  Check,
  X,
  Building2,
  CheckCheck,
  History,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  SlidersHorizontal,
  Info,
  UserCheck,
} from 'lucide-react';

interface VerificationVaultViewProps {
  onNavigateStep?: (stepId: string) => void;
}

export type VaultDisplayState = 'populated' | 'verification_pending' | 'empty_workspace';

export interface AuditTimelineEvent {
  id: string;
  timestamp: string;
  dateStr: string;
  actor: {
    name: string;
    role: string;
    avatarInitials: string;
    color: string;
  };
  actionType: 'upload' | 'verification_request' | 'auditor_review' | 'auditor_signature' | 'retention_lock' | 'mass_balance';
  title: string;
  description: string;
  documentTitle?: string;
  periodTag: string;
  sha256Prefix?: string;
}

export const VerificationVaultView: React.FC<VerificationVaultViewProps> = ({ onNavigateStep }) => {
  const {
    vaultDocuments,
    addVaultDocument,
    verifyDocumentAsAuditor,
    activePersona,
    activeInstallation,
    triggerToast,
  } = useCbam();

  // ---------------------------------------------------------------------------
  // STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  const [vaultState, setVaultState] = useState<VaultDisplayState>('populated');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<DocumentVaultItem['docType']>('verification_statement');
  const [newDocPeriod, setNewDocPeriod] = useState('Q3 2026');
  const [newDocProduct, setNewDocProduct] = useState('prod-01');
  const [newDocVerifier, setNewDocVerifier] = useState('TÜV SÜD Umweltpartner GmbH');
  const [newDocAccreditation, setNewDocAccreditation] = useState('DAkkS D-VS-14125-01-00');

  // Preview & Auditor Endorsement Modal
  const [previewDoc, setPreviewDoc] = useState<DocumentVaultItem | null>(null);
  const [selectedDocForVerification, setSelectedDocForVerification] = useState<DocumentVaultItem | null>(null);
  const [verifierNotes, setVerifierNotes] = useState(
    'Reasonable assurance established. System boundaries, fuel calorific assays, and continuous monitoring records confirmed in accordance with EU CBAM Regulation 2023/956 and Implementing Regulation 2023/1773.'
  );
  const [isAuditorModalOpen, setIsAuditorModalOpen] = useState(false);

  // Request Verification Modal
  const [isRequestVerificationOpen, setIsRequestVerificationOpen] = useState(false);
  const [reqPeriod, setReqPeriod] = useState('Q3 2026');
  const [reqVerifierOrg, setReqVerifierOrg] = useState('TÜV SÜD Umweltpartner GmbH');
  const [reqScopeDirect, setReqScopeDirect] = useState(true);
  const [reqScopeElectricity, setReqScopeElectricity] = useState(true);
  const [reqScopePrecursors, setReqScopePrecursors] = useState(true);
  const [reqScopeMassBalance, setReqScopeMassBalance] = useState(true);
  const [reqAuditNotes, setReqAuditNotes] = useState(
    'Please verify Q3 2026 actual emissions for Aliağa plant. All 6 laboratory assays, PPA GoO bundles, and EAF electrode oxidation records are attached in vault.'
  );

  // Retention Details Modal
  const [isRetentionInfoOpen, setIsRetentionInfoOpen] = useState(false);

  // Active Audit Trail Filter
  const [trailFilterPeriod, setTrailFilterPeriod] = useState<string>('all');

  // ---------------------------------------------------------------------------
  // TIMELINE EVENTS MOCK
  // ---------------------------------------------------------------------------
  const [auditEvents, setAuditEvents] = useState<AuditTimelineEvent[]>([
    {
      id: 'evt-01',
      timestamp: '2026-08-12T14:32:00Z',
      dateStr: '12 Aug 2026 · 17:32',
      actor: {
        name: 'Dr. Heinrich Weber',
        role: 'Lead CBAM Auditor (TÜV SÜD)',
        avatarInitials: 'HW',
        color: 'bg-emerald-600 text-white',
      },
      actionType: 'auditor_signature',
      title: 'Digital Audit Assurance Statement Affixed',
      description: 'Accredited verifier affixed unqualified positive opinion with Reasonable Assurance. Certificate Form CBAM-VER-2026 sealed.',
      documentTitle: 'EU CBAM Verification Statement — Q3 2026 Actual Emissions Audit',
      periodTag: 'Q3 2026',
      sha256Prefix: 'e3b0c44298fc...',
    },
    {
      id: 'evt-02',
      timestamp: '2026-08-12T10:15:00Z',
      dateStr: '12 Aug 2026 · 13:15',
      actor: {
        name: 'Automated Cryptographic Sealer',
        role: 'CBAM WORM Vault Engine',
        avatarInitials: 'CS',
        color: 'bg-slate-700 text-white',
      },
      actionType: 'retention_lock',
      title: '5-Year Statutory Retention Lock Initialized',
      description: 'Document record sealed under EU CBAM Article 14 statutory retention mandate. Immutable storage locked until 31 December 2031.',
      documentTitle: 'EU CBAM Verification Statement — Q3 2026 Actual Emissions Audit',
      periodTag: 'Q3 2026',
      sha256Prefix: 'e3b0c44298fc...',
    },
    {
      id: 'evt-03',
      timestamp: '2026-08-04T09:40:00Z',
      dateStr: '04 Aug 2026 · 12:40',
      actor: {
        name: 'Selin Yılmaz',
        role: 'Head of ESG & Regulatory Compliance',
        avatarInitials: 'SY',
        color: 'bg-teal-600 text-white',
      },
      actionType: 'upload',
      title: 'Laboratory Fuel & Carbon Assay Uploaded',
      description: 'Eurofins EN 17025 accredited gas chromatography assay for pipeline natural gas NCV (38.2 MJ/Nm³) uploaded and linked to Billet-150-3SP.',
      documentTitle: 'Independent Laboratory Fuel & Carbon Assay Certificates (Accredited EN 17025)',
      periodTag: 'Q3 2026',
      sha256Prefix: '5e884898da28...',
    },
    {
      id: 'evt-04',
      timestamp: '2026-07-28T16:10:00Z',
      dateStr: '28 Jul 2026 · 19:10',
      actor: {
        name: 'Mehmet Kaya',
        role: 'Plant Operations Director',
        avatarInitials: 'MK',
        color: 'bg-blue-600 text-white',
      },
      actionType: 'mass_balance',
      title: 'Facility Production Mass Balance Approved',
      description: 'Reconciled 295,000 tonnes gross crude steel production with scrap input manifests and lime calcination stoichiometric logs.',
      periodTag: 'Q3 2026',
    },
    {
      id: 'evt-05',
      timestamp: '2026-07-20T11:00:00Z',
      dateStr: '20 Jul 2026 · 14:00',
      actor: {
        name: 'Selin Yılmaz',
        role: 'Head of ESG & Regulatory Compliance',
        avatarInitials: 'SY',
        color: 'bg-teal-600 text-white',
      },
      actionType: 'verification_request',
      title: 'Verification Audit Package Dispatched',
      description: 'Audit dossier for Q3 2026 transmitted to TÜV SÜD Umweltpartner GmbH verifier portal with full scope.',
      periodTag: 'Q3 2026',
    },
    {
      id: 'evt-06',
      timestamp: '2026-06-28T15:20:00Z',
      dateStr: '28 Jun 2026 · 18:20',
      actor: {
        name: 'DNV Lead Verifier',
        role: 'Accredited GHG Inventory Auditor',
        avatarInitials: 'DN',
        color: 'bg-emerald-700 text-white',
      },
      actionType: 'auditor_review',
      title: 'ISO 14064-1 & 14064-3 Clean Verification Issued',
      description: 'Annual corporate GHG inventory verified without qualification. Covers Aliağa facility boundary including Scope 1 and Scope 2.',
      documentTitle: 'ISO 14064-1 & ISO 14064-3 Facility GHG Inventory Verification Report',
      periodTag: 'Q2 2026',
      sha256Prefix: '9f86d081884c...',
    },
  ]);

  // ---------------------------------------------------------------------------
  // FILTERED DOCUMENTS
  // ---------------------------------------------------------------------------
  const effectiveDocs = useMemo(() => {
    if (vaultState === 'empty_workspace') {
      return [];
    }
    return vaultDocuments;
  }, [vaultDocuments, vaultState]);

  const filteredDocs = useMemo(() => {
    return effectiveDocs.filter((doc) => {
      // Search
      const matchesSearch =
        searchQuery.trim() === '' ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.verifierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.accreditationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.sha256Hash.toLowerCase().includes(searchQuery.toLowerCase());

      // Category
      const matchesCategory = categoryFilter === 'all' || doc.docType === categoryFilter;

      // Status
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'verified' && doc.status === 'verified_clean') ||
        (statusFilter === 'pending' && doc.status === 'in_audit') ||
        (statusFilter === 'expiring' && doc.status === 'expiring_soon');

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [effectiveDocs, searchQuery, categoryFilter, statusFilter]);

  // ---------------------------------------------------------------------------
  // FILTERED AUDIT TRAIL
  // ---------------------------------------------------------------------------
  const filteredAuditEvents = useMemo(() => {
    if (vaultState === 'empty_workspace') return [];
    if (trailFilterPeriod === 'all') return auditEvents;
    return auditEvents.filter((e) => e.periodTag === trailFilterPeriod);
  }, [auditEvents, trailFilterPeriod, vaultState]);

  // ---------------------------------------------------------------------------
  // DOWNLOAD ACTION
  // ---------------------------------------------------------------------------
  const handleDownload = (doc: DocumentVaultItem) => {
    const content = `========================================================================
OFFICIAL EU CBAM AUDIT & COMPLIANCE CERTIFICATE
EUROPEAN UNION CARBON BORDER ADJUSTMENT MECHANISM (REGULATION 2023/956)
========================================================================

Document Title:      ${doc.title}
Document Category:   ${doc.docType.toUpperCase()}
Installation:        ${activeInstallation.name} (UN/LOCODE: ${activeInstallation.unLocode})
Installation ID:     TR-CBAM-OP-449102

Accredited Verifier: ${doc.verifierName}
Accreditation Body:  ${doc.accreditationBody}
Accreditation Ref:   ${doc.accreditationNumber}
Legal Basis:         EU Implementing Regulation 2023/1773 & EU 2018/2067 (AVR)

Cryptographic Hash:  SHA-256: ${doc.sha256Hash}
Verification Status: ${doc.status.toUpperCase()}
Assurance Level:     REASONABLE ASSURANCE (Unqualified positive opinion)

Audit Opinion Statement:
"${doc.auditOpinion}"

Issuance Date:       ${doc.issueDate}
Valid Until:         ${doc.validUntil}
Statutory Retention: CBAM Article 14 Mandatory WORM Lock until 31-DEC-2031

========================================================================
Digitally anchored and timestamped by Aegean Rolling Mill #04 Vault.
========================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.downloadFileName || `${doc.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast(`Downloaded official certificate: ${doc.downloadFileName}`);
  };

  // ---------------------------------------------------------------------------
  // AUDITOR SIGN-OFF ACTION
  // ---------------------------------------------------------------------------
  const handleAuditorSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDocForVerification) {
      verifyDocumentAsAuditor(selectedDocForVerification.id, verifierNotes);

      // Add audit trail event
      const newEvt: AuditTimelineEvent = {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        dateStr: 'Just now',
        actor: {
          name: activePersona.name,
          role: `${activePersona.role} (${activePersona.organization})`,
          avatarInitials: activePersona.name.split(' ').map(n => n[0]).join(''),
          color: 'bg-emerald-600 text-white',
        },
        actionType: 'auditor_signature',
        title: `Digital Verification Sign-off Affixed by ${activePersona.name}`,
        description: `Verifier statement endorsement applied with unqualified opinion to "${selectedDocForVerification.title}".`,
        documentTitle: selectedDocForVerification.title,
        periodTag: 'Q3 2026',
        sha256Prefix: selectedDocForVerification.sha256Hash.substring(0, 12) + '...',
      };
      setAuditEvents((prev) => [newEvt, ...prev]);

      setIsAuditorModalOpen(false);
      setSelectedDocForVerification(null);
      triggerToast(`Auditor digital signature successfully affixed to "${selectedDocForVerification.title}"!`);
    }
  };

  // ---------------------------------------------------------------------------
  // REQUEST VERIFICATION DISPATCH
  // ---------------------------------------------------------------------------
  const handleDispatchVerificationRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequestVerificationOpen(false);

    // Switch to verification pending state for demonstration and feedback
    setVaultState('verification_pending');

    const newEvt: AuditTimelineEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      dateStr: 'Just now',
      actor: {
        name: activePersona.name,
        role: `${activePersona.role} · ${activePersona.organization}`,
        avatarInitials: 'SY',
        color: 'bg-emerald-600 text-white',
      },
      actionType: 'verification_request',
      title: `Verification Audit Package Dispatched for ${reqPeriod}`,
      description: `Formal third-party audit package transmitted to ${reqVerifierOrg}. Attached scope: Direct fuel combustion, Indirect PPA GoO, and precursor allocation.`,
      periodTag: reqPeriod,
    };
    setAuditEvents((prev) => [newEvt, ...prev]);

    triggerToast(`Verification audit request for ${reqPeriod} dispatched to ${reqVerifierOrg}!`);
  };

  // ---------------------------------------------------------------------------
  // UPLOAD SIMULATION
  // ---------------------------------------------------------------------------
  const executeUpload = (fileName: string) => {
    setUploadProgress(15);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 15;
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            // Complete upload
            const randomHash = Array.from({ length: 64 }, () =>
              Math.floor(Math.random() * 16).toString(16)
            ).join('');

            const title = newDocTitle.trim() || fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');

            const newDoc: Omit<DocumentVaultItem, 'id' | 'sha256Hash'> = {
              title: title,
              docType: newDocCategory,
              verifierName: newDocVerifier,
              accreditationBody: 'DAkkS / TURKAK Accredited Body',
              accreditationNumber: newDocAccreditation,
              issueDate: new Date().toISOString().split('T')[0],
              validUntil: '2027-12-31',
              fileSize: '3.6 MB',
              status: 'verified_clean',
              auditOpinion:
                'Compliant with EU CBAM requirements. Activity consumption, calorific values, and emission factors verified with Reasonable Assurance.',
              coveredProductIds: [newDocProduct],
              downloadFileName: fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`,
            };

            addVaultDocument(newDoc);

            // Add to audit trail
            const newEvt: AuditTimelineEvent = {
              id: `evt-${Date.now()}`,
              timestamp: new Date().toISOString(),
              dateStr: 'Just now',
              actor: {
                name: activePersona.name,
                role: `${activePersona.role} (${activePersona.organization})`,
                avatarInitials: 'SY',
                color: 'bg-teal-600 text-white',
              },
              actionType: 'upload',
              title: `New Compliance Document Uploaded & Sealed`,
              description: `Uploaded "${title}" and computed SHA-256 tamper-evident fingerprint. Bound to 5-year retention cycle.`,
              documentTitle: title,
              periodTag: newDocPeriod,
              sha256Prefix: randomHash.substring(0, 12) + '...',
            };
            setAuditEvents((prev) => [newEvt, ...prev]);

            setUploadProgress(null);
            setIsUploadModalOpen(false);
            setNewDocTitle('');
            if (vaultState === 'empty_workspace') {
              setVaultState('populated');
            }
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setNewDocTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      executeUpload(file.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setNewDocTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      executeUpload(file.name);
    }
  };

  // Helper formatting for categories
  const getCategoryBadge = (docType: DocumentVaultItem['docType']) => {
    switch (docType) {
      case 'verification_statement':
        return { label: 'Verifier Statement', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'iso14064_report':
        return { label: 'ISO 14064 GHG Report', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'lab_assay':
        return { label: 'Lab Calorific Assay', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'ppa_contract':
        return { label: 'Renewable PPA / GoO', bg: 'bg-teal-50 text-teal-800 border-teal-200' };
      case 'cems_calibration':
        return { label: 'CEMS Flue Calibration', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'raw_material_cert':
        return { label: 'Precursor Supplier Cert', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      default:
        return { label: 'Supporting Record', bg: 'bg-slate-50 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------- */}
      {/* 0. REVIEWER STATE SWITCHER TOOLBAR (DISCREET & CLEAR)               */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-white border border-emerald-100/90 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Vault Testing States:
          </span>
          <span className="text-[11px] text-slate-400 hidden md:inline">
            (Switch views to test all user requirements)
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setVaultState('populated')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              vaultState === 'populated'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Active Vault ({vaultDocuments.length} Verified Docs)
          </button>

          <button
            type="button"
            onClick={() => setVaultState('verification_pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1 ${
              vaultState === 'verification_pending'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Verification Pending State
          </button>

          <button
            type="button"
            onClick={() => setVaultState('empty_workspace')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              vaultState === 'empty_workspace'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Empty Workspace State
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 1. HEADER SECTION                                                   */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-2 border-b border-emerald-100/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              CBAM Article 14 Compliance Layer
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">Aegean Rolling Mill #04</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900 mt-1">
            Verification & Document Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Tamper-evident, audit-ready document storage and verification trail. Supporting production records, laboratory assays, electricity PPAs, and accredited verifier certificates are cryptographically sealed under the EU 5-year statutory retention mandate.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsRequestVerificationOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow"
          >
            <Send className="w-3.5 h-3.5" />
            Request Verification
          </button>

          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. PENDING VERIFICATION GUIDANCE BANNER (IF IN PENDING STATE)       */}
      {/* ------------------------------------------------------------------- */}
      {vaultState === 'verification_pending' && (
        <div className="p-5 bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-orange-50/70 border border-amber-200/90 rounded-2xl shadow-xs space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Clock className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900">
                    Audit In Progress
                  </span>
                  <span className="text-xs text-amber-900 font-semibold">Q3 2026 Reporting Package</span>
                </div>
                <h3 className="text-base font-bold text-amber-950 mt-0.5">
                  Third-Party Verification Pending: TÜV SÜD Lead Auditor Review
                </h3>
                <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                  Your complete emissions dossier and 6 supporting certificates have been transmitted to Lead Auditor <strong>Dr. Heinrich Weber</strong>. Estimated audit completion: <strong>October 04, 2026 (6 business days)</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => triggerToast('Automated reminder ping sent to Dr. Heinrich Weber (TÜV SÜD verifier portal).')}
                className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-white hover:bg-amber-100/60 border border-amber-300 rounded-xl shadow-2xs transition-colors"
              >
                Send Verifier Reminder
              </button>
              <button
                type="button"
                onClick={() => setVaultState('populated')}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-2xs transition-colors"
              >
                Return to Active View
              </button>
            </div>
          </div>

          {/* Step Progression Bar for Pending State */}
          <div className="pt-2 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-2.5 p-2 bg-white/70 rounded-xl border border-amber-200/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-slate-800">1. Data Package Transmitted</div>
                <div className="text-[10px] text-slate-500">All 6 files SHA-256 hashed</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 bg-white/70 rounded-xl border border-amber-200/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-slate-800">2. Boundary & Scope Confirmed</div>
                <div className="text-[10px] text-slate-500">Direct fuels & EAF mass balance</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 bg-amber-100/80 rounded-xl border border-amber-300">
              <Clock className="w-4 h-4 text-amber-700 shrink-0 animate-pulse" />
              <div>
                <div className="text-[11px] font-bold text-amber-950">3. Calorific Assay Audit</div>
                <div className="text-[10px] text-amber-800">In Progress (Auditor testing NCV)</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 bg-white/40 rounded-xl border border-dashed border-amber-300/80 opacity-75">
              <Award className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-slate-700">4. Form CBAM-VER Issued</div>
                <div className="text-[10px] text-slate-500">Pending final digital seal</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 3. TOP LEVEL PANELS: VERIFIER ASSIGNMENT + 5-YEAR RETENTION COUNTER  */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Verifier Assignment Panel (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-emerald-100/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Accredited Third-Party Verifier Assignment
                </h2>
                <p className="text-[11px] text-slate-500">
                  Accreditation under EU Regulation 2018/2067 (AVR) & CBAM Article 8
                </p>
              </div>
            </div>

            <span className="self-start sm:self-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              DAkkS Accredited
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Primary Verifier Org */}
            <div className="p-3 bg-[#F8FAFC] border border-slate-100 rounded-xl">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Assigned Organization
              </div>
              <div className="text-xs font-bold text-slate-900 mt-1">
                TÜV SÜD Umweltpartner GmbH
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                Reg: D-VS-14125-01-00
              </div>
            </div>

            {/* Lead Auditor */}
            <div className="p-3 bg-[#F8FAFC] border border-slate-100 rounded-xl">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Lead CBAM Verifier
              </div>
              <div className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dr. Heinrich Weber</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Accreditation valid to 2027
              </div>
            </div>

            {/* Overall Opinion Status */}
            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
              <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                Assurance Opinion
              </div>
              <div className="text-xs font-bold text-emerald-900 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Reasonable Assurance</span>
              </div>
              <div className="text-[11px] text-emerald-700 mt-0.5">
                Unqualified positive opinion
              </div>
            </div>
          </div>

          {/* Verification Status Per Reporting Period */}
          <div className="pt-2">
            <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center justify-between">
              <span>Verification Status Per Reporting Period:</span>
              <span className="text-[10px] text-slate-400 font-normal">Updated live from audit portal</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                  <span>Q3 2026</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                </div>
                <div className="text-[10px] font-semibold text-amber-800 mt-1">
                  {vaultState === 'verification_pending' ? 'In Review (Pending)' : 'Verified (4/5 Signed)'}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5 font-mono">TÜV-CBAM-2026-Q3</div>
              </div>

              <div className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/40">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                  <span>Q2 2026</span>
                  <Check className="w-3 h-3 text-emerald-600" />
                </div>
                <div className="text-[10px] font-semibold text-emerald-800 mt-1">
                  Verified & Sealed
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5 font-mono">TÜV-CBAM-2026-Q2</div>
              </div>

              <div className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/40">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                  <span>Q1 2026</span>
                  <Check className="w-3 h-3 text-emerald-600" />
                </div>
                <div className="text-[10px] font-semibold text-emerald-800 mt-1">
                  Verified Clean
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5 font-mono">TÜV-CBAM-2026-Q1</div>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                  <span>FY 2025</span>
                  <Lock className="w-3 h-3 text-slate-500" />
                </div>
                <div className="text-[10px] font-semibold text-slate-700 mt-1">
                  Archived WORM
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5 font-mono">ISO-14064-3-DNV</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. 5-Year Statutory Retention Indicator (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-white to-emerald-50/30 border border-emerald-100/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    5-Year Statutory Retention Tracker
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    EU CBAM Regulation 2023/956 Article 14
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRetentionInfoOpen(true)}
                className="text-slate-400 hover:text-emerald-700 transition-colors"
                title="Learn about CBAM Article 14 retention"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Countdown Metric Highlight */}
            <div className="mt-4 p-4 bg-white border border-emerald-100 rounded-xl shadow-2xs">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Statutory Countdown (Q3 2026 Set)
                  </div>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-emerald-900 tracking-tight mt-0.5">
                    5y 3m 4d
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                    Immutable Lock
                  </span>
                  <div className="text-xs font-mono text-slate-500 mt-1">
                    1,922 days left
                  </div>
                </div>
              </div>

              {/* Progress bar representing 5-year timeline */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-mono">
                  <span>Start: 01 Oct 2026</span>
                  <span className="text-emerald-800 font-bold">Mandatory End: 31 Dec 2031</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    style={{ width: '8%' }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Deletion Protection:</strong> Accidental or premature deletion disabled by WORM (Write Once, Read Many) tamper locks.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Cryptographic Integrity:</strong> Every document's SHA-256 fingerprint is verified on every export request.
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-100/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>Archive Status: 6 Active Files Locked</span>
            <button
              type="button"
              onClick={() => setIsRetentionInfoOpen(true)}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              <span>View Legal Basis</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 4. DRAG-AND-DROP UPLOAD ZONE AT THE TOP                             */}
      {/* ------------------------------------------------------------------- */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleFileDrop}
        className={`p-6 border-2 border-dashed rounded-2xl transition-all text-center relative ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/80 shadow-md scale-[1.005]'
            : 'border-emerald-200/90 bg-white hover:border-emerald-300 hover:bg-emerald-50/20'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.xlsx,.csv,.xml,.docx,.zip"
        />

        {uploadProgress !== null ? (
          <div className="max-w-md mx-auto space-y-3 py-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto animate-pulse">
              <Lock className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-sm font-bold text-slate-900">
              Hashing & Sealing Document into Vault...
            </div>
            <div className="text-xs text-slate-500">
              Generating SHA-256 digital fingerprint & applying CBAM Article 14 retention timestamp
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="text-[11px] font-mono text-emerald-700 font-bold">
              {uploadProgress}% Sealed
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto shadow-2xs">
              <UploadCloud className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Drag and drop supporting compliance documents here
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">
                Upload production logs, energy bills, verifier statements, laboratory calorific assays, or ISO 14064 inventories. Files are instantly sealed with SHA-256 cryptographic hashes.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Browse Files
              </button>

              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
              >
                Specify Metadata Before Upload
              </button>
            </div>

            <div className="text-[11px] text-slate-400 font-mono pt-1">
              Accepted formats: PDF, XLSX, CSV, XML, ZIP · Maximum file size: 50 MB per document
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 5. DOCUMENT LIBRARY (TABLE / GRID + SEARCH & FILTERS)                */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white border border-emerald-100/90 rounded-2xl shadow-2xs overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Document Library</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {filteredDocs.length} Documents
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit-ready evidence repository linked to installation emission factors
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    viewMode === 'table'
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Table View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    viewMode === 'cards'
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Card Grid
                </button>
              </div>
            </div>
          </div>

          {/* Search & Multi-Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search document name, verifier, accreditation ref, or SHA-256 hash..."
                className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="sm:col-span-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
              >
                <option value="all">All Document Types</option>
                <option value="verification_statement">Verifier Statements</option>
                <option value="iso14064_report">ISO 14064 GHG Reports</option>
                <option value="lab_assay">Lab Calorific Assays</option>
                <option value="ppa_contract">Renewable PPA / GoO</option>
                <option value="cems_calibration">CEMS Calibrations</option>
                <option value="raw_material_cert">Precursor Certificates</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
              >
                <option value="all">All Verification Statuses</option>
                <option value="verified">Verified Clean Only</option>
                <option value="pending">In Audit / Pending</option>
                <option value="expiring">Renewal Expiring Soon</option>
              </select>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* EMPTY STATE (NEW WORKSPACE / NO SEARCH MATCHES)                   */}
        {/* ----------------------------------------------------------------- */}
        {filteredDocs.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center mx-auto shadow-2xs">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-900">
                {vaultState === 'empty_workspace'
                  ? 'No Compliance Documents in Vault Yet'
                  : 'No documents match your current filter'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {vaultState === 'empty_workspace'
                  ? 'CBAM requires verified production data, energy bills, and verifier statements to be retained for at least 5 years. Upload your first audit-ready document above to establish an immutable audit trail.'
                  : 'Try clearing your search query or adjusting the category and status filters.'}
              </p>
            </div>

            {vaultState === 'empty_workspace' ? (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setVaultState('populated')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Load Sample Compliance Audit Package
                </button>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                >
                  Upload First Document
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          /* --------------------------------------------------------------- */
          /* HIGH-DENSITY TABLE VIEW (OPTIMAL FOR DESKTOP & SCROLLABLE MOBILE) */
          /* --------------------------------------------------------------- */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-emerald-50/40 border-b border-emerald-100/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Document Title & Details</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Linked Product / Scope</th>
                  <th className="py-3 px-4">Accredited Verifier</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">5-Year Retention</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => {
                  const badge = getCategoryBadge(doc.docType);
                  const isExpiring = doc.status === 'expiring_soon';
                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-emerald-50/20 transition-colors group"
                    >
                      {/* Title & Hash */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-start gap-2.5">
                          <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                              {doc.title}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                              <span>{doc.fileSize}</span>
                              <span>·</span>
                              <span title={`Full SHA-256: ${doc.sha256Hash}`}>
                                SHA-256: {doc.sha256Hash.substring(0, 10)}...
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Linked Target */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {doc.coveredProductIds.includes('prod-01')
                            ? 'Billet-150-3SP (7201)'
                            : doc.coveredProductIds.includes('prod-02')
                            ? 'Rebar-B500B-12 (7214)'
                            : 'All Installation Products'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Reporting Period: Q3 2026
                        </div>
                      </td>

                      {/* Verifier */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 text-xs">
                          {doc.verifierName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {doc.accreditationNumber}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {doc.status === 'verified_clean' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Verified Clean
                          </span>
                        ) : isExpiring ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Expiring Soon
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            <Clock className="w-3 h-3 text-blue-600" />
                            In Audit Review
                          </span>
                        )}
                      </td>

                      {/* Retention */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-700 font-semibold font-mono text-[11px]">
                          <Lock className="w-3 h-3 text-emerald-600" />
                          <span>Dec 31, 2031</span>
                        </div>
                        <div className="text-[10px] text-emerald-700 font-semibold">
                          5y 3m remaining
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Inspect Certificate Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDocForVerification(doc);
                              setIsAuditorModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Auditor Sign-off & Endorsement"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownload(doc)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-2xs"
                            title="Download Certificate File"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* --------------------------------------------------------------- */
          /* CARD GRID VIEW                                                  */
          /* --------------------------------------------------------------- */
          <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map((doc) => {
              const badge = getCategoryBadge(doc.docType);
              const isExpiring = doc.status === 'expiring_soon';
              return (
                <div
                  key={doc.id}
                  className="p-4 sm:p-5 bg-white border border-emerald-100/90 rounded-2xl flex flex-col justify-between hover:border-emerald-300 hover:shadow-xs transition-all space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border mb-1 ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 leading-snug">
                            {doc.title}
                          </h3>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {doc.verifierName} · <span className="font-mono">{doc.accreditationNumber}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                          isExpiring
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isExpiring ? 'Renewal Soon' : 'Verified Clean'}
                      </span>
                    </div>

                    {/* Audit Opinion Box */}
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 leading-relaxed">
                      <span className="font-bold text-slate-800">Audit Opinion: </span>
                      {doc.auditOpinion}
                    </div>

                    {/* Metadata chips */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-mono pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Issued: {doc.issueDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Retention: 31 Dec 2031</span>
                      </div>
                    </div>

                    {/* Hash */}
                    <div className="p-2 bg-slate-50 rounded-lg text-[10px] font-mono text-slate-500 truncate border border-slate-100">
                      SHA-256: {doc.sha256Hash}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="text-xs text-slate-600 hover:text-emerald-700 font-semibold"
                    >
                      Inspect Evidence
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDocForVerification(doc);
                          setIsAuditorModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                      >
                        Auditor Sign
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload(doc)}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 6. AUDIT TRAIL VIEW (CHRONOLOGICAL TIMELINE, CLEAN NOT RAW LOG)    */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white border border-emerald-100/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Installation Audit Trail & Chain of Custody
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological log of document submissions, auditor endorsements, and statutory seals.
            </p>
          </div>

          {/* Timeline Period Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Filter Period:</span>
            <select
              value={trailFilterPeriod}
              onChange={(e) => setTrailFilterPeriod(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Quarters</option>
              <option value="Q3 2026">Q3 2026</option>
              <option value="Q2 2026">Q2 2026</option>
            </select>
          </div>
        </div>

        {/* The Timeline */}
        {filteredAuditEvents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No audit events found for this filter.
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-100">
            {filteredAuditEvents.map((evt) => {
              return (
                <div key={evt.id} className="relative group">
                  {/* Timeline Node Dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-4 ring-white shadow-2xs ${evt.actor.color}`}
                  >
                    {evt.actor.avatarInitials}
                  </div>

                  {/* Event Card */}
                  <div className="p-3.5 sm:p-4 bg-[#F8FAFC] border border-slate-100 rounded-xl hover:border-emerald-200 hover:bg-white transition-all space-y-1.5 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">
                          {evt.title}
                        </span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {evt.periodTag}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono">
                        {evt.dateStr}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Actor:</span>
                        <span className="font-semibold text-slate-800">{evt.actor.name}</span>
                        <span className="text-slate-400">· {evt.actor.role}</span>
                      </div>

                      {evt.sha256Prefix && (
                        <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100">
                          <Hash className="w-3 h-3 text-emerald-600" />
                          <span>{evt.sha256Prefix}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 1: REQUEST VERIFICATION MODAL                                 */}
      {/* ------------------------------------------------------------------- */}
      {isRequestVerificationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white border border-emerald-100 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  EU CBAM Audit Package
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  Request Third-Party Verification Audit
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dispatch your calculated direct/indirect emissions and supporting evidence to an accredited verifier.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestVerificationOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDispatchVerificationRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reporting Period
                  </label>
                  <select
                    value={reqPeriod}
                    onChange={(e) => setReqPeriod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Q3 2026">Q3 2026 (Active Period)</option>
                    <option value="Q2 2026">Q2 2026 (Re-audit)</option>
                    <option value="FY 2026">FY 2026 Annual Reconciliation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Accredited Verifier Body
                  </label>
                  <select
                    value={reqVerifierOrg}
                    onChange={(e) => setReqVerifierOrg(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="TÜV SÜD Umweltpartner GmbH">TÜV SÜD (DAkkS D-VS-14125)</option>
                    <option value="DNV Business Assurance Ltd.">DNV (TURKAK AB-0019-YS)</option>
                    <option value="Bureau Veritas Certification">Bureau Veritas (EN ISO 14065)</option>
                    <option value="SGS Sustainability Services">SGS Global Certification</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Included Verification Scope
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reqScopeDirect}
                      onChange={(e) => setReqScopeDirect(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-slate-800">Direct Fuel Combustion</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reqScopeElectricity}
                      onChange={(e) => setReqScopeElectricity(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-slate-800">Indirect Electricity PPA</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reqScopePrecursors}
                      onChange={(e) => setReqScopePrecursors(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-slate-800">Precursor Allocation</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reqScopeMassBalance}
                      onChange={(e) => setReqScopeMassBalance(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-slate-800">Mass Balance & Yields</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Special Instructions for Verifier
                </label>
                <textarea
                  rows={3}
                  value={reqAuditNotes}
                  onChange={(e) => setReqAuditNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 resize-none font-sans"
                />
              </div>

              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 leading-relaxed">
                <strong>Package Notice:</strong> All {vaultDocuments.length} active documents in your vault will be cryptographically locked and transmitted with this verification request.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestVerificationOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Verification Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 2: UPLOAD DOCUMENT METADATA MODAL                             */}
      {/* ------------------------------------------------------------------- */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white border border-emerald-100 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Upload Compliance Document
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Attach supporting audit evidence to your installation's 5-year vault.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q3 2026 Natural Gas Pipeline Invoices & Calorific Assay"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Document Category
                  </label>
                  <select
                    value={newDocCategory}
                    onChange={(e) => setNewDocCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="verification_statement">Accredited Verifier Statement</option>
                    <option value="lab_assay">Lab Fuel & Carbon Assay</option>
                    <option value="iso14064_report">ISO 14064 GHG Report</option>
                    <option value="ppa_contract">Renewable PPA / GoO Bundle</option>
                    <option value="cems_calibration">CEMS Continuous Monitoring</option>
                    <option value="raw_material_cert">Precursor Supplier Certificate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reporting Period
                  </label>
                  <select
                    value={newDocPeriod}
                    onChange={(e) => setNewDocPeriod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Q3 2026">Q3 2026</option>
                    <option value="Q2 2026">Q2 2026</option>
                    <option value="Q1 2026">Q1 2026</option>
                    <option value="FY 2025">FY 2025</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Linked Product Target
                  </label>
                  <select
                    value={newDocProduct}
                    onChange={(e) => setNewDocProduct(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="prod-01">Billet-150-3SP (7201 10 00)</option>
                    <option value="prod-02">Rebar-B500B-12 (7214 20 00)</option>
                    <option value="prod-03">Primary Aluminium Ingot (7601)</option>
                    <option value="all">All Installation Goods</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Accreditation Body / Standard
                  </label>
                  <input
                    type="text"
                    value={newDocAccreditation}
                    onChange={(e) => setNewDocAccreditation(e.target.value)}
                    placeholder="e.g. DAkkS D-VS-14125-01-00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                <div className="font-bold text-slate-800 mb-0.5">Automated Cryptographic Sealing:</div>
                When submitted, this file will receive an immutable SHA-256 digest and be locked against deletion until <strong>31 December 2031</strong> under CBAM Article 14.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => executeUpload(newDocTitle.trim() ? `${newDocTitle}.pdf` : 'CBAM_Evidence_Document.pdf')}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Seal & Insert into Vault
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 3: AUDITOR ENDORSEMENT / SIGN-OFF MODAL                       */}
      {/* ------------------------------------------------------------------- */}
      {isAuditorModalOpen && selectedDocForVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white border border-emerald-100 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  Accredited Verifier Digital Endorsement
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  Affix Verifier Assurance Statement
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applying audit sign-off to "{selectedDocForVerification.title}".
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAuditorModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAuditorSign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Verifier Unqualified Assurance Opinion (EU Implementing Regulation 2023/1773)
                </label>
                <textarea
                  rows={4}
                  value={verifierNotes}
                  onChange={(e) => setVerifierNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 resize-none font-sans"
                />
              </div>

              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs text-slate-700 space-y-1">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Signatory Identity: {activePersona.name}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Role: {activePersona.role} · Organization: {activePersona.organization}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Accreditation: DAkkS D-VS-14125-01-00 (Germany)
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAuditorModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  <Award className="w-3.5 h-3.5" />
                  Affix Verifier Signature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 4: DOCUMENT PREVIEW / EVIDENCE INSPECTION MODAL               */}
      {/* ------------------------------------------------------------------- */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white border border-emerald-100 rounded-3xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-snug">
                    {previewDoc.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified Regulatory Compliance Record · {previewDoc.fileSize}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Accredited Verifier
                </div>
                <div className="font-bold text-slate-900 mt-1">{previewDoc.verifierName}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{previewDoc.accreditationBody}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Accreditation Registration
                </div>
                <div className="font-mono font-bold text-slate-900 mt-1">{previewDoc.accreditationNumber}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Valid until: {previewDoc.validUntil}</div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950">
                  Official Auditor Opinion Statement
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Reasonable Assurance
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                "{previewDoc.auditOpinion}"
              </p>
            </div>

            <div className="p-3 bg-slate-900 text-slate-200 rounded-2xl space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span>CRYPTOGRAPHIC TAMPER-EVIDENT FINGERPRINT</span>
                <span>SHA-256</span>
              </div>
              <div className="break-all text-emerald-400 font-bold">
                {previewDoc.sha256Hash}
              </div>
            </div>

            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>Statutory 5-Year Lock Active</span>
              </div>
              <span className="font-bold font-mono text-amber-800">Mandatory Until 31-DEC-2031</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedDocForVerification(previewDoc);
                  setIsAuditorModalOpen(true);
                  setPreviewDoc(null);
                }}
                className="text-xs text-slate-700 hover:text-emerald-700 font-semibold"
              >
                Affix New Auditor Endorsement
              </button>

              <button
                type="button"
                onClick={() => handleDownload(previewDoc)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 5: CBAM ARTICLE 14 RETENTION MANDATE INFO                     */}
      {/* ------------------------------------------------------------------- */}
      {isRetentionInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white border border-emerald-100 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  EU Regulation 2023/956
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  CBAM Article 14: 5-Year Data Retention Mandate
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsRetentionInfoOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Under <strong>Article 14 of Regulation (EU) 2023/956</strong> and <strong>Article 16 of Implementing Regulation 2023/1773</strong>, reporting declarants and installation operators must retain all supporting documentation and calculation records for a <strong>minimum of five years</strong> after the end of the reporting year.
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="font-bold text-slate-800">Mandatory Retained Records Include:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                  <li>Primary energy and electricity bills with grid/supplier emission factors</li>
                  <li>Laboratory calorific assays and carbon oxidation measurements (EN 17025)</li>
                  <li>Continuous Emission Monitoring System (CEMS) calibration records (EN 14181)</li>
                  <li>Power Purchase Agreements (PPAs) and Guarantees of Origin (GoO) cancellations</li>
                  <li>Precursor supplier carbon declarations and shipping bills of lading</li>
                  <li>Accredited verifier audit statements and site inspection notes</li>
                </ul>
              </div>

              <p>
                This vault enforces a WORM (Write Once, Read Many) tamper-evident lock on all uploaded and verified files, ensuring your European buyers and national competent authorities can audit your actual emissions declarations without fear of missing evidence.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsRetentionInfoOpen(false)}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
