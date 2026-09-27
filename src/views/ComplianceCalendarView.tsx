import React, { useState, useMemo } from 'react';
import { useCbam } from '../context/CbamContext';
import {
  CalendarDays,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Plus,
  User,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Building2,
  ShieldCheck,
  Lock,
  Sparkles,
  ArrowRight,
  Check,
  X,
  ExternalLink,
  Flame,
  Layers,
  FileSpreadsheet,
  Flag,
  Info,
  SlidersHorizontal,
  RefreshCw,
  BellRing,
  HelpCircle,
  Eye,
  Send,
} from 'lucide-react';

interface ComplianceCalendarViewProps {
  onNavigateStep?: (stepId: string) => void;
}

export type ViewMode = 'timeline' | 'calendar';
export type DisplayState = 'active' | 'overdue_escalation' | 'empty';

export interface RegulatoryMilestone {
  id: string;
  title: string;
  regulationRef: string;
  date: string; // YYYY-MM-DD
  quarter: string;
  category: 'statutory_deadline' | 'phase_out' | 'reporting_window';
  description: string;
  impactLevel: 'mandatory' | 'policy_shift' | 'surrender_obligation';
  badgeLabel: string;
  daysRemaining: number;
}

export interface BuyerDeadline {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerCountry: string;
  eoriNumber: string;
  deadlineDate: string; // YYYY-MM-DD
  format: string;
  status: 'dispatched' | 'pending' | 'reconciliation_needed' | 'overdue' | 'accepted';
  tonQuantity: number;
  isOverdue: boolean;
  daysRemaining: number;
  contactName: string;
  contactEmail: string;
}

export interface ComplianceTask {
  id: string;
  title: string;
  description: string;
  assignee: {
    id: string;
    name: string;
    role: string;
    avatarText: string;
    avatarBg: string;
  };
  dueDate: string; // YYYY-MM-DD
  daysRemaining: number;
  isOverdue: boolean;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  category: 'telemetry' | 'verifier_audit' | 'buyer_dispatch' | 'statutory' | 'lab_testing';
  isCompleted: boolean;
  linkedBuyerId?: string;
  linkedFacility?: string;
}

// Fixed EU CBAM Statutory Deadlines & Milestones (Regulation (EU) 2023/956 & Directive 2003/87/EC)
const FIXED_REGULATORY_MILESTONES: RegulatoryMilestone[] = [
  {
    id: 'stat-01',
    title: 'Q3 2026 EU Importer CBAM Declaration Deadline',
    regulationRef: 'Regulation (EU) 2023/1773 Art. 8',
    date: '2026-10-31',
    quarter: 'Q3 2026',
    category: 'statutory_deadline',
    description: 'Mandatory deadline for EU importers to submit quarterly declarations into the European Commission CBAM Transitional Registry.',
    impactLevel: 'mandatory',
    badgeLabel: 'EU Statutory Deadline',
    daysRemaining: 34,
  },
  {
    id: 'stat-02',
    title: 'EU Commission CBAM Default-Value Phase-Out Milestone',
    regulationRef: 'Reg (EU) 2023/1773 & Guidance Art. 4',
    date: '2026-12-31',
    quarter: 'Q4 2026',
    category: 'phase_out',
    description: 'Expiration of temporary tolerance for standard default emissions values. 100% actual measured activity data required thereafter.',
    impactLevel: 'policy_shift',
    badgeLabel: 'Regulatory Phase-Out',
    daysRemaining: 95,
  },
  {
    id: 'stat-03',
    title: 'Q4 2026 EU Importer CBAM Declaration Deadline',
    regulationRef: 'Regulation (EU) 2023/1773 Art. 8',
    date: '2027-01-31',
    quarter: 'Q4 2026',
    category: 'statutory_deadline',
    description: 'Final submission window for 2026 fourth-quarter embedded emissions and transitional reporting reconciliation.',
    impactLevel: 'mandatory',
    badgeLabel: 'EU Statutory Deadline',
    daysRemaining: 126,
  },
  {
    id: 'stat-04',
    title: 'EU ETS Free Allocation Phase-Out (5.0% CBAM Factor)',
    regulationRef: 'Directive 2003/87/EC Art. 10a',
    date: '2027-01-01',
    quarter: 'Annual 2027',
    category: 'phase_out',
    description: 'Free ETS allowance phase-out escalates from 2.5% to 5.0%, increasing CBAM certificate financial exposure for EU buyers.',
    impactLevel: 'policy_shift',
    badgeLabel: 'Free Allocation Shift',
    daysRemaining: 96,
  },
  {
    id: 'stat-05',
    title: 'Annual CBAM Definitive Regime Declaration & Certificate Surrender',
    regulationRef: 'Regulation (EU) 2023/956 Art. 6 & 22',
    date: '2027-05-31',
    quarter: 'Annual 2026',
    category: 'statutory_deadline',
    description: 'Authorized CBAM declarants must file verified annual emissions declarations and surrender corresponding CBAM certificates purchased via the common central auction.',
    impactLevel: 'surrender_obligation',
    badgeLabel: 'Annual Declaration Date',
    daysRemaining: 246,
  },
  {
    id: 'stat-06',
    title: 'EU ETS Free Allocation 10% Phase-Out Milestone',
    regulationRef: 'Directive 2003/87/EC Revised',
    date: '2028-01-01',
    quarter: 'Annual 2028',
    category: 'phase_out',
    description: 'CBAM factor doubles to 10.0%, phasing out 10% of historic free allocation benchmark for heavy industrial goods.',
    impactLevel: 'policy_shift',
    badgeLabel: 'Free Allocation Shift',
    daysRemaining: 461,
  },
];

