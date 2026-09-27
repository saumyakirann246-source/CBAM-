import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  InstallationFacility,
  ProductItem,
  BuyerRelationship,
  EmissionsQuarterData,
  DocumentVaultItem,
  ComplianceMilestone,
  NotificationItem,
  NotificationPreferenceSetting,
  UserPersona,
  BuyerFormat,
  DispatchStatus,
} from '../types/cbam';
import {
  mockInstallations,
  mockPersonas,
  mockProducts,
  mockBuyers,
  mockEmissionsQ3,
  mockVaultDocuments,
  mockMilestones,
  mockNotifications,
} from '../data/mockCbamData';

export type ViewType =
  | 'dashboard'
  | 'buyers'
  | 'catalog'
  | 'emissions'
  | 'vault'
  | 'reports'
  | 'calendar'
  | 'simulator'
  | 'team'
  | 'notifications';

interface CbamContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  activePersona: UserPersona;
  setActivePersona: (persona: UserPersona) => void;
  activeInstallation: InstallationFacility;
  setActiveInstallation: (facility: InstallationFacility) => void;
  selectedQuarter: string;
  setSelectedQuarter: (quarter: string) => void;
  
  // Data states
  buyers: BuyerRelationship[];
  products: ProductItem[];
  emissionsData: EmissionsQuarterData;
  vaultDocuments: DocumentVaultItem[];
  milestones: ComplianceMilestone[];
  notifications: NotificationItem[];
  
  // Actions
  dispatchToBuyer: (buyerId: string, format: BuyerFormat) => void;
  addBuyer: (buyer: Omit<BuyerRelationship, 'id'>) => void;
  updateBuyerStatus: (buyerId: string, status: DispatchStatus) => void;
  addProduct: (product: Omit<ProductItem, 'id'>) => void;
  updateEmissionsInput: (newEmissions: Partial<EmissionsQuarterData>) => void;
  addVaultDocument: (doc: Omit<DocumentVaultItem, 'id' | 'sha256Hash'>) => void;
  verifyDocumentAsAuditor: (docId: string, remarks: string) => void;
  markNotificationRead: (notifId: string) => void;
  markNotificationUnread: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (notifId: string) => void;
  clearAllNotifications: () => void;
  restoreSampleNotifications: () => void;
  notificationPreferences: NotificationPreferenceSetting[];
  updateNotificationPreference: (id: string, updates: Partial<NotificationPreferenceSetting>) => void;
  toggleMilestoneStatus: (milestoneId: string) => void;
  
  // Aggregated calculations
  totalShippedTons: number;
  totalEmbeddedEmissions_tCO2e: number;
  averageSpecificEmissions: number;
  totalSavingsVsEuDefaultEur: number;
  complianceReadinessPercent: number;
  unreadNotificationsCount: number;

  // Modals & Interactive helpers
  dispatchModalBuyer: BuyerRelationship | null;
  setDispatchModalBuyer: (buyer: BuyerRelationship | null) => void;
  isAddBuyerOpen: boolean;
  setIsAddBuyerOpen: (open: boolean) => void;
  isAddProductOpen: boolean;
  setIsAddProductOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  activeToast: string | null;
  triggerToast: (msg: string) => void;
}

const CbamContext = createContext<CbamContextType | undefined>(undefined);

