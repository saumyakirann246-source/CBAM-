import React, { useState, useMemo } from 'react';
import { useCbam } from '../context/CbamContext';
import { mockInstallations } from '../data/mockCbamData';
import { InstallationFacility } from '../types/cbam';
import {
  Building2,
  Users,
  ShieldCheck,
  CreditCard,
  Plus,
  Mail,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Eye,
  Edit3,
  Trash2,
  Archive,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Download,
  Check,
  X,
  FileText,
  Clock,
  Layers,
  Factory,
  Globe,
  MoreVertical,
  ChevronRight,
  UserPlus,
  Key,
  Shield,
  Zap,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface TeamDivisionViewProps {
  onNavigateStep?: (stepId: string) => void;
}

export type SettingsTab = 'divisions' | 'team' | 'permissions' | 'billing';
export type AdminDemoState = 'standard' | 'empty_team' | 'plan_limit_reached';

export interface DivisionRecord {
  id: string;
  name: string;
  code: string;
  unLocode: string;
  country: string;
  countryCode: string;
  sector: string;
  sectorLabel: string;
  annualCapacityTons: string;
  complianceStatus: 'compliant' | 'at_risk' | 'pending';
  statusLabel: string;
  activeProductsCount: number;
  assignedUsersCount: number;
  isArchived: boolean;
  registeredDate: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'compliance_officer' | 'engineer' | 'verifier' | 'viewer';
  roleLabel: string;
  divisionAccess: string[]; // division IDs or ['all']
  status: 'active' | 'pending_invite';
  inviteExpiresInDays?: number;
  lastActive: string;
  avatarText: string;
  avatarBg: string;
}

export interface InvoiceRecord {
  id: string;
  date: string;
  amount: string;
  period: string;
  status: 'paid' | 'pending';
  planName: string;
  downloadUrl?: string;
}

export const TeamDivisionView: React.FC<TeamDivisionViewProps> = ({ onNavigateStep }) => {
  const { activeInstallation, triggerToast, setActiveInstallation } = useCbam();

  // Top Tabs: Divisions, Team, Roles & Permissions, Billing
  const [activeTab, setActiveTab] = useState<SettingsTab>('divisions');

  // Reviewer Demo State: standard vs empty_team vs plan_limit_reached
  const [demoState, setDemoState] = useState<AdminDemoState>('standard');

  // Search & Filter States
  const [divisionSearch, setDivisionSearch] = useState<string>('');
  const [divisionFilter, setDivisionFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [teamSearch, setTeamSearch] = useState<string>('');
  const [teamRoleFilter, setTeamRoleFilter] = useState<string>('all');

  // Modal States
  const [isAddDivisionModalOpen, setIsAddDivisionModalOpen] = useState<boolean>(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [isPlanLimitAlertOpen, setIsPlanLimitAlertOpen] = useState<boolean>(false);
  const [editingDivision, setEditingDivision] = useState<DivisionRecord | null>(null);

  // New Division Form
  const [newDivName, setNewDivName] = useState<string>('');
  const [newDivCode, setNewDivCode] = useState<string>('');
  const [newDivLocode, setNewDivLocode] = useState<string>('');
  const [newDivCountry, setNewDivCountry] = useState<string>('Turkey');
  const [newDivSector, setNewDivSector] = useState<string>('Iron & Steel (CN 72xx, 73xx)');
  const [newDivCapacity, setNewDivCapacity] = useState<string>('850,000 t');

  // New Team Member Form
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [newMemberEmail, setNewMemberEmail] = useState<string>('');
  const [newMemberRole, setNewMemberRole] = useState<TeamMember['role']>('compliance_officer');
  const [newMemberDivisions, setNewMemberDivisions] = useState<string[]>(['div-01']);

  // Initial Divisions Data (Matching STEP 1 multi-tenant hierarchy)
  const [divisions, setDivisions] = useState<DivisionRecord[]>([
    {
      id: 'div-01',
      name: 'Aegean Rolling Mill #04',
      code: 'VANG-AEG-04',
      unLocode: 'TRIST-004',
      country: 'Turkey',
      countryCode: 'TR',
      sector: 'iron_steel',
      sectorLabel: 'Iron & Steel (CN 72xx, 73xx)',
      annualCapacityTons: '1,200,000 t',
      complianceStatus: 'compliant',
      statusLabel: 'Q3 Verified & Ready',
      activeProductsCount: 4,
      assignedUsersCount: 5,
      isArchived: false,
      registeredDate: '2025-01-15',
    },
    {
      id: 'div-02',
      name: 'Anatolia Light Metals & Smelting #02',
      code: 'VANG-ANA-02',
      unLocode: 'TRBUR-012',
      country: 'Turkey',
      countryCode: 'TR',
      sector: 'aluminium',
      sectorLabel: 'Aluminium (CN 76xx)',
      annualCapacityTons: '480,000 t',
      complianceStatus: 'at_risk',
      statusLabel: 'Default Markup Active',
      activeProductsCount: 2,
      assignedUsersCount: 3,
      isArchived: false,
      registeredDate: '2025-03-20',
    },
    {
      id: 'div-03',
      name: 'Levant Technical Clinker & Cement',
      code: 'VANG-LEV-01',
      unLocode: 'EGPSD-002',
      country: 'Egypt',
      countryCode: 'EG',
      sector: 'cement',
      sectorLabel: 'Cement (CN 2523)',
      annualCapacityTons: '2,100,000 t',
      complianceStatus: 'pending',
      statusLabel: 'Lab Assay Pending',
      activeProductsCount: 1,
      assignedUsersCount: 2,
      isArchived: false,
      registeredDate: '2025-06-10',
    },
    {
      id: 'div-04',
      name: 'Gulf Clean Nitrogen & Ammonia',
      code: 'VANG-GLF-03',
      unLocode: 'SAJUB-091',
      country: 'Saudi Arabia',
      countryCode: 'SA',
      sector: 'fertiliser',
      sectorLabel: 'Fertilisers (CN 2814, 3102)',
      annualCapacityTons: '650,000 t',
      complianceStatus: 'compliant',
      statusLabel: '1.01 Statutory Rate Verified',
      activeProductsCount: 1,
      assignedUsersCount: 3,
      isArchived: false,
      registeredDate: '2025-09-01',
    },
  ]);

  // Initial Team Members Data
  const initialTeamMembers: TeamMember[] = [
    {
      id: 'user-01',
      name: 'Dr. Elena Rostova',
      email: 'elena.rostova@vanguard-metals.com',
      role: 'admin',
      roleLabel: 'Admin / Account Owner',
      divisionAccess: ['all'],
      status: 'active',
      lastActive: 'Active now',
      avatarText: 'ER',
      avatarBg: 'bg-emerald-600 text-white',
    },
    {
      id: 'user-02',
      name: 'Marcus Vance, PE',
      email: 'marcus.vance@vanguard-metals.com',
      role: 'engineer',
      roleLabel: 'Installation & Energy Engineer',
      divisionAccess: ['div-01', 'div-02'],
      status: 'active',
      lastActive: '2 hours ago',
      avatarText: 'MV',
      avatarBg: 'bg-teal-600 text-white',
    },
    {
      id: 'user-03',
      name: 'Klaus Weber',
      email: 'klaus.weber@tuev-sued.de',
      role: 'verifier',
      roleLabel: 'Accredited Verifier (TÜV SÜD)',
      divisionAccess: ['div-01', 'div-04'],
      status: 'active',
      lastActive: 'Yesterday at 16:40',
      avatarText: 'KW',
      avatarBg: 'bg-indigo-600 text-white',
    },
    {
      id: 'user-04',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@vanguard-metals.com',
      role: 'compliance_officer',
      roleLabel: 'Senior Trade Compliance Broker',
      divisionAccess: ['all'],
      status: 'active',
      lastActive: '3 days ago',
      avatarText: 'SJ',
      avatarBg: 'bg-amber-600 text-white',
    },
    {
      id: 'user-05',
      name: 'Tariq Al-Mansoor',
      email: 'tariq.mansoor@vanguard-metals.com',
      role: 'engineer',
      roleLabel: 'Telemetry & IoT SCADA Lead',
      divisionAccess: ['div-04'],
      status: 'pending_invite',
      inviteExpiresInDays: 4,
      lastActive: 'Invitation sent Sep 25',
      avatarText: 'TM',
      avatarBg: 'bg-slate-400 text-white',
    },
    {
      id: 'user-06',
      name: 'Henrik von Berg (External)',
      email: 'henrik.vonberg@thyssenkrupp.com',
      role: 'viewer',
      roleLabel: 'EU Buyer Customs Auditor',
      divisionAccess: ['div-01'],
      status: 'active',
      lastActive: 'Sep 21, 2026',
      avatarText: 'HB',
      avatarBg: 'bg-blue-600 text-white',
    },
  ];

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);

  // Billing Invoices History
  const [invoices] = useState<InvoiceRecord[]>([
    {
      id: 'INV-CBAM-2026-0901',
      date: 'Sep 01, 2026',
      amount: '€2,850.00',
      period: 'Sep 2026 – Oct 2026',
      status: 'paid',
      planName: 'Enterprise Multi-Plant Tier',
    },
    {
      id: 'INV-CBAM-2026-0801',
      date: 'Aug 01, 2026',
      amount: '€2,850.00',
      period: 'Aug 2026 – Sep 2026',
      status: 'paid',
      planName: 'Enterprise Multi-Plant Tier',
    },
    {
      id: 'INV-CBAM-2026-0701',
      date: 'Jul 01, 2026',
      amount: '€2,850.00',
      period: 'Jul 2026 – Aug 2026',
      status: 'paid',
      planName: 'Enterprise Multi-Plant Tier',
    },
    {
      id: 'INV-CBAM-2026-0601',
      date: 'Jun 01, 2026',
      amount: '€2,850.00',
      period: 'Jun 2026 – Jul 2026',
      status: 'paid',
      planName: 'Enterprise Multi-Plant Tier',
    },
  ]);

  // Plan limits: Current tier allows 4 divisions
  const PLAN_DIVISION_LIMIT = 4;
  const activeDivisionsCount = divisions.filter((d) => !d.isArchived).length;
  const isPlanLimitReached = activeDivisionsCount >= PLAN_DIVISION_LIMIT || demoState === 'plan_limit_reached';

  // Switch demo state
  const handleSetDemoState = (state: AdminDemoState) => {
    setDemoState(state);
    if (state === 'empty_team') {
      setTeamMembers([initialTeamMembers[0]]); // Dr. Elena Rostova only
      triggerToast('Demo state: Empty Team (Account Owner only).');
    } else if (state === 'plan_limit_reached') {
      setTeamMembers(initialTeamMembers);
      triggerToast('Demo state: Plan Limit Reached (4/4 Divisions allocated).');
    } else {
      setTeamMembers(initialTeamMembers);
      triggerToast('Demo state: Standard Enterprise Multi-Tenant.');
    }
  };

  // Division Actions
  const handleToggleArchiveDivision = (divId: string) => {
    setDivisions((prev) =>
      prev.map((d) => {
        if (d.id === divId) {
          const nextArchived = !d.isArchived;
          triggerToast(
            nextArchived
              ? `Archived division ${d.name}. Compliance records preserved.`
              : `Restored division ${d.name} to active operations.`
          );
          return { ...d, isArchived: nextArchived };
        }
        return d;
      })
    );
  };

  // Switch active plant context
  const handleSwitchToPlant = (div: DivisionRecord) => {
    const targetFacility: InstallationFacility = mockInstallations.find(
      (f) => f.id === div.id
    ) || {
      id: div.id,
      name: div.name,
      code: div.code,
      unLocode: div.unLocode || 'TRIST-004',
      city: 'İzmir',
      country: div.country || 'Turkey (TR)',
      latitude: 38.79,
      longitude: 26.97,
      sector: 'iron_steel',
      competentAuthority: 'TR Ministry of Environment, Urbanisation and Climate Change',
      annualCapacityTons: parseInt(div.annualCapacityTons.replace(/[^0-9]/g, ''), 10) || 1000000,
      subInstallations: ['Electric Arc Furnace', 'Hot Strip Mill'],
    };
    setActiveInstallation(targetFacility);
    triggerToast(`Switched active workspace to "${div.name}" (${div.code}).`);
  };

  // Add Division Trigger (Enforcing Plan Limit)
  const handleOpenAddDivision = () => {
    if (isPlanLimitReached) {
      setIsPlanLimitAlertOpen(true);
    } else {
      setIsAddDivisionModalOpen(true);
    }
  };

  const handleCreateDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPlanLimitReached) {
      setIsAddDivisionModalOpen(false);
      setIsPlanLimitAlertOpen(true);
      return;
    }

    if (!newDivName.trim()) {
      triggerToast('Please provide a plant or division name.');
      return;
    }

    const created: DivisionRecord = {
      id: `div-0${divisions.length + 1}`,
      name: newDivName.trim(),
      code: newDivCode.trim() || `VANG-NEW-0${divisions.length + 1}`,
      unLocode: newDivLocode.trim() || 'TRIST-099',
      country: newDivCountry,
      countryCode: newDivCountry === 'Turkey' ? 'TR' : 'DE',
      sector: 'iron_steel',
      sectorLabel: newDivSector,
      annualCapacityTons: newDivCapacity,
      complianceStatus: 'pending',
      statusLabel: 'Baseline Data Required',
      activeProductsCount: 1,
      assignedUsersCount: 1,
      isArchived: false,
      registeredDate: new Date().toISOString().split('T')[0],
    };

    setDivisions((prev) => [created, ...prev]);
    setIsAddDivisionModalOpen(false);
    setNewDivName('');
    setNewDivCode('');
    setNewDivLocode('');
    triggerToast(`Division "${created.name}" created successfully!`);
  };

  // Invite Member Submit
  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) {
      triggerToast('Please provide an email address.');
      return;
    }

    const initials = newMemberName
      ? newMemberName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : newMemberEmail.slice(0, 2).toUpperCase();

    const roleLabels: Record<TeamMember['role'], string> = {
      admin: 'Enterprise Admin',
      compliance_officer: 'Compliance Officer (ESG)',
      engineer: 'Installation Energy Engineer',
      verifier: 'Accredited Verifier',
      viewer: 'External Buyer / Auditor',
    };

    const newMem: TeamMember = {
      id: `user-${Date.now()}`,
      name: newMemberName.trim() || newMemberEmail.split('@')[0],
      email: newMemberEmail.trim(),
      role: newMemberRole,
      roleLabel: roleLabels[newMemberRole],
      divisionAccess: newMemberDivisions,
      status: 'pending_invite',
      inviteExpiresInDays: 7,
      lastActive: 'Invitation sent today',
      avatarText: initials,
      avatarBg: 'bg-emerald-600 text-white',
    };

    setTeamMembers((prev) => [newMem, ...prev]);
    setIsInviteModalOpen(false);
    setNewMemberName('');
    setNewMemberEmail('');
    triggerToast(`CBAM invitation dispatched to ${newMem.email}!`);
  };

  // Re-send invite
  const handleResendInvite = (member: TeamMember) => {
    triggerToast(`Re-dispatched accredited invitation link to ${member.email}`);
  };

  // Remove member
  const handleRemoveMember = (memberId: string) => {
    if (memberId === 'user-01') {
      triggerToast('Account Owner cannot be removed from enterprise tenant.');
      return;
    }
    setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
    triggerToast('Team member removed from enterprise workspace.');
  };

  // Filtered Divisions
  const filteredDivisions = useMemo(() => {
    return divisions.filter((d) => {
      if (divisionFilter === 'active' && d.isArchived) return false;
      if (divisionFilter === 'archived' && !d.isArchived) return false;
      if (divisionSearch.trim()) {
        const q = divisionSearch.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          d.unLocode.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [divisions, divisionFilter, divisionSearch]);

  // Filtered Team Members
  const filteredTeamMembers = useMemo(() => {
    return teamMembers.filter((m) => {
      if (teamRoleFilter !== 'all' && m.role !== teamRoleFilter) return false;
      if (teamSearch.trim()) {
        const q = teamSearch.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.roleLabel.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [teamMembers, teamRoleFilter, teamSearch]);

  // Roles Matrix Data Definitions
  const ROLES_MATRIX = [
    {
      category: 'Emissions & Telemetry',
      permissions: [
        {
          name: 'View Dashboard & Specific SEE Metrics',
          description: 'Access executive emissions intensity and savings widgets',
          admin: true,
          compliance: true,
          engineer: true,
          verifier: true,
          viewer: true,
        },
        {
          name: 'Input Fuel & Activity Telemetry (CEMS/SCADA)',
          description: 'Enter monthly gas, coal, electrode, and electricity bills',
          admin: true,
          compliance: true,
          engineer: true,
          verifier: false,
          viewer: false,
        },
        {
          name: 'Configure CN Code Product Boundaries',
          description: 'Modify product scrap charge and precursor definitions',
          admin: true,
          compliance: true,
          engineer: true,
          verifier: false,
          viewer: false,
        },
      ],
    },
    {
      category: 'Audit & Declarations',
      permissions: [
        {
          name: 'Seal Quarterly Golden Record & SHA-256 Digest',
          description: 'Lock verified dataset to prevent backdated modifications',
          admin: true,
          compliance: true,
          engineer: false,
          verifier: false,
          viewer: false,
        },
        {
          name: 'Accredited Verifier Sign-Off & Stamping (DAkkS)',
          description: 'Issue official ISO 14065 reasonable assurance statements',
          admin: false,
          compliance: false,
          engineer: false,
          verifier: true,
          viewer: false,
        },
        {
          name: 'Generate & Dispatch EU XML / Annex IV Packages',
          description: 'Transmit verified declarations directly to EU importers',
          admin: true,
          compliance: true,
          engineer: false,
          verifier: false,
          viewer: false,
        },
      ],
    },
    {
      category: 'Enterprise Administration',
      permissions: [
        {
          name: 'Add / Archive Manufacturing Divisions',
          description: 'Create multi-tenant physical facilities and boundaries',
          admin: true,
          compliance: false,
          engineer: false,
          verifier: false,
          viewer: false,
        },
        {
          name: 'Invite & Manage Team Access & Roles',
          description: 'Provision staff and accredited auditor permissions',
          admin: true,
          compliance: false,
          engineer: false,
          verifier: false,
          viewer: false,
        },
        {
          name: 'Manage Subscription Plan & Billing Invoices',
          description: 'Upgrade enterprise tier and download tax invoices',
          admin: true,
          compliance: false,
          engineer: false,
          verifier: false,
          viewer: false,
        },
      ],
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* ------------------------------------------------------------------- */}
      {/* 1. HEADER & STATE SWITCHER TOOLBAR                                  */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-100/80 text-emerald-800 border border-emerald-200">
              Enterprise Governance & Administration
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Vanguard Metals Group (Tenant ID: VANG-ENT-0091)
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Enterprise Settings & Access Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Manage your multi-plant division hierarchy, delegate role-based access to internal staff and accredited
            third-party verifiers, audit permission boundaries, and monitor subscription limits.
          </p>
        </div>

        {/* Demo State Switcher for Reviewers */}
        <div className="flex items-center gap-1.5 p-1.5 bg-white border border-emerald-200 rounded-2xl shadow-xs self-start md:self-auto shrink-0 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Test State:
          </span>

          <button
            type="button"
            onClick={() => handleSetDemoState('standard')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              demoState === 'standard'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Standard Org
          </button>

          <button
            type="button"
            onClick={() => handleSetDemoState('empty_team')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              demoState === 'empty_team'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Empty Team State
          </button>

          <button
            type="button"
            onClick={() => handleSetDemoState('plan_limit_reached')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
              demoState === 'plan_limit_reached'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Plan Limit (4/4)</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. PRIMARY NAVIGATION TABS (Divisions, Team, Permissions, Billing)   */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'divisions', label: 'Manufacturing Divisions', count: divisions.length, icon: Building2 },
          { id: 'team', label: 'Team Members & Access', count: teamMembers.length, icon: Users },
          { id: 'permissions', label: 'Roles & Permission Matrix', count: null, icon: ShieldCheck },
          { id: 'billing', label: 'Subscription & Billing', count: 'Active', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all shrink-0 ${
                isActive
                  ? 'border-emerald-600 text-emerald-950 font-extrabold bg-emerald-50/40 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* TAB 1: DIVISIONS (LIST, MANAGE, ADD, ARCHIVE, STEP 1 CARD STYLE)    */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'divisions' && (
        <div className="space-y-6">
          {/* Action & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-emerald-100 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search divisions by name, UN/LOCODE, or code..."
                  value={divisionSearch}
                  onChange={(e) => setDivisionSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setDivisionFilter('active')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    divisionFilter === 'active'
                      ? 'bg-white text-emerald-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Active ({divisions.filter((d) => !d.isArchived).length})
                </button>
                <button
                  type="button"
                  onClick={() => setDivisionFilter('archived')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    divisionFilter === 'archived'
                      ? 'bg-white text-emerald-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Archived ({divisions.filter((d) => d.isArchived).length})
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-500 font-medium hidden md:block">
                Allocated: <strong className="text-slate-900">{activeDivisionsCount}</strong> /{' '}
                <span className="font-mono text-slate-700">{PLAN_DIVISION_LIMIT} plan slots</span>
              </div>

              <button
                type="button"
                onClick={handleOpenAddDivision}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.01]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Manufacturing Division</span>
              </button>
            </div>
          </div>

          {/* Division Cards Grid — Matching the STEP 1 Multi-Tenant Selector Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDivisions.map((div) => {
              const isCurrentActive = activeInstallation.id === div.id;

              return (
                <div
                  key={div.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative group ${
                    div.isArchived
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : isCurrentActive
                      ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-slate-200/90 hover:border-emerald-300 hover:shadow-xs'
                  }`}
                >
                  {/* Top Row: Name, Code & Status Badge */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display text-sm font-bold text-slate-900">
                            {div.name}
                          </h3>
                          {isCurrentActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1 shadow-2xs">
                              <CheckCircle2 className="w-3 h-3" />
                              Current Active Workspace
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                            {div.code}
                          </span>
                          <span>{div.unLocode}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3 text-slate-400" />
                            {div.country} ({div.countryCode})
                          </span>
                        </div>
                      </div>

                      {/* Compliance Status Badge */}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg shrink-0 border ${
                          div.complianceStatus === 'compliant'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : div.complianceStatus === 'at_risk'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {div.statusLabel}
                      </span>
                    </div>

                    {/* Sector & Details */}
                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Sector</div>
                        <div className="font-semibold text-slate-800 truncate text-[11px] mt-0.5">
                          {div.sectorLabel.split('(')[0]}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Annual Cap</div>
                        <div className="font-mono font-bold text-slate-800 text-[11px] mt-0.5">
                          {div.annualCapacityTons}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Team Access</div>
                        <div className="text-slate-800 font-semibold text-[11px] mt-0.5 flex items-center gap-1">
                          <Users className="w-3 h-3 text-emerald-600" />
                          <span>{div.assignedUsersCount} users</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Toolbar */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    {!isCurrentActive && !div.isArchived ? (
                      <button
                        type="button"
                        onClick={() => handleSwitchToPlant(div)}
                        className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 transition-colors"
                      >
                        <span>Switch Workspace</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">
                        {div.isArchived ? 'Archived facility' : 'Active session loaded'}
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDivision(div);
                          triggerToast(`Viewing details for ${div.name}`);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit installation boundaries"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleArchiveDivision(div.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          div.isArchived
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title={div.isArchived ? 'Restore division' : 'Archive division'}
                      >
                        {div.isArchived ? (
                          <RotateCcw className="w-3.5 h-3.5" />
                        ) : (
                          <Archive className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 2: TEAM MEMBERS (TABLE, ROLES, ACCESS, INVITE, PENDING STATES)  */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Action & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-emerald-100 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, or role..."
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={teamRoleFilter}
                onChange={(e) => setTeamRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="all">All Roles</option>
                <option value="admin">Enterprise Admin</option>
                <option value="compliance_officer">Compliance Officers</option>
                <option value="engineer">Installation Engineers</option>
                <option value="verifier">Accredited Verifiers</option>
                <option value="viewer">External Viewers</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.01]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite New Member</span>
            </button>
          </div>

          {/* STATE B: EMPTY TEAM STATE (ACCOUNT OWNER ONLY) */}
          {teamMembers.length === 1 && (
            <div className="p-8 text-center bg-white border border-dashed border-slate-300 rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                <Users className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="font-display text-sm font-bold text-slate-900">
                  You are the sole team member in this enterprise tenant
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enterprise compliance requires segregation of duties between plant data entry engineers,
                  compliance executives, and independent accredited third-party verifiers.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite Your First Colleague or Verifier</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDemoState('standard')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Restore Sample Team
                </button>
              </div>
            </div>
          )}

          {/* Team Members High-Density Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Member Name & Identity</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Plant & Division Access</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredTeamMembers.map((member) => {
                    const isPending = member.status === 'pending_invite';

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Name & Avatar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full ${member.avatarBg} font-display font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                            >
                              {member.avatarText}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-2">
                                <span>{member.name}</span>
                                {member.id === 'user-01' && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                    Owner
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase border ${
                              member.role === 'admin'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : member.role === 'compliance_officer'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : member.role === 'verifier'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                : member.role === 'engineer'
                                ? 'bg-teal-50 text-teal-800 border-teal-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {member.roleLabel}
                          </span>
                        </td>

                        {/* Division Access */}
                        <td className="py-3.5 px-4">
                          {member.divisionAccess.includes('all') ? (
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              All Divisions (Global Org)
                            </span>
                          ) : (
                            <div className="flex items-center gap-1 flex-wrap">
                              {member.divisionAccess.map((dId) => {
                                const divObj = divisions.find((d) => d.id === dId);
                                return (
                                  <span
                                    key={dId}
                                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                                  >
                                    {divObj ? divObj.name.split(' ')[0] : dId}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </td>

                        {/* Status (Active vs Pending Invite) */}
                        <td className="py-3.5 px-4">
                          {isPending ? (
                            <div className="flex items-center gap-1.5 text-amber-700">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                              <span className="font-semibold text-[11px]">
                                Pending ({member.inviteExpiresInDays}d left)
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-emerald-700">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              <span className="font-semibold text-[11px]">Active</span>
                            </div>
                          )}
                        </td>

                        {/* Last Active */}
                        <td className="py-3.5 px-4 text-[11px] text-slate-500 font-mono">
                          {member.lastActive}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending && (
                              <button
                                type="button"
                                onClick={() => handleResendInvite(member)}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold border border-amber-200 transition-colors"
                              >
                                Re-send
                              </button>
                            )}

                            {member.id !== 'user-01' && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(member.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Revoke member credentials"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 3: ROLES & PERMISSIONS MATRIX                                   */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <div className="bg-white border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="font-display text-base font-bold text-slate-900">
                  Role-Based Access Control (RBAC) Permission Matrix
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Segregation of duties mandated by European Commission Regulation (EU) 2023/1773 & accredited verification standards
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                    <th className="py-3.5 px-4 w-1/3">Permission / Capability</th>
                    <th className="py-3.5 px-3 text-center">Admin / Owner</th>
                    <th className="py-3.5 px-3 text-center">Compliance Lead</th>
                    <th className="py-3.5 px-3 text-center">Plant Engineer</th>
                    <th className="py-3.5 px-3 text-center">DAkkS Verifier</th>
                    <th className="py-3.5 px-3 text-center">External Buyer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {ROLES_MATRIX.map((section, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <tr className="bg-slate-50/80 font-bold text-slate-700 text-[11px]">
                        <td colSpan={6} className="py-2.5 px-4">
                          {section.category}
                        </td>
                      </tr>
                      {section.permissions.map((p, pIdx) => (
                        <tr key={pIdx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 text-xs">{p.name}</div>
                            <div className="text-[11px] text-slate-500">{p.description}</div>
                          </td>

                          {/* Admin */}
                          <td className="py-3 px-3 text-center">
                            {p.admin ? (
                              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </span>
                            ) : (
                              <span className="text-slate-300 font-bold">—</span>
                            )}
                          </td>

                          {/* Compliance */}
                          <td className="py-3 px-3 text-center">
                            {p.compliance ? (
                              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </span>
                            ) : (
                              <span className="text-slate-300 font-bold">—</span>
                            )}
                          </td>

                          {/* Engineer */}
                          <td className="py-3 px-3 text-center">
                            {p.engineer ? (
                              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 mx-auto flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </span>
                            ) : (
                              <span className="text-slate-300 font-bold">—</span>
                            )}
                          </td>

                          {/* Verifier */}
                          <td className="py-3 px-3 text-center">
                            {p.verifier ? (
                              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 mx-auto flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </span>
                            ) : (
                              <span className="text-slate-300 font-bold">—</span>
                            )}
                          </td>

                          {/* Buyer */}
                          <td className="py-3 px-3 text-center">
                            {p.viewer ? (
                              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 mx-auto flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </span>
                            ) : (
                              <span className="text-slate-300 font-bold">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 4: SUBSCRIPTION & BILLING (TIER, USAGE LIMITS, INVOICES)        */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'billing' && (
        <div className="space-y-8">
          {/* Active Plan Tier Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Current Enterprise Tier
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  Renews Oct 31, 2026
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight">
                Enterprise Multi-Plant Tier
              </h2>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Full-stack compliance suite for international heavy industrial exporters with multiple manufacturing
                installations, verifier delegations, and automated XML customs dispatch.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
              <div className="text-right">
                <div className="font-display text-3xl font-extrabold text-white">
                  €2,850
                  <span className="text-xs font-normal text-slate-400"> / month</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold">
                  Billed annually (€34,200/yr)
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Upgrade to Conglomerate Tier</span>
              </button>
            </div>
          </div>

          {/* Usage Against Plan Limits */}
          <div className="bg-white border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="font-display text-base font-bold text-slate-900">
                  Current Quota Usage Against Plan Allowances
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor resource consumption across facilities, buyer relationships, and telemetry pipelines
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Limit 1: Divisions (AT LIMIT) */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  isPlanLimitReached
                    ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-400/40'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Manufacturing Divisions</span>
                  {isPlanLimitReached && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-900 uppercase">
                      Limit Reached
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-baseline gap-1.5 font-display text-2xl font-bold text-slate-900">
                  <span>{activeDivisionsCount}</span>
                  <span className="text-xs font-normal text-slate-500">/ {PLAN_DIVISION_LIMIT} allowed</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isPlanLimitReached ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (activeDivisionsCount / PLAN_DIVISION_LIMIT) * 100)}%` }}
                  />
                </div>
                <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
                  <span>100% capacity</span>
                  <button
                    type="button"
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="font-bold text-emerald-700 hover:underline"
                  >
                    Unlock more →
                  </button>
                </div>
              </div>

              {/* Limit 2: Products */}
              <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Monitored Goods</span>
                  <span className="text-[10px] font-mono text-slate-500">53% used</span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5 font-display text-2xl font-bold text-slate-900">
                  <span>8</span>
                  <span className="text-xs font-normal text-slate-500">/ 15 allowed</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '53%' }} />
                </div>
                <div className="mt-2 text-[10px] text-slate-500">7 additional CN codes available</div>
              </div>

              {/* Limit 3: Buyers */}
              <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">EU Buyer Relationships</span>
                  <span className="text-[10px] font-mono text-slate-500">60% used</span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5 font-display text-2xl font-bold text-slate-900">
                  <span>6</span>
                  <span className="text-xs font-normal text-slate-500">/ 10 allowed</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '60%' }} />
                </div>
                <div className="mt-2 text-[10px] text-slate-500">4 importer slots available</div>
              </div>

              {/* Limit 4: Reports */}
              <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Verified XML Filings</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Included
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5 font-display text-2xl font-bold text-emerald-700">
                  <span>Unlimited</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '100%' }} />
                </div>
                <div className="mt-2 text-[10px] text-slate-500">5-year statutory retention active</div>
              </div>
            </div>
          </div>

          {/* Invoice History Table */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Billing & Invoice History
                </h3>
              </div>
              <span className="text-xs text-slate-500">Tax invoices issued in Euro (€)</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Invoice Reference</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Billing Period</th>
                    <th className="py-3 px-4">Plan Description</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {inv.id}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{inv.date}</td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">
                        {inv.period}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {inv.planName}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {inv.amount}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Paid
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => triggerToast(`Downloading PDF receipt for ${inv.id}`)}
                          className="text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-1 text-[11px]"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
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
      {/* MODAL 1: PLAN LIMIT REACHED ESCALATION MODAL                        */}
      {/* ------------------------------------------------------------------- */}
      {isPlanLimitAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-rose-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                Plan Limit Reached · Enterprise Core
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Manufacturing Division Allowance Exceeded (4 of 4 Used)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your current <strong>Enterprise Multi-Plant Tier</strong> allows up to 4 registered manufacturing
                installations. To provision additional international facilities, separate legal entities, or sub-installations,
                upgrade to our <strong>Global Conglomerate Tier</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-800">Global Conglomerate Tier includes:</div>
              <div className="space-y-1 text-slate-600 text-[11px]">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Unlimited international manufacturing facilities & UN/LOCODEs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cross-border customs routing & automated EU Registry EDI feeds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dedicated DAkkS verifier surveillance portal</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPlanLimitAlertOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlanLimitAlertOpen(false);
                  setIsUpgradeModalOpen(true);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>View Upgrade Options</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 2: ADD DIVISION FORM MODAL                                    */}
      {/* ------------------------------------------------------------------- */}
      {isAddDivisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Factory className="w-5 h-5 text-emerald-600" />
                <h3 className="font-display text-base font-bold text-slate-900">
                  Register Manufacturing Facility
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDivisionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDivision} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Facility Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marmara Cold-Rolling Complex #01"
                  value={newDivName}
                  onChange={(e) => setNewDivName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plant Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="VANG-MAR-01"
                    value={newDivCode}
                    onChange={(e) => setNewDivCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">UN/LOCODE *</label>
                  <input
                    type="text"
                    required
                    placeholder="TRMAR-001"
                    value={newDivLocode}
                    onChange={(e) => setNewDivLocode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Country *</label>
                  <select
                    value={newDivCountry}
                    onChange={(e) => setNewDivCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Turkey">Turkey (TR)</option>
                    <option value="Egypt">Egypt (EG)</option>
                    <option value="Saudi Arabia">Saudi Arabia (SA)</option>
                    <option value="India">India (IN)</option>
                    <option value="Vietnam">Vietnam (VN)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Annual Capacity</label>
                  <input
                    type="text"
                    placeholder="850,000 t"
                    value={newDivCapacity}
                    onChange={(e) => setNewDivCapacity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">CBAM Sector *</label>
                <select
                  value={newDivSector}
                  onChange={(e) => setNewDivSector(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Iron & Steel (CN 72xx, 73xx)">Iron & Steel (CN 72xx, 73xx)</option>
                  <option value="Aluminium (CN 76xx)">Aluminium (CN 76xx)</option>
                  <option value="Cement (CN 2523)">Cement (CN 2523)</option>
                  <option value="Fertilisers (CN 2814, 3102)">Fertilisers (CN 2814, 3102)</option>
                  <option value="Hydrogen (CN 2804 10 00)">Hydrogen (CN 2804 10 00)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDivisionModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Division
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 3: INVITE TEAM MEMBER MODAL                                   */}
      {/* ------------------------------------------------------------------- */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-display text-base font-bold text-slate-900">
                  Invite Member to Enterprise Tenant
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Caner Yilmaz"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="c.yilmaz@vanguard-metals.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role & Responsibility *</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="compliance_officer">Compliance Officer (ESG Lead) — Full report generation</option>
                  <option value="engineer">Installation Energy Engineer — SCADA & fuel entry only</option>
                  <option value="verifier">Accredited Verifier (TÜV SÜD) — Reasonable assurance sign-off</option>
                  <option value="admin">Enterprise Admin — Full access to billing & divisions</option>
                  <option value="viewer">External Buyer Auditor — View-only access</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Permitted Divisions Access *
                </label>
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 max-h-36 overflow-y-auto">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={newMemberDivisions.includes('all')}
                      onChange={(e) => {
                        if (e.target.checked) setNewMemberDivisions(['all']);
                        else setNewMemberDivisions(['div-01']);
                      }}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>All Divisions (Global Access)</span>
                  </label>

                  {!newMemberDivisions.includes('all') &&
                    divisions.map((d) => (
                      <label key={d.id} className="flex items-center gap-2 cursor-pointer text-slate-600 pl-4">
                        <input
                          type="checkbox"
                          checked={newMemberDivisions.includes(d.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewMemberDivisions([...newMemberDivisions, d.id]);
                            } else {
                              setNewMemberDivisions(newMemberDivisions.filter((id) => id !== d.id));
                            }
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{d.name} ({d.code})</span>
                      </label>
                    ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 4: UPGRADE PLAN MODAL                                         */}
      {/* ------------------------------------------------------------------- */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-600 fill-emerald-600" />
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Upgrade Enterprise Subscription Tier
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Current Tier */}
              <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/50 space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Current Plan
                </div>
                <div className="font-display text-lg font-bold text-slate-900">
                  Enterprise Core
                </div>
                <div className="font-mono text-xl font-bold text-slate-900">
                  €2,850 <span className="text-xs font-normal text-slate-500">/ mo</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-slate-500" />
                    <span>Up to 4 Manufacturing Divisions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-slate-500" />
                    <span>Up to 15 Monitored Goods</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-slate-500" />
                    <span>10 EU Buyer Relationships</span>
                  </div>
                </div>
              </div>

              {/* Target Upgrade Tier */}
              <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 space-y-3 relative shadow-xs">
                <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wide">
                  Recommended
                </span>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Next Tier
                </div>
                <div className="font-display text-lg font-bold text-slate-900">
                  Global Conglomerate
                </div>
                <div className="font-mono text-xl font-bold text-emerald-800">
                  €4,500 <span className="text-xs font-normal text-slate-500">/ mo</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-emerald-200 font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span><strong>Unlimited</strong> Manufacturing Divisions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span><strong>Unlimited</strong> Monitored Goods & Sectors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span><strong>Unlimited</strong> EU Buyer Customs Portals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span>Dedicated DAkkS Verifier Surveillance Console</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-slate-600">
                Prorated upgrade charges will be applied to your default payment card (SEPA •••• 9102).
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs"
              >
                Keep Current Plan
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsUpgradeModalOpen(false);
                  triggerToast('Enterprise subscription upgraded to Global Conglomerate tier!');
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Confirm Upgrade to Conglomerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