export const ComplianceCalendarView: React.FC<ComplianceCalendarViewProps> = ({ onNavigateStep }) => {
  const { buyers, activeInstallation, triggerToast } = useCbam();

  // Top Level View Modes
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [displayState, setDisplayState] = useState<DisplayState>('active');

  // Month navigation for Calendar view (Default to October 2026)
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date(2026, 9, 1)); // October 2026

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'statutory' | 'buyer' | 'task'>('all');
  const [taskFilter, setTaskFilter] = useState<'all' | 'overdue' | 'upcoming' | 'completed'>('all');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>('2026-10-15');

  // Add Task Modal State
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDescription, setNewTaskDescription] = useState<string>('');
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>('user-02');
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>('2026-10-14');
  const [newTaskPriority, setNewTaskPriority] = useState<'urgent' | 'high' | 'normal' | 'low'>('high');
  const [newTaskCategory, setNewTaskCategory] = useState<'telemetry' | 'verifier_audit' | 'buyer_dispatch' | 'statutory' | 'lab_testing'>('telemetry');
  const [newTaskBuyerId, setNewTaskBuyerId] = useState<string>('');

  // Initial Buyer Deadlines (Pulled from Step 3 Buyer relationships)
  const initialBuyerDeadlines: BuyerDeadline[] = useMemo(() => [
    {
      id: 'bd-01',
      buyerId: 'buyer-01',
      buyerName: 'ThyssenKrupp Materials Services GmbH',
      buyerCountry: 'Germany (DE)',
      eoriNumber: 'DE100492819882',
      deadlineDate: '2026-10-12',
      format: 'EU Registry XML v2.3',
      status: 'accepted',
      tonQuantity: 28450,
      isOverdue: false,
      daysRemaining: 15,
      contactName: 'Henrik von Berg',
      contactEmail: 'henrik.vonberg@thyssenkrupp.com',
    },
    {
      id: 'bd-02',
      buyerId: 'buyer-02',
      buyerName: 'ArcelorMittal Europe S.A.',
      buyerCountry: 'Luxembourg (LU)',
      eoriNumber: 'LU209418491024',
      deadlineDate: '2026-10-15',
      format: 'Annex IV Excel Sheet D',
      status: 'pending',
      tonQuantity: 36200,
      isOverdue: false,
      daysRemaining: 18,
      contactName: 'Sophie Dupont',
      contactEmail: 'sophie.dupont@arcelormittal.com',
    },
    {
      id: 'bd-03',
      buyerId: 'buyer-03',
      buyerName: 'Klöckner & Co SE',
      buyerCountry: 'Germany (DE)',
      eoriNumber: 'DE811194200192',
      deadlineDate: '2026-10-08',
      format: 'Nexigen® CSV + GoO',
      status: 'reconciliation_needed',
      tonQuantity: 19800,
      isOverdue: false,
      daysRemaining: 11,
      contactName: 'Dr. Jens Richter',
      contactEmail: 'jens.richter@kloeckner.de',
    },
    {
      id: 'bd-04',
      buyerId: 'buyer-04',
      buyerName: 'Saint-Gobain Building Glass France',
      buyerCountry: 'France (FR)',
      eoriNumber: 'FR901248102391',
      deadlineDate: '2026-10-18',
      format: 'EU Registry XML',
      status: 'accepted',
      tonQuantity: 14500,
      isOverdue: false,
      daysRemaining: 21,
      contactName: 'Camille Leroux',
      contactEmail: 'camille.leroux@saint-gobain.com',
    },
    {
      id: 'bd-05',
      buyerId: 'buyer-05',
      buyerName: 'Marcegaglia Carbon Steel SpA',
      buyerCountry: 'Italy (IT)',
      eoriNumber: 'IT019283746501',
      deadlineDate: '2026-10-22',
      format: 'REST API Dispatch',
      status: 'pending',
      tonQuantity: 22100,
      isOverdue: false,
      daysRemaining: 25,
      contactName: 'Marco Benetti',
      contactEmail: 'marco.benetti@marcegaglia.com',
    },
    {
      id: 'bd-06',
      buyerId: 'buyer-06',
      buyerName: 'Outokumpu Stainless Oyj',
      buyerCountry: 'Finland (FI)',
      eoriNumber: 'FI019284711902',
      deadlineDate: '2026-09-24',
      format: 'Precursor Audit Revision',
      status: 'overdue',
      tonQuantity: 11200,
      isOverdue: true,
      daysRemaining: -3,
      contactName: 'Lassi Koskinen',
      contactEmail: 'lassi.koskinen@outokumpu.com',
    },
  ], []);

  // Team Personas Directory for Assignees
  const teamMembers = useMemo(() => [
    {
      id: 'user-01',
      name: 'Dr. Elena Rostova',
      role: 'VP of ESG & Carbon Compliance',
      avatarText: 'ER',
      avatarBg: 'bg-emerald-600 text-white',
    },
    {
      id: 'user-02',
      name: 'Marcus Vance, PE',
      role: 'Chief Installation & Energy Engineer',
      avatarText: 'MV',
      avatarBg: 'bg-teal-600 text-white',
    },
    {
      id: 'user-03',
      name: 'Klaus Weber',
      role: 'Lead Accredited EU CBAM Verifier (TÜV SÜD)',
      avatarText: 'KW',
      avatarBg: 'bg-indigo-600 text-white',
    },
    {
      id: 'user-05',
      name: 'Sarah Jenkins',
      role: 'Senior Trade Compliance & Customs Broker',
      avatarText: 'SJ',
      avatarBg: 'bg-amber-600 text-white',
    },
    {
      id: 'user-06',
      name: 'Tariq Al-Mansoor',
      role: 'Telemetry & IoT SCADA Specialist',
      avatarText: 'TA',
      avatarBg: 'bg-blue-600 text-white',
    },
  ], []);

  // Internal Compliance Tasks
  const [tasks, setTasks] = useState<ComplianceTask[]>([
    {
      id: 'task-01',
      title: 'Review Outokumpu alumina emission revision request',
      description: 'Validate Gladstone refinery ISO 14064 statement against Turkish customs export manifest to clear buyer objection.',
      assignee: teamMembers[0], // Dr. Elena Rostova
      dueDate: '2026-09-24',
      daysRemaining: -3,
      isOverdue: true,
      priority: 'urgent',
      category: 'buyer_dispatch',
      isCompleted: false,
      linkedBuyerId: 'buyer-06',
      linkedFacility: 'inst-02',
    },
    {
      id: 'task-02',
      title: 'Collect Q3 natural gas & electricity utility invoices for Rolling Mill #04',
      description: 'Extract pipeline gas volume (Nm3), net calorific value (NCV) lab logs, and TEİAŞ grid consumption telemetry.',
      assignee: teamMembers[1], // Marcus Vance
      dueDate: '2026-10-02',
      daysRemaining: 5,
      isOverdue: false,
      priority: 'high',
      category: 'telemetry',
      isCompleted: false,
      linkedFacility: 'inst-01',
    },
    {
      id: 'task-03',
      title: 'TÜV SÜD on-site surveillance audit preparation & meter inspection',
      description: 'Host lead auditor Klaus Weber for continuous emission monitoring calibration checks and graphite electrode logs.',
      assignee: teamMembers[2], // Klaus Weber
      dueDate: '2026-10-05',
      daysRemaining: 8,
      isOverdue: false,
      priority: 'urgent',
      category: 'verifier_audit',
      isCompleted: false,
      linkedFacility: 'inst-01',
    },
    {
      id: 'task-04',
      title: 'Package XML communication template for ThyssenKrupp approval',
      description: 'Generate SHA-256 digital manifest and submit via ThyssenKrupp supplier portal ahead of early freeze.',
      assignee: teamMembers[0], // Dr. Elena Rostova
      dueDate: '2026-10-10',
      daysRemaining: 13,
      isOverdue: false,
      priority: 'normal',
      category: 'buyer_dispatch',
      isCompleted: true,
      linkedBuyerId: 'buyer-01',
    },
    {
      id: 'task-05',
      title: 'Reconcile bilaterally shipped tonnage with ArcelorMittal customs broker',
      description: 'Cross-verify bill-of-lading tonnage with Port of Nemrut customs export declaration for 36,200 tons.',
      assignee: teamMembers[3], // Sarah Jenkins
      dueDate: '2026-10-14',
      daysRemaining: 17,
      isOverdue: false,
      priority: 'high',
      category: 'buyer_dispatch',
      isCompleted: false,
      linkedBuyerId: 'buyer-02',
    },
    {
      id: 'task-06',
      title: 'Calibrate CEMS stack gas infrared sensors (EN 14181 QAL2)',
      description: 'Upload calibration drift audit report to Document Vault with SICK AG accredited service cert.',
      assignee: teamMembers[4], // Tariq Al-Mansoor
      dueDate: '2026-10-19',
      daysRemaining: 22,
      isOverdue: false,
      priority: 'normal',
      category: 'lab_testing',
      isCompleted: true,
      linkedFacility: 'inst-01',
    },
    {
      id: 'task-07',
      title: 'Upload finalized Form CBAM-VER to European Commission registry repository',
      description: 'Verify digital signature and cryptographic seal from accredited verifier before locking dataset.',
      assignee: teamMembers[0], // Dr. Elena Rostova
      dueDate: '2026-10-25',
      daysRemaining: 28,
      isOverdue: false,
      priority: 'urgent',
      category: 'statutory',
      isCompleted: false,
    },
    {
      id: 'task-08',
      title: 'Dispatch Saint-Gobain XML file via secure direct EDI link',
      description: 'Confirmed receipt of B500B rebar emissions factors with zero carbon tax dispute.',
      assignee: teamMembers[3], // Sarah Jenkins
      dueDate: '2026-09-18',
      daysRemaining: -9,
      isOverdue: false,
      priority: 'normal',
      category: 'buyer_dispatch',
      isCompleted: true,
      linkedBuyerId: 'buyer-04',
    },
  ]);

  // Buyer Deadlines state (affected by empty state)
  const [buyerDeadlines, setBuyerDeadlines] = useState<BuyerDeadline[]>(initialBuyerDeadlines);

  // Toggle Task Completed
  const handleToggleTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const next = !task.isCompleted;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isCompleted: next } : t))
    );
    triggerToast(next ? `Task marked as completed: "${task.title}"` : `Task re-opened: "${task.title}"`);
  };

  // Add Task submit handler
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      triggerToast('Please enter a task title.');
      return;
    }

    const assignedMember = teamMembers.find((m) => m.id === newTaskAssignee) || teamMembers[0];
    const today = new Date(2026, 8, 27); // Sept 27, 2026
    const due = new Date(newTaskDueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const createdTask: ComplianceTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || 'Internal CBAM compliance milestone assignment.',
      assignee: assignedMember,
      dueDate: newTaskDueDate,
      daysRemaining: diffDays,
      isOverdue: diffDays < 0,
      priority: newTaskPriority,
      category: newTaskCategory,
      isCompleted: false,
      linkedBuyerId: newTaskBuyerId || undefined,
    };

    setTasks((prev) => [createdTask, ...prev]);
    setIsAddTaskModalOpen(false);
    setNewTaskTitle('');
    setNewTaskDescription('');
    triggerToast(`Added new task: "${createdTask.title}" assigned to ${assignedMember.name}`);
  };

  // Reset to sample data if in empty state
  const handleSeedSampleSchedule = () => {
    setDisplayState('active');
    setBuyerDeadlines(initialBuyerDeadlines);
    triggerToast('Active production schedule loaded with 6 EU buyer deadlines and 8 team tasks.');
  };

  // Empty workspace handler
  const handleSetEmptyState = () => {
    setDisplayState('empty');
    setBuyerDeadlines([]);
    triggerToast('Workspace set to initial empty state. Fixed EU statutory milestones remain preserved.');
  };

  // Overdue count computation
  const overdueBuyerDeadlines = useMemo(() => {
    if (displayState === 'empty') return [];
    return buyerDeadlines.filter((b) => b.isOverdue || b.status === 'overdue');
  }, [buyerDeadlines, displayState]);

  const overdueTasks = useMemo(() => {
    if (displayState === 'empty') return [];
    return tasks.filter((t) => !t.isCompleted && (t.isOverdue || t.daysRemaining < 0));
  }, [tasks, displayState]);

  const totalOverdueCount = overdueBuyerDeadlines.length + overdueTasks.length;

  // Active items for view
  const currentBuyerDeadlines = displayState === 'empty' ? [] : buyerDeadlines;
  const currentTasks = displayState === 'empty' ? [] : tasks;

  // Filtered Tasks for Task List Panel
  const filteredTasks = useMemo(() => {
    return currentTasks.filter((t) => {
      // Status filter
      if (taskFilter === 'overdue' && (t.isCompleted || (!t.isOverdue && t.daysRemaining >= 0))) return false;
      if (taskFilter === 'upcoming' && (t.isCompleted || t.daysRemaining < 0)) return false;
      if (taskFilter === 'completed' && !t.isCompleted) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.assignee.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [currentTasks, taskFilter, searchQuery]);

  // Combined Linear Timeline Items sorted chronologically
  const timelineItems = useMemo(() => {
    const list: Array<{
      id: string;
      itemType: 'statutory' | 'buyer' | 'task';
      date: string;
      title: string;
      subtitle: string;
      categoryTag: string;
      isOverdue: boolean;
      daysRemaining: number;
      statusBadge: string;
      statusColor: string;
      originalData: any;
    }> = [];

    // 1. Statutory Milestones (always present!)
    FIXED_REGULATORY_MILESTONES.forEach((sm) => {
      if (typeFilter === 'all' || typeFilter === 'statutory') {
        list.push({
          id: sm.id,
          itemType: 'statutory',
          date: sm.date,
          title: sm.title,
          subtitle: `${sm.regulationRef} · ${sm.description}`,
          categoryTag: sm.category.replace('_', ' ').toUpperCase(),
          isOverdue: sm.daysRemaining < 0,
          daysRemaining: sm.daysRemaining,
          statusBadge: sm.badgeLabel,
          statusColor: 'bg-indigo-50 border-indigo-200 text-indigo-800',
          originalData: sm,
        });
      }
    });

    // 2. Buyer Deadlines
    currentBuyerDeadlines.forEach((bd) => {
      if (typeFilter === 'all' || typeFilter === 'buyer') {
        const isOv = bd.isOverdue || bd.status === 'overdue';
        list.push({
          id: bd.id,
          itemType: 'buyer',
          date: bd.deadlineDate,
          title: `${bd.buyerName} (${bd.buyerCountry})`,
          subtitle: `Format: ${bd.format} · Shipped: ${bd.tonQuantity.toLocaleString()} t · Contact: ${bd.contactName}`,
          categoryTag: 'BUYER DISPATCH',
          isOverdue: isOv,
          daysRemaining: bd.daysRemaining,
          statusBadge: isOv
            ? 'Action Overdue'
            : bd.status === 'accepted'
            ? 'Accepted by Buyer'
            : bd.status === 'reconciliation_needed'
            ? 'Reconciliation Needed'
            : 'Pending Dispatch',
          statusColor: isOv
            ? 'bg-rose-50 border-rose-300 text-rose-800'
            : bd.status === 'accepted'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : bd.status === 'reconciliation_needed'
            ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-blue-50 border-blue-200 text-blue-800',
          originalData: bd,
        });
      }
    });

    // 3. Internal Tasks
    currentTasks.forEach((tk) => {
      if (typeFilter === 'all' || typeFilter === 'task') {
        const isOv = !tk.isCompleted && (tk.isOverdue || tk.daysRemaining < 0);
        list.push({
          id: tk.id,
          itemType: 'task',
          date: tk.dueDate,
          title: tk.title,
          subtitle: `Assignee: ${tk.assignee.name} (${tk.assignee.role}) · Priority: ${tk.priority.toUpperCase()}`,
          categoryTag: `TASK: ${tk.category.toUpperCase()}`,
          isOverdue: isOv,
          daysRemaining: tk.daysRemaining,
          statusBadge: tk.isCompleted ? 'Completed' : isOv ? 'Task Overdue' : 'In Progress',
          statusColor: tk.isCompleted
            ? 'bg-slate-100 border-slate-200 text-slate-600 line-through'
            : isOv
            ? 'bg-rose-50 border-rose-300 text-rose-800'
            : 'bg-teal-50 border-teal-200 text-teal-800',
          originalData: tk,
        });
      }
    });

    // Apply search query filter if set
    let results = list;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.subtitle.toLowerCase().includes(q) ||
          i.categoryTag.toLowerCase().includes(q) ||
          i.date.includes(q)
      );
    }

    // Sort chronologically by date
    results.sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0));
    return results;
  }, [typeFilter, currentBuyerDeadlines, currentTasks, searchQuery]);

  // Calendar Day Generation for Selected Month
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth(); // 0-indexed
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun, 1 is Mon...
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Map Monday as first day of week (standard in EU ISO 8601)
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const daysArray: Array<{
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      items: Array<{
        id: string;
        type: 'statutory' | 'buyer' | 'task';
        title: string;
        isOverdue: boolean;
        badgeColor: string;
      }>;
    }> = [];

    // Previous month padding
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const prevDateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      daysArray.push({
        dateString: prevDateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: false,
        items: [],
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = dateStr === '2026-09-27'; // Fixed current simulation date

      // Gather events on this date
      const events: Array<{
        id: string;
        type: 'statutory' | 'buyer' | 'task';
        title: string;
        isOverdue: boolean;
        badgeColor: string;
      }> = [];

      // Statutory
      FIXED_REGULATORY_MILESTONES.forEach((sm) => {
        if (sm.date === dateStr) {
          events.push({
            id: sm.id,
            type: 'statutory',
            title: sm.title,
            isOverdue: sm.daysRemaining < 0,
            badgeColor: 'bg-indigo-600 text-white',
          });
        }
      });

      // Buyer Deadlines
      currentBuyerDeadlines.forEach((bd) => {
        if (bd.deadlineDate === dateStr) {
          events.push({
            id: bd.id,
            type: 'buyer',
            title: `${bd.buyerName.split(' ')[0]} Dispatch`,
            isOverdue: bd.isOverdue || bd.status === 'overdue',
            badgeColor:
              bd.isOverdue || bd.status === 'overdue'
                ? 'bg-rose-600 text-white ring-1 ring-rose-400'
                : bd.status === 'accepted'
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 text-white',
          });
        }
      });

      // Tasks
      currentTasks.forEach((tk) => {
        if (tk.dueDate === dateStr) {
          events.push({
            id: tk.id,
            type: 'task',
            title: tk.title,
            isOverdue: !tk.isCompleted && (tk.isOverdue || tk.daysRemaining < 0),
            badgeColor: tk.isCompleted
              ? 'bg-slate-300 text-slate-700'
              : tk.isOverdue || tk.daysRemaining < 0
              ? 'bg-rose-600 text-white'
              : 'bg-teal-600 text-white',
          });
        }
      });

      daysArray.push({
        dateString: dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday,
        items: events,
      });
    }

    // Trailing days padding to fill 35 or 42 grid cells
    const remainingCells = (7 - (daysArray.length % 7)) % 7;
    for (let t = 1; t <= remainingCells; t++) {
      const nextDateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(t).padStart(2, '0')}`;
      daysArray.push({
        dateString: nextDateStr,
        dayNumber: t,
        isCurrentMonth: false,
        isToday: false,
        items: [],
      });
    }

    return daysArray;
  }, [currentMonthDate, currentBuyerDeadlines, currentTasks]);

  // Selected date events for quick day inspection
  const selectedDateEvents = useMemo(() => {
    if (!selectedCalendarDate) return [];
    return timelineItems.filter((i) => i.date === selectedCalendarDate);
  }, [selectedCalendarDate, timelineItems]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
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
              CBAM Compliance Schedule
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Reg (EU) 2023/956 & Directive 2003/87/EC
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Compliance Calendar & Readiness Timelines
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Synchronize mandatory European Commission filing windows, bilateral EU importer deadlines,
            accredited third-party verifier surveillance audits, and internal operational task assignments.
          </p>
        </div>

        {/* Reviewer State Controller */}
        <div className="flex flex-wrap items-center gap-2 bg-white border border-emerald-200 p-1.5 rounded-2xl shadow-xs self-start md:self-auto shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Schedule State:
          </span>

          <button
            type="button"
            onClick={() => {
              setDisplayState('active');
              setBuyerDeadlines(initialBuyerDeadlines);
              triggerToast('Active Production Schedule active.');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              displayState === 'active'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Active Schedule
          </button>

          <button
            type="button"
            onClick={() => {
              setDisplayState('overdue_escalation');
              setBuyerDeadlines(initialBuyerDeadlines);
              triggerToast('Overdue escalation view active: Outokumpu dispute highlighted.');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              displayState === 'overdue_escalation'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Overdue Escalation ({totalOverdueCount})</span>
          </button>

          <button
            type="button"
            onClick={handleSetEmptyState}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              displayState === 'empty'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Empty Workspace
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. OVERDUE ITEMS ESCALATION BANNER (SEMANTIC COLOR ESCALATION)       */}
      {/* ------------------------------------------------------------------- */}
      {totalOverdueCount > 0 && displayState !== 'empty' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50 via-rose-50/80 to-amber-50/50 border border-rose-300 ring-2 ring-rose-400/40 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                <AlertCircle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-200 text-rose-900">
                    High Regulatory Escalation
                  </span>
                  <span className="text-xs font-mono font-semibold text-rose-700">
                    {totalOverdueCount} Overdue Item{totalOverdueCount > 1 ? 's' : ''} Require Immediate Attention
                  </span>
                </div>
                <h3 className="font-display text-sm sm:text-base font-bold text-rose-950 mt-1">
                  Outokumpu Stainless Oyj: Alumina Precursor Revision Due Sept 24 (3 Days Overdue)
                </h3>
                <p className="text-xs text-rose-800/90 mt-0.5 max-w-3xl leading-relaxed">
                  Finnish importer Outokumpu requested clarification regarding the Australian supplier certification date for Smelter Alumina Grade P1020.
                  Failure to dispatch revised package prior to Oct 31 risks customs filing rejection under Article 8.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => {
                  setTaskFilter('overdue');
                  triggerToast('Filtered internal task list to overdue action items.');
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-rose-700 border border-rose-300 hover:bg-rose-50 transition-colors shadow-2xs"
              >
                Filter Overdue Only
              </button>
              {onNavigateStep && (
                <button
                  type="button"
                  onClick={() => onNavigateStep('step_3_buyers')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <span>Open Buyer Dispatch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 3. QUICK STATS SUMMARY TILES                                        */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Next EU Registry Filing
            </span>
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-slate-900">
              Oct 31
            </span>
            <span className="text-xs font-mono font-semibold text-indigo-700">
              (in 34 days)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
            <span>Q3 2026 Importer Submission</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Buyer Dispatch Deadlines
            </span>
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-slate-900">
              {currentBuyerDeadlines.length}
            </span>
            <span className="text-xs text-slate-500">
              EU Importers
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span>2 Dispatched · 3 Pending · 1 Overdue</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Internal Team Tasks
            </span>
            <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-slate-900">
              {currentTasks.filter((t) => !t.isCompleted).length}
            </span>
            <span className="text-xs text-slate-500">
              Open ({currentTasks.filter((t) => t.isCompleted).length} done)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {teamMembers.length} active assignees in team
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Statutory Milestones
            </span>
            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-emerald-700">
              6 Anchors
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            Through 2034 100% Phase-Out
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 4. MAIN CONTENT AREA: WORKSPACE VIEW OR EMPTY STATE                  */}
      {/* ------------------------------------------------------------------- */}
      {displayState === 'empty' ? (
        /* Empty Workspace State: Show fixed statutory milestones + onboarding guide */
        <div className="bg-white border border-emerald-100 rounded-3xl p-8 sm:p-12 shadow-xs text-center space-y-8">
          <div className="max-w-xl mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-200 shadow-2xs">
              <CalendarDays className="w-8 h-8 stroke-[1.8]" />
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Fresh Workspace: Fixed Regulatory Anchors Pre-Loaded
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              European Commission statutory milestones (quarterly filing dates, annual declarations, and EU ETS free-allocation phase-outs)
              are permanently locked and cannot be deleted. Add internal tasks or connect EU buyers to build your custom schedule.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleSeedSampleSchedule}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Load Sample Operational Schedule</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddTaskModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Internal Task</span>
              </button>
            </div>
          </div>

          {/* Show Fixed Regulatory Milestones Even in Empty State */}
          <div className="text-left space-y-4 pt-6 border-t border-slate-100 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Fixed Statutory Reference Timeline (Active in all workspaces)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                EU Commission Mandate
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {FIXED_REGULATORY_MILESTONES.map((sm) => (
                <div
                  key={sm.id}
                  className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 text-xs font-bold font-mono">
                    {sm.date.split('-')[1]}/{sm.date.split('-')[2]}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xs font-bold text-slate-900 truncate">
                        {sm.title}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-indigo-700">
                      {sm.regulationRef}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {sm.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Active Workspace: Hybrid View (Timeline / Calendar) + Task List Panel */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* --------------------------------------------------------------- */}
          {/* 4A. MAIN CALENDAR / TIMELINE HYBRID COLUMN (8 COLUMNS)          */}
          {/* --------------------------------------------------------------- */}
          <div className="lg:col-span-8 space-y-6">
            {/* View Mode & Filter Bar */}
            <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Timeline vs Calendar Toggle */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setViewMode('timeline')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'timeline'
                      ? 'bg-white text-emerald-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Timeline Stream</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'calendar'
                      ? 'bg-white text-emerald-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>Month Grid</span>
                </button>
              </div>

              {/* Type Category Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto text-xs">
                {[
                  { id: 'all', label: 'All Events' },
                  { id: 'statutory', label: 'EU Statutory' },
                  { id: 'buyer', label: 'Buyer Deadlines' },
                  { id: 'task', label: 'Team Tasks' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTypeFilter(t.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                      typeFilter === t.id
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* VIEW MODE 1: LINEAR TIMELINE STREAM                           */}
            {/* ------------------------------------------------------------- */}
            {viewMode === 'timeline' && (
              <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <h2 className="font-display text-sm font-bold text-slate-900">
                      Chronological Milestone & Deadline Stream
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500">
                    Showing {timelineItems.length} deadlines & assignments
                  </span>
                </div>

                <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:top-3 before:bottom-3 before:left-3 sm:before:left-4 before:w-0.5 before:bg-slate-200">
                  {timelineItems.map((item, index) => {
                    const isOverdue = item.isOverdue;
                    return (
                      <div key={item.id} className="relative group">
                        {/* Timeline Node Icon */}
                        <div
                          className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 ${
                            isOverdue
                              ? 'bg-rose-600 border-white text-white shadow-xs animate-bounce'
                              : item.itemType === 'statutory'
                              ? 'bg-indigo-600 border-white text-white shadow-xs'
                              : item.itemType === 'buyer'
                              ? 'bg-emerald-600 border-white text-white shadow-xs'
                              : 'bg-teal-500 border-white text-white shadow-xs'
                          }`}
                        >
                          {isOverdue ? (
                            <AlertTriangle className="w-3 h-3 stroke-[3]" />
                          ) : item.itemType === 'statutory' ? (
                            <Lock className="w-3 h-3" />
                          ) : item.itemType === 'buyer' ? (
                            <Building2 className="w-3 h-3" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                        </div>

                        {/* Timeline Card */}
                        <div
                          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                            isOverdue
                              ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-400/40 shadow-xs'
                              : item.itemType === 'statutory'
                              ? 'bg-indigo-50/30 border-indigo-200/80 hover:bg-indigo-50/60'
                              : 'bg-white border-slate-200/80 hover:border-emerald-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                    isOverdue
                                      ? 'bg-rose-200 text-rose-900 font-extrabold'
                                      : item.itemType === 'statutory'
                                      ? 'bg-indigo-100 text-indigo-800'
                                      : item.itemType === 'buyer'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-teal-100 text-teal-800'
                                  }`}
                                >
                                  {item.categoryTag}
                                </span>

                                <span className="font-mono text-xs font-bold text-slate-900 flex items-center gap-1">
                                  <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                                  {item.date}
                                </span>

                                <span
                                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                    isOverdue
                                      ? 'bg-rose-600 text-white font-bold'
                                      : item.daysRemaining === 0
                                      ? 'bg-amber-100 text-amber-900'
                                      : item.daysRemaining <= 7
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {isOverdue
                                    ? `${Math.abs(item.daysRemaining)} Days Overdue`
                                    : item.daysRemaining === 0
                                    ? 'Due Today'
                                    : `Due in ${item.daysRemaining} days`}
                                </span>
                              </div>

                              <h3
                                className={`font-display text-sm sm:text-base font-bold ${
                                  isOverdue ? 'text-rose-950 font-extrabold' : 'text-slate-900'
                                }`}
                              >
                                {item.title}
                              </h3>

                              <p className="text-xs text-slate-600 leading-relaxed">
                                {item.subtitle}
                              </p>

                              {/* Calendar-Adjacent Notification Notice */}
                              <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-[11px] text-slate-600">
                                <div className="flex items-center gap-1.5 truncate">
                                  <BellRing className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span className="font-semibold text-slate-700">Notice Alert:</span>
                                  <span className="truncate">Active compliance surveillance tracking this deadline</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">Synced</span>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="shrink-0 self-start sm:self-auto mt-1 sm:mt-0">
                              <span
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${item.statusColor}`}
                              >
                                {item.statusBadge}
                              </span>
                            </div>
                          </div>

                          {/* Action footer for buyer / task */}
                          {item.itemType === 'buyer' && onNavigateStep && (
                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-slate-500">
                                Allocated to: {item.originalData.eoriNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => onNavigateStep('step_3_buyers')}
                                className="font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                              >
                                <span>Generate Declaration in Buyers</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {item.itemType === 'task' && (
                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${item.originalData.assignee.avatarBg}`}
                                >
                                  {item.originalData.assignee.avatarText}
                                </span>
                                <span className="text-slate-600 font-medium">
                                  {item.originalData.assignee.name}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleToggleTask(item.originalData.id)}
                                className="font-semibold text-slate-700 hover:text-emerald-800 flex items-center gap-1"
                              >
                                {item.originalData.isCompleted ? (
                                  <span className="text-emerald-700 flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" /> Done
                                  </span>
                                ) : (
                                  <span>Mark Completed</span>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* VIEW MODE 2: MONTH CALENDAR GRID VIEW                         */}
            {/* ------------------------------------------------------------- */}
            {viewMode === 'calendar' && (
              <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-xs space-y-6">
                {/* Month Navigator Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-lg font-bold text-slate-900">
                      {monthNames[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
                    </h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Q3 / Q4 2026 Reporting
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentMonthDate(
                          new Date(
                            currentMonthDate.getFullYear(),
                            currentMonthDate.getMonth() - 1,
                            1
                          )
                        )
                      }
                      className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentMonthDate(new Date(2026, 9, 1))}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Oct 2026 (Deadline Month)
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentMonthDate(
                          new Date(
                            currentMonthDate.getFullYear(),
                            currentMonthDate.getMonth() + 1,
                            1
                          )
                        )
                      }
                      className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title="Next Month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Days of Week (Mon - Sun) */}
                <div className="grid grid-cols-7 text-center text-xs font-bold uppercase tracking-wider text-slate-400 py-1 border-b border-slate-100">
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                  <div>Sun</div>
                </div>

                {/* 7-Column Days Grid */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {calendarDays.map((cd, index) => {
                    const isSelected = selectedCalendarDate === cd.dateString;
                    const hasOverdue = cd.items.some((it) => it.isOverdue);

                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedCalendarDate(cd.dateString)}
                        className={`min-h-[90px] sm:min-h-[110px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          !cd.isCurrentMonth
                            ? 'bg-slate-50/40 border-slate-100 text-slate-400 opacity-50'
                            : isSelected
                            ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500 shadow-2xs'
                            : hasOverdue
                            ? 'bg-rose-50/40 border-rose-300 hover:border-rose-400'
                            : 'bg-white border-slate-200/80 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                              cd.isToday
                                ? 'bg-emerald-600 text-white font-extrabold shadow-2xs'
                                : isSelected
                                ? 'text-emerald-800'
                                : 'text-slate-800'
                            }`}
                          >
                            {cd.dayNumber}
                          </span>

                          {cd.isToday && (
                            <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-100 px-1 rounded hidden sm:inline">
                              Today
                            </span>
                          )}

                          {hasOverdue && (
                            <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 animate-ping" />
                          )}
                        </div>

                        {/* Events list in cell */}
                        <div className="space-y-1 mt-1">
                          {cd.items.slice(0, 2).map((item) => (
                            <div
                              key={item.id}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate ${item.badgeColor}`}
                              title={item.title}
                            >
                              {item.title}
                            </div>
                          ))}

                          {cd.items.length > 2 && (
                            <div className="text-[10px] font-bold text-slate-500 px-1">
                              +{cd.items.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Day Inspector Panel */}
                {selectedCalendarDate && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800">
                          Events Scheduled on {selectedCalendarDate}:
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {selectedDateEvents.length} item{selectedDateEvents.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {selectedDateEvents.length === 0 ? (
                      <div className="text-xs text-slate-500 italic py-2">
                        No statutory deadlines or buyer dispatches scheduled on this date. Click "+ Add Task" to schedule an activity.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedDateEvents.map((evt) => (
                          <div
                            key={evt.id}
                            className={`p-3 rounded-xl border bg-white ${
                              evt.isOverdue ? 'border-rose-300' : 'border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {evt.categoryTag}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${evt.statusColor}`}
                              >
                                {evt.statusBadge}
                              </span>
                            </div>
                            <div className="font-display text-xs font-bold text-slate-900 mt-1">
                              {evt.title}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {evt.subtitle}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* --------------------------------------------------------------- */}
          {/* 4B. INTERNAL TASK LIST & ASSIGNMENT PANEL (4 COLUMNS)           */}
          {/* --------------------------------------------------------------- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-emerald-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h2 className="font-display text-sm font-bold text-slate-900">
                      Compliance Task List
                    </h2>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Internal assignments & verification prep
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>

              {/* Task Filter Chips */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs overflow-x-auto">
                {[
                  { id: 'all', label: `All (${currentTasks.length})` },
                  { id: 'overdue', label: `Overdue (${overdueTasks.length})` },
                  { id: 'upcoming', label: 'Upcoming' },
                  { id: 'completed', label: 'Done' },
                ].map((tf) => (
                  <button
                    key={tf.id}
                    type="button"
                    onClick={() => setTaskFilter(tf.id as any)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors shrink-0 ${
                      taskFilter === tf.id
                        ? tf.id === 'overdue' && overdueTasks.length > 0
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-white text-emerald-900 shadow-2xs'
                        : tf.id === 'overdue' && overdueTasks.length > 0
                        ? 'text-rose-700 hover:bg-rose-50'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              {/* Task Items */}
              <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                {filteredTasks.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs">No tasks matching the selected filter.</p>
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const isTaskOverdue = !task.isCompleted && (task.isOverdue || task.daysRemaining < 0);

                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          task.isCompleted
                            ? 'bg-slate-50/60 border-slate-200/80 opacity-60'
                            : isTaskOverdue
                            ? 'bg-rose-50/80 border-rose-300 ring-1 ring-rose-400/50'
                            : 'bg-white border-slate-200 hover:border-emerald-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task.id)}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              task.isCompleted
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 hover:border-emerald-500 bg-white'
                            }`}
                          >
                            {task.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>

                          {/* Task Details */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <span
                                className={`font-display text-xs font-bold leading-snug ${
                                  task.isCompleted
                                    ? 'line-through text-slate-400'
                                    : isTaskOverdue
                                    ? 'text-rose-950 font-extrabold'
                                    : 'text-slate-900'
                                }`}
                              >
                                {task.title}
                              </span>

                              <span
                                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                                  isTaskOverdue
                                    ? 'bg-rose-600 text-white'
                                    : task.priority === 'urgent'
                                    ? 'bg-rose-100 text-rose-800'
                                    : task.priority === 'high'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>

                            {/* Meta & Assignee Avatar */}
                            <div className="pt-2 flex items-center justify-between border-t border-slate-100/80 text-[10px]">
                              {/* Assignee Avatar */}
                              <div
                                className="flex items-center gap-1.5"
                                title={`Assigned to ${task.assignee.name} (${task.assignee.role})`}
                              >
                                <span
                                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${task.assignee.avatarBg}`}
                                >
                                  {task.assignee.avatarText}
                                </span>
                                <span className="text-slate-600 font-medium truncate max-w-[110px]">
                                  {task.assignee.name.split(' ')[0]} {task.assignee.name.split(' ')[1]?.[0]}.
                                </span>
                              </div>

                              {/* Due Date Badge */}
                              <div
                                className={`font-mono font-semibold ${
                                  task.isCompleted
                                    ? 'text-slate-400'
                                    : isTaskOverdue
                                    ? 'text-rose-700 font-bold'
                                    : 'text-slate-600'
                                }`}
                              >
                                {isTaskOverdue
                                  ? `${Math.abs(task.daysRemaining)}d OVERDUE`
                                  : `Due ${task.dueDate.split('-')[1]}/${task.dueDate.split('-')[2]}`}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Free Allocation Regulatory Phase-Out Card */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-200/80 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>EU ETS Free Allocation Phase-Out Roadmap</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Under Directive 2003/87/EC, free allocation phases out progressively:
                  <strong className="text-indigo-900 block mt-1">
                    2026: 2.5% · 2027: 5% · 2028: 10% · 2030: 48.5% · 2034: 100%
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 5. ADD TASK MODAL DIALOG                                            */}
      {/* ------------------------------------------------------------------- */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-b border-emerald-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                  Compliance Operations
                </span>
                <h3 className="font-display text-base font-bold text-slate-900 mt-1">
                  Assign New Compliance Task
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTaskModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Collect Q3 electricity sub-meter telemetry for Mill #04"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assignee *
                  </label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="urgent">Urgent (Overdue Risk)</option>
                    <option value="high">High Priority</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="telemetry">Telemetry & Metering</option>
                    <option value="verifier_audit">Verifier Surveillance</option>
                    <option value="buyer_dispatch">Buyer Dispatch & Reconciliation</option>
                    <option value="statutory">Statutory Filing</option>
                    <option value="lab_testing">Lab Assay & Calibration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Linked EU Buyer (Optional)
                </label>
                <select
                  value={newTaskBuyerId}
                  onChange={(e) => setNewTaskBuyerId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">None (Internal Facility Task)</option>
                  {buyers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.companyName} ({b.buyerCountry})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Execution Notes
                </label>
                <textarea
                  rows={3}
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Detail exact operational requirements, data sources, or lab certificate references..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors"
                >
                  Save & Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