export const CbamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [activePersona, setActivePersona] = useState<UserPersona>(mockPersonas[0]);
  const [activeInstallation, setActiveInstallation] = useState<InstallationFacility>(mockInstallations[0]);
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q3 2026');
  
  const [buyers, setBuyers] = useState<BuyerRelationship[]>(mockBuyers);
  const [products, setProducts] = useState<ProductItem[]>(mockProducts);
  const [emissionsData, setEmissionsData] = useState<EmissionsQuarterData>(mockEmissionsQ3);
  const [vaultDocuments, setVaultDocuments] = useState<DocumentVaultItem[]>(mockVaultDocuments);
  const [milestones, setMilestones] = useState<ComplianceMilestone[]>(mockMilestones);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferenceSetting[]>([
    {
      id: 'pref-deadline',
      categoryKey: 'deadline_alerts',
      label: 'Statutory Deadlines & Data Freezes',
      description: 'Alerts for EU quarterly registry submission windows, verification locks, and buyer deadline compliance.',
      inApp: true,
      email: true,
      frequency: 'instant',
      minUrgency: 'all',
    },
    {
      id: 'pref-buyers',
      categoryKey: 'buyer_requests',
      label: 'Buyer Requests & Inquiries',
      description: 'Requests for Annex IV communication sheets, custom format revisions, and counterparty communications.',
      inApp: true,
      email: true,
      frequency: 'instant',
      minUrgency: 'all',
    },
    {
      id: 'pref-verification',
      categoryKey: 'verification_status',
      label: 'Verification & Audit Statements',
      description: 'Notifications when TÜV SÜD or accredited auditors sign certificates, issue notes, or sync ledger hashes.',
      inApp: true,
      email: false,
      frequency: 'daily_digest',
      minUrgency: 'all',
    },
    {
      id: 'pref-regulatory',
      categoryKey: 'regulatory_updates',
      label: 'Regulatory & Methodology Updates',
      description: 'DG TAXUD guidance revisions, updated default benchmark emission values, and ETS pricing surge alerts.',
      inApp: true,
      email: false,
      frequency: 'weekly_summary',
      minUrgency: 'all',
    },
    {
      id: 'pref-team',
      categoryKey: 'team_activity',
      label: 'Team Tasks & Internal Collaboration',
      description: 'Internal assignments across facilities, telemetry upload confirmations, and compliance comments.',
      inApp: true,
      email: false,
      frequency: 'daily_digest',
      minUrgency: 'critical_only',
    },
  ]);

  // Modals
  const [dispatchModalBuyer, setDispatchModalBuyer] = useState<BuyerRelationship | null>(null);
  const [isAddBuyerOpen, setIsAddBuyerOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setTimeout(() => {
      setActiveToast(msg);
    }, 0);
    setTimeout(() => {
      setActiveToast((current) => (current === msg ? null : current));
    }, 4000);
  };

  // Actions
  const dispatchToBuyer = (buyerId: string, format: BuyerFormat) => {
    const timestamp = new Date().toISOString();
    const ackRef = `EXP-CBAM-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setBuyers((prev) =>
      prev.map((b) => {
        if (b.id === buyerId) {
          return {
            ...b,
            preferredFormat: format,
            status: 'dispatched',
            lastDispatchDate: timestamp,
            acknowledgmentRef: ackRef,
          };
        }
        return b;
      })
    );

    const buyer = buyers.find((b) => b.id === buyerId);
    triggerToast(`CBAM Data Package successfully dispatched to ${buyer?.companyName ?? 'Buyer'} in ${format.toUpperCase()} format! Reference: ${ackRef}`);
  };

  const addBuyer = (newBuyer: Omit<BuyerRelationship, 'id'>) => {
    const id = `buyer-${Date.now()}`;
    const fullBuyer: BuyerRelationship = {
      ...newBuyer,
      id,
      status: 'ready',
      lastDispatchDate: null,
    };
    setBuyers((prev) => [fullBuyer, ...prev]);
    triggerToast(`New EU Importer "${fullBuyer.companyName}" successfully connected to installation!`);
  };

  const updateBuyerStatus = (buyerId: string, status: DispatchStatus) => {
    setBuyers((prev) =>
      prev.map((b) => (b.id === buyerId ? { ...b, status } : b))
    );
  };

  const addProduct = (newProduct: Omit<ProductItem, 'id'>) => {
    const id = `prod-${Date.now()}`;
    const total =
      newProduct.directEmissions_tCO2e_per_t +
      newProduct.indirectEmissions_tCO2e_per_t +
      newProduct.precursorEmissions_tCO2e_per_t;
    const fullProduct: ProductItem = {
      ...newProduct,
      id,
      totalEmissions_tCO2e_per_t: Number(total.toFixed(3)),
    };
    setProducts((prev) => [fullProduct, ...prev]);
    triggerToast(`Product "${fullProduct.name}" added to installation catalog!`);
  };

  const updateEmissionsInput = (newEmissions: Partial<EmissionsQuarterData>) => {
    setEmissionsData((prev) => ({
      ...prev,
      ...newEmissions,
    }));
    triggerToast('Emissions balance recalculation completed! Specific embedded figures updated across product catalog.');
  };

  const addVaultDocument = (doc: Omit<DocumentVaultItem, 'id' | 'sha256Hash'>) => {
    const id = `doc-${Date.now()}`;
    // Simple mock SHA256
    const randomHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newDoc: DocumentVaultItem = {
      ...doc,
      id,
      sha256Hash: randomHash,
    };
    setVaultDocuments((prev) => [newDoc, ...prev]);
    triggerToast(`Compliance document "${newDoc.title}" sealed & anchored in vault!`);
  };

  const verifyDocumentAsAuditor = (docId: string, remarks: string) => {
    setVaultDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              status: 'verified_clean',
              auditOpinion: remarks,
            }
          : d
      )
    );
    triggerToast('Verifier audit sign-off applied! Certificate status updated to Verified Clean.');
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    );
  };

  const markNotificationUnread = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: false } : n))
    );
    triggerToast('Notification marked as unread.');
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    triggerToast('All notifications marked as read.');
  };

  const deleteNotification = (notifId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    triggerToast('Notification dismissed.');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    triggerToast('All notifications cleared (All Caught Up state).');
  };

  const restoreSampleNotifications = () => {
    setNotifications(mockNotifications);
    triggerToast('Sample compliance notifications restored.');
  };

  const updateNotificationPreference = (
    id: string,
    updates: Partial<NotificationPreferenceSetting>
  ) => {
    setNotificationPreferences((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    triggerToast('Notification delivery preferences updated.');
  };

  const toggleMilestoneStatus = (milestoneId: string) => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              status: m.status === 'completed' ? 'upcoming' : 'completed',
            }
          : m
      )
    );
  };

  // Aggregated calculations
  const totalShippedTons = useMemo(() => {
    return buyers.reduce((acc, b) => acc + b.quarterlyShippedTons, 0);
  }, [buyers]);

  const totalEmbeddedEmissions_tCO2e = useMemo(() => {
    return Number(buyers.reduce((acc, b) => acc + b.embeddedEmissionsTotal_tCO2e, 0).toFixed(1));
  }, [buyers]);

  const averageSpecificEmissions = useMemo(() => {
    if (totalShippedTons === 0) return 0;
    return Number((totalEmbeddedEmissions_tCO2e / totalShippedTons).toFixed(3));
  }, [totalShippedTons, totalEmbeddedEmissions_tCO2e]);

  // Financial savings vs EU Default values:
  // EU Default is ~1.85 tCO2e/t vs our actual ~0.65 tCO2e/t -> delta is ~1.20 tCO2e/t saved
  // At current EU ETS price of €68.50/tCO2e
  const totalSavingsVsEuDefaultEur = useMemo(() => {
    const etsPrice = 68.50;
    let savingsEur = 0;
    buyers.forEach((b) => {
      // Calculate what default would have cost vs actual
      const actualEmissions = b.embeddedEmissionsTotal_tCO2e;
      const defaultEmissions = b.quarterlyShippedTons * 1.82; // average default benchmark
      const avoidedEmissions = Math.max(0, defaultEmissions - actualEmissions);
      savingsEur += avoidedEmissions * etsPrice;
    });
    return Math.round(savingsEur);
  }, [buyers]);

  const complianceReadinessPercent = useMemo(() => {
    const acceptedCount = buyers.filter((b) => b.status === 'buyer_accepted' || b.status === 'dispatched').length;
    return Math.round((acceptedCount / buyers.length) * 100);
  }, [buyers]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  return (
    <CbamContext.Provider
      value={{
        currentView,
        setCurrentView,
        activePersona,
        setActivePersona,
        activeInstallation,
        setActiveInstallation,
        selectedQuarter,
        setSelectedQuarter,
        buyers,
        products,
        emissionsData,
        vaultDocuments,
        milestones,
        notifications,
        dispatchToBuyer,
        addBuyer,
        updateBuyerStatus,
        addProduct,
        updateEmissionsInput,
        addVaultDocument,
        verifyDocumentAsAuditor,
        markNotificationRead,
        markNotificationUnread,
        markAllNotificationsRead,
        deleteNotification,
        clearAllNotifications,
        restoreSampleNotifications,
        notificationPreferences,
        updateNotificationPreference,
        toggleMilestoneStatus,
        totalShippedTons,
        totalEmbeddedEmissions_tCO2e,
        averageSpecificEmissions,
        totalSavingsVsEuDefaultEur,
        complianceReadinessPercent,
        unreadNotificationsCount,
        dispatchModalBuyer,
        setDispatchModalBuyer,
        isAddBuyerOpen,
        setIsAddBuyerOpen,
        isAddProductOpen,
        setIsAddProductOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        activeToast,
        triggerToast,
      }}
    >
      {children}
    </CbamContext.Provider>
  );
};

export const useCbam = () => {
  const context = useContext(CbamContext);
  if (!context) {
    throw new Error('useCbam must be used within a CbamProvider');
  }
  return context;
};
