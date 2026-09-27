import React, { useState, useMemo, useEffect, useTransition } from 'react';
import { useCbam } from '../context/CbamContext';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Zap,
  Flame,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Share2,
  Layers,
  Building2,
  Calendar,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Factory,
  Leaf,
  Coins,
  Gauge,
  Percent,
  Cpu,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Globe,
  Radio,
  Clock,
  ArrowUpDown,
  HelpCircle,
  Activity,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface AnalyticsWhatIfViewProps {
  onNavigateStep?: (stepId: string) => void;
  isEmbedded?: boolean;
}

// ---------------------------------------------------------------------------
// Production Route Profiles
// ---------------------------------------------------------------------------
export interface ProductionRoute {
  id: string;
  name: string;
  shortCode: string;
  tagline: string;
  technology: string;
  primaryFuel: string;
  baseDirectSEE: number; // tCO2e / t
  baseIndirectSEE: number; // tCO2e / t (at grid factor)
  basePrecursorSEE: number; // tCO2e / t
  electricityIntensityMWhPerTon: number;
  capexPerTonEur: number;
  opexDeltaEurPerTon: number;
  readinessLevel: 'commercial' | 'mature_transition' | 'pilot_scaling';
  color: string;
  description: string;
}

const PRODUCTION_ROUTES: ProductionRoute[] = [
  {
    id: 'route-bof',
    name: 'Blast Furnace – Basic Oxygen Furnace (BF-BOF)',
    shortCode: 'BF-BOF (Coal/Ore)',
    tagline: 'Traditional carbon-intensive primary route using iron ore, sinter and metallurgical coke.',
    technology: 'Sintering + Blast Furnace + LD Converter + Continuous Casting',
    primaryFuel: 'Coking Coal & Natural Gas',
    baseDirectSEE: 1.82,
    baseIndirectSEE: 0.14,
    basePrecursorSEE: 0.22,
    electricityIntensityMWhPerTon: 0.35,
    capexPerTonEur: 0,
    opexDeltaEurPerTon: -45,
    readinessLevel: 'commercial',
    color: '#E11D48',
    description: 'High direct scope 1 emissions from iron ore carbon reduction. Faces extreme CBAM tariffs as free allocation phases out.',
  },
  {
    id: 'route-eaf-scrap',
    name: 'Electric Arc Furnace – Scrap Recycling (EAF-Scrap)',
    shortCode: 'EAF-Scrap (Current Baseline)',
    tagline: 'Secondary circular recycling using electric arc furnace and 85%+ high-grade scrap.',
    technology: '120t AC Ultra-High-Power EAF + Ladle Furnace + Billet Caster',
    primaryFuel: 'Electricity + Natural Gas Oxyfuel Burners',
    baseDirectSEE: 0.38,
    baseIndirectSEE: 0.19,
    basePrecursorSEE: 0.08,
    electricityIntensityMWhPerTon: 0.48,
    capexPerTonEur: 42,
    opexDeltaEurPerTon: 0,
    readinessLevel: 'commercial',
    color: '#059669',
    description: 'Current Vanguard facility configuration at Aegean Mill #04. Highly competitive under initial CBAM regimes.',
  },
  {
    id: 'route-dri-ng',
    name: 'Direct Reduced Iron (NG) + EAF',
    shortCode: 'DRI-NG + EAF (Transition)',
    tagline: 'Shaft furnace direct reduction using natural gas, melting DRI pellets with scrap.',
    technology: 'Energiron/Midrex Shaft Direct Reduction + Consteel EAF',
    primaryFuel: 'Pipeline Natural Gas + Grid Electricity',
    baseDirectSEE: 0.78,
    baseIndirectSEE: 0.21,
    basePrecursorSEE: 0.12,
    electricityIntensityMWhPerTon: 0.55,
    capexPerTonEur: 160,
    opexDeltaEurPerTon: +28,
    readinessLevel: 'commercial',
    color: '#D97706',
    description: 'Low-capital transitional route reducing emissions ~55% vs BF-BOF, preparing installation for hydrogen drop-in.',
  },
  {
    id: 'route-dri-h2',
    name: 'Green Hydrogen DRI + Zero-Carbon EAF',
    shortCode: 'H₂-DRI + Green EAF (Next-Gen)',
    tagline: '100% green electrolytic hydrogen shaft reduction coupled with renewable-powered EAF.',
    technology: 'PEM Electrolysis + H2-Shaft + EAF + Direct Rolling',
    primaryFuel: 'Green Electrolytic H₂ + 100% Renewable PPA',
    baseDirectSEE: 0.08,
    baseIndirectSEE: 0.04,
    basePrecursorSEE: 0.06,
    electricityIntensityMWhPerTon: 0.72,
    capexPerTonEur: 320,
    opexDeltaEurPerTon: +75,
    readinessLevel: 'mature_transition',
    color: '#2563EB',
    description: 'Flagship zero-fossil architecture. Completely eliminates coal and gas reduction emissions. Lowest possible CBAM certificate liability.',
  },
  {
    id: 'route-moe',
    name: 'Molten Oxide Electrolysis (MOE Direct)',
    shortCode: 'MOE (Direct Electrochemical)',
    tagline: 'Direct liquid iron electrolysis at 1,600°C without coke, releasing only pure oxygen.',
    technology: 'Inert Anode High-Temperature Electrolytic Cell',
    primaryFuel: '100% Dedicated Clean Power',
    baseDirectSEE: 0.02,
    baseIndirectSEE: 0.03,
    basePrecursorSEE: 0.04,
    electricityIntensityMWhPerTon: 0.85,
    capexPerTonEur: 480,
    opexDeltaEurPerTon: +95,
    readinessLevel: 'pilot_scaling',
    color: '#7C3AED',
    description: 'Breakthrough deep-decarbonization technology. Zero Scope 1 direct emissions; completely decouples steelmaking from carbon markets.',
  },
];

// Products with CN Codes and EU Default Benchmarks
interface ProductBenchmark {
  id: string;
  name: string;
  cnCode: string;
  euDefaultBenchmark: number; // tCO2e / t
  historicalData: Array<{
    period: string;
    actualSEE: number;
    direct: number;
    indirect: number;
    precursor: number;
  }>;
}

const PRODUCT_BENCHMARKS: ProductBenchmark[] = [
  {
    id: 'prod-01',
    name: 'Hot-Rolled Steel Coil (S235JR)',
    cnCode: '7208 39 00',
    euDefaultBenchmark: 1.85,
    historicalData: [
      { period: 'Q1 2025', actualSEE: 0.78, direct: 0.44, indirect: 0.24, precursor: 0.10 },
      { period: 'Q2 2025', actualSEE: 0.74, direct: 0.42, indirect: 0.23, precursor: 0.09 },
      { period: 'Q3 2025', actualSEE: 0.71, direct: 0.41, indirect: 0.21, precursor: 0.09 },
      { period: 'Q4 2025', actualSEE: 0.68, direct: 0.39, indirect: 0.20, precursor: 0.09 },
      { period: 'Q1 2026', actualSEE: 0.66, direct: 0.38, indirect: 0.20, precursor: 0.08 },
      { period: 'Q2 2026', actualSEE: 0.65, direct: 0.38, indirect: 0.19, precursor: 0.08 },
      { period: 'Q3 2026', actualSEE: 0.637, direct: 0.372, indirect: 0.185, precursor: 0.080 },
    ],
  },
  {
    id: 'prod-02',
    name: 'B500B High-Yield Deformed Rebar',
    cnCode: '7214 20 00',
    euDefaultBenchmark: 1.95,
    historicalData: [
      { period: 'Q1 2025', actualSEE: 0.69, direct: 0.38, indirect: 0.22, precursor: 0.09 },
      { period: 'Q2 2025', actualSEE: 0.65, direct: 0.36, indirect: 0.21, precursor: 0.08 },
      { period: 'Q3 2025', actualSEE: 0.62, direct: 0.35, indirect: 0.19, precursor: 0.08 },
      { period: 'Q4 2025', actualSEE: 0.59, direct: 0.33, indirect: 0.18, precursor: 0.08 },
      { period: 'Q1 2026', actualSEE: 0.58, direct: 0.33, indirect: 0.18, precursor: 0.07 },
      { period: 'Q2 2026', actualSEE: 0.56, direct: 0.32, indirect: 0.17, precursor: 0.07 },
      { period: 'Q3 2026', actualSEE: 0.555, direct: 0.315, indirect: 0.170, precursor: 0.070 },
    ],
  },
  {
    id: 'prod-03',
    name: 'Heavy Structural Steel IPE 300 Beams',
    cnCode: '7216 32 11',
    euDefaultBenchmark: 2.10,
    historicalData: [
      { period: 'Q1 2025', actualSEE: 0.88, direct: 0.50, indirect: 0.28, precursor: 0.10 },
      { period: 'Q2 2025', actualSEE: 0.83, direct: 0.48, indirect: 0.26, precursor: 0.09 },
      { period: 'Q3 2025', actualSEE: 0.79, direct: 0.46, indirect: 0.24, precursor: 0.09 },
      { period: 'Q4 2025', actualSEE: 0.75, direct: 0.44, indirect: 0.22, precursor: 0.09 },
      { period: 'Q1 2026', actualSEE: 0.74, direct: 0.43, indirect: 0.22, precursor: 0.09 },
      { period: 'Q2 2026', actualSEE: 0.72, direct: 0.42, indirect: 0.21, precursor: 0.09 },
      { period: 'Q3 2026', actualSEE: 0.710, direct: 0.415, indirect: 0.205, precursor: 0.090 },
    ],
  },
  {
    id: 'prod-04',
    name: 'Galvanized Low-Carbon Wire Rod',
    cnCode: '7217 10 10',
    euDefaultBenchmark: 2.25,
    historicalData: [
      { period: 'Q1 2025', actualSEE: 0.98, direct: 0.56, indirect: 0.31, precursor: 0.11 },
      { period: 'Q2 2025', actualSEE: 0.92, direct: 0.53, indirect: 0.29, precursor: 0.10 },
      { period: 'Q3 2025', actualSEE: 0.88, direct: 0.51, indirect: 0.27, precursor: 0.10 },
      { period: 'Q4 2025', actualSEE: 0.85, direct: 0.49, indirect: 0.26, precursor: 0.10 },
      { period: 'Q1 2026', actualSEE: 0.83, direct: 0.48, indirect: 0.25, precursor: 0.10 },
      { period: 'Q2 2026', actualSEE: 0.81, direct: 0.47, indirect: 0.24, precursor: 0.10 },
      { period: 'Q3 2026', actualSEE: 0.795, direct: 0.460, indirect: 0.235, precursor: 0.100 },
    ],
  },
];

export const AnalyticsWhatIfView: React.FC<AnalyticsWhatIfViewProps> = ({ onNavigateStep }) => {
  const { totalShippedTons, activeInstallation, buyers, triggerToast } = useCbam();

  // -------------------------------------------------------------------------
  // STATES: INSUFFICIENT DATA TOGGLE & RECALCULATION FEEDBACK
  // -------------------------------------------------------------------------
  const [dataStateMode, setDataStateMode] = useState<'multi_period' | 'insufficient_data'>('multi_period');
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  // Active Selected Product for Emissions Trend Chart
  const [selectedProductId, setSelectedProductId] = useState<string>('prod-01');

  // -------------------------------------------------------------------------
  // WHAT-IF SIMULATOR CONTROLS
  // -------------------------------------------------------------------------
  const [etsPrice, setEtsPrice] = useState<number>(68.5); // €/tCO2e (Live ETS price default)
  const [targetYear, setTargetYear] = useState<number>(2026); // 2026 to 2034
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-eaf-scrap');
  const [productionShiftPct, setProductionShiftPct] = useState<number>(0); // 0% to 50% shifted to Green H2 route
  const [greenPowerPct, setGreenPowerPct] = useState<number>(60); // % renewable PPA
  const [scrapRatioPct, setScrapRatioPct] = useState<number>(85); // % scrap charge
  const [useH2Reheating, setUseH2Reheating] = useState<boolean>(false); // H2 burner retrofit
  const [buyerTableSearch, setBuyerTableSearch] = useState<string>('');
  const [buyerTableSort, setBuyerTableSort] = useState<'tonnage' | 'cost_exposure' | 'advantage'>('cost_exposure');

  // Live ETS Feed Simulator Tick
  const [lastFeedUpdate, setLastFeedUpdate] = useState<string>('Just now');
  const [feedDelta] = useState<string>('+€0.45 (+0.66%)');

  // Trigger recalculation loading state whenever simulator parameters change
  const triggerRecalculateFeedback = (callback: () => void) => {
    setIsRecalculating(true);
    startTransition(() => {
      callback();
    });
    const timer = setTimeout(() => {
      setIsRecalculating(false);
    }, 280);
    return () => clearTimeout(timer);
  };

  const handleEtsPriceChange = (val: number) => {
    triggerRecalculateFeedback(() => setEtsPrice(val));
  };

  const handleProductionShiftChange = (val: number) => {
    triggerRecalculateFeedback(() => setProductionShiftPct(val));
  };

  const handleGreenPowerChange = (val: number) => {
    triggerRecalculateFeedback(() => setGreenPowerPct(val));
  };

  const handleScrapRatioChange = (val: number) => {
    triggerRecalculateFeedback(() => setScrapRatioPct(val));
  };

  const handleToggleH2 = (checked: boolean) => {
    triggerRecalculateFeedback(() => setUseH2Reheating(checked));
  };

  // -------------------------------------------------------------------------
  // CBAM Phase-Out Factor Calculation (Directive 2003/87/EC & Reg (EU) 2023/956)
  // -------------------------------------------------------------------------
  const getCbamPhaseOutFactor = (year: number): number => {
    switch (year) {
      case 2024:
      case 2025:
        return 0.0;
      case 2026:
        return 0.025; // 2.5%
      case 2027:
        return 0.05; // 5.0%
      case 2028:
        return 0.10; // 10.0%
      case 2029:
        return 0.225; // 22.5%
      case 2030:
        return 0.485; // 48.5%
      case 2031:
        return 0.61; // 61.0%
      case 2032:
        return 0.735; // 73.5%
      case 2033:
        return 0.86; // 86.0%
      case 2034:
      default:
        return 1.0; // 100.0% (Zero free allocation)
    }
  };

  const currentPhaseOutFactor = getCbamPhaseOutFactor(targetYear);

  // Active Route Object
  const activeRoute = useMemo(
    () => PRODUCTION_ROUTES.find((r) => r.id === selectedRouteId) || PRODUCTION_ROUTES[1],
    [selectedRouteId]
  );

  // Compute live adjusted emissions with production shift and levers
  const computedEmissions = useMemo(() => {
    // 1. Scrap charge lever
    const scrapDelta = ((scrapRatioPct - 80) / 100) * 0.35;
    let direct = Math.max(0.015, activeRoute.baseDirectSEE - scrapDelta);

    // 2. H2 Reheating
    if (useH2Reheating && activeRoute.id !== 'route-moe') {
      direct = Math.max(0.01, direct - 0.085);
    }

    // 3. Renewable PPA adjustments
    const gridFactor = 0.412; // kg CO2e / kWh
    const ppaFactor = 0.018; // certified green hydro/wind
    const effectiveGridFactor = (greenPowerPct / 100) * ppaFactor + ((100 - greenPowerPct) / 100) * gridFactor;
    const indirect = Number((activeRoute.electricityIntensityMWhPerTon * effectiveGridFactor).toFixed(3));

    const precursor = activeRoute.basePrecursorSEE;
    let baseTotal = direct + indirect + precursor;

    // 4. Production Shift to Green H2 DRI (which has 0.18 total SEE)
    if (productionShiftPct > 0) {
      const greenH2SEE = 0.18;
      baseTotal = (1 - productionShiftPct / 100) * baseTotal + (productionShiftPct / 100) * greenH2SEE;
    }

    return {
      direct: Number(direct.toFixed(3)),
      indirect: Number(indirect.toFixed(3)),
      precursor: Number(precursor.toFixed(3)),
      total: Number(baseTotal.toFixed(3)),
    };
  }, [activeRoute, scrapRatioPct, useH2Reheating, greenPowerPct, productionShiftPct]);

  // Selected Product Benchmark Profile
  const selectedProduct = useMemo(
    () => PRODUCT_BENCHMARKS.find((p) => p.id === selectedProductId) || PRODUCT_BENCHMARKS[0],
    [selectedProductId]
  );

  // -------------------------------------------------------------------------
  // 1. EMISSIONS TREND CHART DATA
  // -------------------------------------------------------------------------
  // If dataStateMode === 'insufficient_data', only 1 period is available
  const emissionsTrendChartData = useMemo(() => {
    if (dataStateMode === 'insufficient_data') {
      return [
        {
          period: 'Q3 2026',
          actualSEE: computedEmissions.total,
          direct: computedEmissions.direct,
          indirect: computedEmissions.indirect,
          euDefault: selectedProduct.euDefaultBenchmark,
          savingsGap: Number((selectedProduct.euDefaultBenchmark - computedEmissions.total).toFixed(3)),
        },
      ];
    }

    return selectedProduct.historicalData.map((h, idx) => {
      // For Q3 2026, use the live simulated emissions
      const isLatest = idx === selectedProduct.historicalData.length - 1;
      const actual = isLatest ? computedEmissions.total : h.actualSEE;
      const gap = Number((selectedProduct.euDefaultBenchmark - actual).toFixed(3));
      return {
        period: h.period,
        actualSEE: actual,
        direct: isLatest ? computedEmissions.direct : h.direct,
        indirect: isLatest ? computedEmissions.indirect : h.indirect,
        euDefault: selectedProduct.euDefaultBenchmark,
        savingsGap: gap,
      };
    });
  }, [dataStateMode, selectedProduct, computedEmissions]);

  // -------------------------------------------------------------------------
  // 2. COST EXPOSURE CHART DATA (2024 to 2034)
  // -------------------------------------------------------------------------
  const costExposureChartData = useMemo(() => {
    const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034];
    return years.map((yr) => {
      const factor = getCbamPhaseOutFactor(yr);
      const defaultTariff = Number((selectedProduct.euDefaultBenchmark * factor * etsPrice).toFixed(2));
      const bofTariff = Number((2.18 * factor * etsPrice).toFixed(2));
      const actualTariff = Number((computedEmissions.total * factor * etsPrice).toFixed(2));
      const netSavingsPerTon = Math.max(0, Number((defaultTariff - actualTariff).toFixed(2)));

      return {
        year: yr.toString(),
        factorPct: Math.round(factor * 100),
        euDefaultCost: defaultTariff,
        traditionalBofCost: bofTariff,
        actualInstallationCost: actualTariff,
        exporterSavingsMargin: netSavingsPerTon,
      };
    });
  }, [selectedProduct.euDefaultBenchmark, etsPrice, computedEmissions.total]);

  // -------------------------------------------------------------------------
  // 3. BUYER COMPARISON TABLE DATA
  // -------------------------------------------------------------------------
  const buyerComparisonList = useMemo(() => {
    return buyers.map((b) => {
      // Calculate buyer specific intensity based on live simulator
      const buyerTonnage = b.quarterlyShippedTons;
      const actualSEE = computedEmissions.total;
      const defaultSEE = selectedProduct.euDefaultBenchmark;
      const certCostPerTon = Number((actualSEE * currentPhaseOutFactor * etsPrice).toFixed(2));
      const totalExposureEur = Math.round(certCostPerTon * buyerTonnage);
      const defaultCostPerTon = Number((defaultSEE * currentPhaseOutFactor * etsPrice).toFixed(2));
      const totalSavingsVsDefaultEur = Math.round((defaultCostPerTon - certCostPerTon) * buyerTonnage);

      // Cost sensitivity metric (based on country ETS stringency and product margin)
      let sensitivity: 'High' | 'Moderate' | 'Low' = 'Moderate';
      if (b.buyerCountry.includes('DE') || b.buyerCountry.includes('LU')) {
        sensitivity = 'High';
      } else if (b.buyerCountry.includes('FI')) {
        sensitivity = 'High';
      } else if (b.buyerCountry.includes('IT')) {
        sensitivity = 'Moderate';
      } else {
        sensitivity = 'Low';
      }

      return {
        id: b.id,
        companyName: b.companyName,
        buyerCountry: b.buyerCountry,
        eoriNumber: b.eoriNumber,
        contactName: b.primaryContact.name,
        contactEmail: b.primaryContact.email,
        quarterlyTons: buyerTonnage,
        actualIntensity: actualSEE,
        defaultBenchmark: defaultSEE,
        sensitivity,
        certCostPerTon,
        totalExposureEur,
        totalSavingsVsDefaultEur,
      };
    });
  }, [buyers, computedEmissions.total, selectedProduct.euDefaultBenchmark, currentPhaseOutFactor, etsPrice]);

  // Filtered & Sorted Buyer Comparison List
  const filteredBuyerList = useMemo(() => {
    let list = buyerComparisonList.filter(
      (b) =>
        b.companyName.toLowerCase().includes(buyerTableSearch.toLowerCase()) ||
        b.eoriNumber.toLowerCase().includes(buyerTableSearch.toLowerCase()) ||
        b.buyerCountry.toLowerCase().includes(buyerTableSearch.toLowerCase())
    );

    list.sort((a, b) => {
      if (buyerTableSort === 'tonnage') return b.quarterlyTons - a.quarterlyTons;
      if (buyerTableSort === 'cost_exposure') return b.totalExposureEur - a.totalExposureEur;
      if (buyerTableSort === 'advantage') return b.totalSavingsVsDefaultEur - a.totalSavingsVsDefaultEur;
      return 0;
    });

    return list;
  }, [buyerComparisonList, buyerTableSearch, buyerTableSort]);

  // Overall Financial Metrics
  const grossDefaultCostPerTon = Number((selectedProduct.euDefaultBenchmark * currentPhaseOutFactor * etsPrice).toFixed(2));
  const activeTariffPerTon = Number((computedEmissions.total * currentPhaseOutFactor * etsPrice).toFixed(2));
  const savingsVsDefaultPerTon = Number((grossDefaultCostPerTon - activeTariffPerTon).toFixed(2));
  const quarterlySavingsTotal = Math.round(savingsVsDefaultPerTon * totalShippedTons);
  const annualSavingsTotal = quarterlySavingsTotal * 4;

  // Preset Scenario Handlers
  const handleApplyPreset = (preset: 'spot' | 'target2028' | 'clean2030' | 'stress200') => {
    triggerRecalculateFeedback(() => {
      switch (preset) {
        case 'spot':
          setEtsPrice(68.5);
          setTargetYear(2026);
          setSelectedRouteId('route-eaf-scrap');
          setProductionShiftPct(0);
          setGreenPowerPct(60);
          setScrapRatioPct(85);
          setUseH2Reheating(false);
          triggerToast('Applied Baseline Q3 2026 Spot Scenario (€68.50/t).');
          break;
        case 'target2028':
          setEtsPrice(95.0);
          setTargetYear(2028);
          setSelectedRouteId('route-eaf-scrap');
          setProductionShiftPct(20);
          setGreenPowerPct(85);
          setScrapRatioPct(90);
          setUseH2Reheating(true);
          triggerToast('Applied 2028 Horizon: 20% shift to Clean H₂ + 85% Green PPA (€95/t).');
          break;
        case 'clean2030':
          setEtsPrice(135.0);
          setTargetYear(2030);
          setSelectedRouteId('route-dri-h2');
          setProductionShiftPct(50);
          setGreenPowerPct(100);
          setScrapRatioPct(95);
          setUseH2Reheating(true);
          triggerToast('Applied 2030 Transition: 50% shift to Zero-Carbon H₂ (€135/t, 48.5% phase-out).');
          break;
        case 'stress200':
          setEtsPrice(200.0);
          setTargetYear(2034);
          triggerToast('Applied 2034 Full Phase-Out Stress Test (€200/t, 100% CBAM factor).');
          break;
      }
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* ------------------------------------------------------------------- */}
      {/* 1. HEADER & LIVE ETS FEED & DATA STATE CONTROLLER                   */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-100/80 text-emerald-800 border border-emerald-200">
              CBAM Strategic Analytics & Sales Tool
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Directive 2003/87/EC · Reg (EU) 2023/956
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Emissions Intelligence & What-If Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Harness verified emissions data to demonstrate carbon competitiveness to EU buyers, project rising
            CBAM certificate liabilities across the 2026–2034 phase-out, and simulate live decarbonization pathways.
          </p>
        </div>

        {/* Live ETS Price Feed Badge & Data State Switcher */}
        <div className="flex flex-wrap items-center gap-2 bg-white border border-emerald-200 p-2 rounded-2xl shadow-xs self-start md:self-auto shrink-0">
          {/* Live ETS Ticker */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl shadow-2xs text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="font-mono font-bold">
              EU ETS: <span className="text-emerald-400">€{etsPrice.toFixed(2)}</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-medium hidden sm:inline">
              {feedDelta}
            </span>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider pl-1 border-l border-slate-700 hidden lg:inline">
              EEX Live
            </span>
          </div>

          {/* Insufficient-Data Reviewer State Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => {
                setDataStateMode('multi_period');
                triggerToast('Loaded complete 7-quarter historical emissions trend data.');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                dataStateMode === 'multi_period'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Multi-Quarter History
            </button>
            <button
              type="button"
              onClick={() => {
                setDataStateMode('insufficient_data');
                triggerToast('Switched to Insufficient Data State (<2 periods).');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                dataStateMode === 'insufficient_data'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-amber-800 hover:bg-amber-100/50'
              }`}
            >
              Insufficient Data State
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. LIVE RECALCULATION STATUS BANNER (SIMULATOR FEEDBACK STATE)       */}
      {/* ------------------------------------------------------------------- */}
      {isRecalculating && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2.5 text-xs text-emerald-900 font-semibold">
            <RefreshCw className="w-4 h-4 text-emerald-700 animate-spin" />
            <span>Recalculating multi-year CBAM certificate curves & buyer liabilities across models...</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-wider font-bold">
            Simulating live
          </span>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 3. EXECUTIVE KPI TILES                                              */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Simulated Specific SEE
              </span>
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-3xl font-extrabold text-slate-900">
                {computedEmissions.total}
              </span>
              <span className="text-xs font-medium text-slate-500">tCO₂e / ton</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Direct: <strong className="text-slate-700">{computedEmissions.direct}</strong></span>
            <span>Indirect: <strong className="text-slate-700">{computedEmissions.indirect}</strong></span>
            <span>Precursor: <strong className="text-slate-700">{computedEmissions.precursor}</strong></span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                CBAM Certificate Tariff
              </span>
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-3xl font-extrabold text-slate-900">
                €{activeTariffPerTon}
              </span>
              <span className="text-xs font-medium text-slate-500">/ ton product</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Year {targetYear} Factor: <strong className="text-slate-700">{(currentPhaseOutFactor * 100).toFixed(1)}%</strong></span>
            <span>ETS Spot: <strong className="text-slate-700">€{etsPrice}</strong></span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Exporter Advantage vs EU Default
              </span>
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-3xl font-extrabold text-emerald-700">
                +€{savingsVsDefaultPerTon}
              </span>
              <span className="text-xs font-medium text-emerald-600">/ ton saved</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>EU Default Benchmark: <strong className="text-slate-700">€{grossDefaultCostPerTon}</strong></span>
            <span className="text-emerald-700 font-bold">
              {Math.round((1 - activeTariffPerTon / (grossDefaultCostPerTon || 1)) * 100)}% Tariff Shield
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Annual Importer Protection
              </span>
              <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-3xl font-extrabold text-slate-900">
                €{(annualSavingsTotal / 1_000_000).toFixed(2)}M
              </span>
              <span className="text-xs font-medium text-slate-500">/ year</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Annual Volume: <strong className="text-slate-700">{((totalShippedTons * 4) / 1000).toFixed(0)}k tons</strong></span>
            <span className="text-emerald-700 font-semibold">Sales Pitch Asset</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 4. MAIN ANALYTICS GRID: CHARTS + WHAT-IF SIMULATOR                  */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ----------------------------------------------------------------- */}
        {/* LEFT COLUMN: CHARTS 1 & 2 (8 COLUMNS)                             */}
        {/* ----------------------------------------------------------------- */}
        <div className="lg:col-span-8 space-y-8">
          {/* =============================================================== */}
          {/* 1. EMISSIONS TREND CHART (ACTUAL DATA VS EU DEFAULT BENCHMARK)   */}
          {/* =============================================================== */}
          <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-display text-base font-bold text-slate-900">
                    1. Embedded Emissions Intensity Over Time vs. EU Default
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual proof that verified primary monitoring delivers substantial cost savings over EU default penalty values
                </p>
              </div>

              {/* Product Selector for Trend */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-slate-500">Product:</span>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  {PRODUCT_BENCHMARKS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (CN {p.cnCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* STATE A: INSUFFICIENT DATA STATE (NEEDS AT LEAST 2 REPORTING PERIODS) */}
            {dataStateMode === 'insufficient_data' ? (
              <div className="p-8 sm:p-12 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-300 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    Insufficient Historical Data for Trend Projection
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    A minimum of <strong>2 quarterly reporting periods</strong> is required to render a longitudinal emissions trend line.
                    Currently only single-period activity data (Q3 2026: <strong>{computedEmissions.total} tCO₂e/t</strong>) has been verified.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDataStateMode('multi_period');
                      triggerToast('Restored multi-quarter historical timeline.');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Load 7-Quarter Historical Dataset</span>
                  </button>
                </div>
              </div>
            ) : (
              /* REGULAR MULTI-PERIOD CHART */
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                      <span>Verified Specific SEE (tCO₂e/t)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-rose-500 border-t-2 border-dashed border-rose-500"></span>
                      <span>EU Default Benchmark (CN {selectedProduct.cnCode}: {selectedProduct.euDefaultBenchmark})</span>
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Actual data saves ~{Math.round((1 - computedEmissions.total / selectedProduct.euDefaultBenchmark) * 100)}% in carbon penalties
                  </span>
                </div>

                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={emissionsTrendChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="actualSeeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="period" stroke="#64748B" fontSize={11} tickLine={false} />
                      <YAxis
                        stroke="#64748B"
                        fontSize={11}
                        domain={[0, 2.5]}
                        tickFormatter={(val) => `${val}t`}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700">
                                <div className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                                  {label} Compliance Window
                                </div>
                                <div className="space-y-1 pt-1 font-mono text-[11px]">
                                  <div className="flex justify-between gap-4 text-emerald-400 font-bold">
                                    <span>Verified Primary SEE:</span>
                                    <span>{payload[0]?.payload?.actualSEE} tCO₂e/t</span>
                                  </div>
                                  <div className="flex justify-between gap-4 text-rose-400">
                                    <span>EU Default Benchmark:</span>
                                    <span>{payload[0]?.payload?.euDefault} tCO₂e/t</span>
                                  </div>
                                  <div className="flex justify-between gap-4 text-amber-300 pt-1 border-t border-slate-800">
                                    <span>Exporter Margin Advantage:</span>
                                    <span>+{payload[0]?.payload?.savingsGap} tCO₂e/t</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="actualSEE"
                        name="Verified Primary SEE"
                        stroke="#059669"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#actualSeeGrad)"
                      />
                      <ReferenceLine
                        y={selectedProduct.euDefaultBenchmark}
                        stroke="#E11D48"
                        strokeDasharray="4 4"
                        strokeWidth={2}
                        label={{
                          value: `EU Default: ${selectedProduct.euDefaultBenchmark} t`,
                          fill: '#E11D48',
                          position: 'top',
                          fontSize: 10,
                          fontWeight: 'bold',
                        }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* 2. COST EXPOSURE CHART (2026-2034 RISING EXPOSURE CURVE)        */}
          {/* =============================================================== */}
          <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-blue-600" />
                  <h2 className="font-display text-base font-bold text-slate-900">
                    2. CBAM Cost Exposure Curve Across Free-Allocation Phase-Out (2026–2034)
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Overlaid with the statutory EU ETS free-allocation phase-out schedule (Directive 2003/87/EC Art 10a) at €{etsPrice}/t
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  Phase-Out: 2.5% (2026) → 100% (2034)
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                    <span className="font-bold text-slate-900">Your Actual Installation Tariff</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-slate-400 border-t-2 border-dashed border-slate-400"></span>
                    <span>EU Default Benchmark Tariff</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-rose-500 border-t-2 border-rose-500"></span>
                    <span>Traditional BF-BOF Route</span>
                  </span>
                </div>
                <span className="text-[11px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                  Green Shaded Zone = Cumulative Buyer Savings
                </span>
              </div>

              <div className="h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={costExposureChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="costSavingsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="year" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#64748B"
                      fontSize={11}
                      tickFormatter={(val) => `€${val}`}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700">
                              <div className="font-bold text-slate-200 border-b border-slate-700 pb-1 flex justify-between gap-4">
                                <span>Year {label}</span>
                                <span className="text-emerald-400 font-mono">
                                  Phase-Out: {payload[0]?.payload?.factorPct}%
                                </span>
                              </div>
                              <div className="space-y-1 pt-1 font-mono text-[11px]">
                                <div className="flex justify-between gap-4 text-rose-400">
                                  <span>Traditional BF-BOF:</span>
                                  <span>€{payload[0]?.payload?.traditionalBofCost} / t</span>
                                </div>
                                <div className="flex justify-between gap-4 text-slate-300">
                                  <span>EU Default Benchmark:</span>
                                  <span>€{payload[0]?.payload?.euDefaultCost} / t</span>
                                </div>
                                <div className="flex justify-between gap-4 text-emerald-400 font-bold">
                                  <span>Your Actual Route:</span>
                                  <span>€{payload[0]?.payload?.actualInstallationCost} / t</span>
                                </div>
                                <div className="flex justify-between gap-4 text-amber-300 pt-1 border-t border-slate-800">
                                  <span>Retained Importer Advantage:</span>
                                  <span>+€{payload[0]?.payload?.exporterSavingsMargin} / t</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {/* Exporter savings zone */}
                    <Area
                      type="monotone"
                      dataKey="exporterSavingsMargin"
                      name="Retained Buyer Margin"
                      fill="url(#costSavingsGrad)"
                      stroke="#059669"
                      strokeWidth={1}
                    />
                    {/* Comparative Curves */}
                    <Line
                      type="monotone"
                      dataKey="traditionalBofCost"
                      name="Traditional BF-BOF"
                      stroke="#E11D48"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="euDefaultCost"
                      name="EU Default Benchmark"
                      stroke="#64748B"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="actualInstallationCost"
                      name="Your Actual Tariff"
                      stroke="#059669"
                      strokeWidth={3}
                      dot={{ r: 3, fill: '#059669' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* RIGHT COLUMN: 4. WHAT-IF SIMULATOR INTERACTIVE PANEL (4 COLUMNS) */}
        {/* ----------------------------------------------------------------- */}
        <div className="lg:col-span-4 bg-white border border-emerald-100 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <h2 className="font-display text-sm font-bold text-slate-900">
                4. What-If Simulator Panel
              </h2>
            </div>
            <button
              type="button"
              onClick={() => handleApplyPreset('spot')}
              className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          <p className="text-xs text-slate-500 leading-snug">
            Adjust scenario variables below to see charts and buyer liability metrics recalculate live.
          </p>

          <div className="space-y-5">
            {/* Control 1: ETS Price Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-600" />
                  <span>EU ETS Carbon Price</span>
                </label>
                <span className="font-display text-sm font-extrabold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                  €{etsPrice.toFixed(1)} / tCO₂e
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="220"
                step="2.5"
                value={etsPrice}
                onChange={(e) => handleEtsPriceChange(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>€40 (Low)</span>
                <span>€68.5 (Spot)</span>
                <span>€140 (2030)</span>
                <span>€220 (High)</span>
              </div>
            </div>

            {/* Control 2: Shift Production to Low-Carbon Route (%) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Factory className="w-3.5 h-3.5 text-blue-600" />
                  <span>Shift Volume to Clean H₂ Route</span>
                </label>
                <span className="font-display text-sm font-extrabold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                  {productionShiftPct}% Shifted
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={productionShiftPct}
                onChange={(e) => handleProductionShiftChange(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% (Baseline)</span>
                <span>20% (Partial)</span>
                <span>50% (Max Capacity)</span>
              </div>
            </div>

            {/* Control 3: CBAM Phase-Out Horizon Target Year */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Compliance Target Year</span>
                </label>
                <span className="font-display text-sm font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                  {targetYear} ({(currentPhaseOutFactor * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[2026, 2028, 2030, 2034].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => triggerRecalculateFeedback(() => setTargetYear(yr))}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                      targetYear === yr
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* Control 4: Renewable Electricity PPA Share */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Renewable PPA Share (Scope 2)</span>
                </label>
                <span className="font-display text-sm font-extrabold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                  {greenPowerPct}% Green PPA
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={greenPowerPct}
                onChange={(e) => handleGreenPowerChange(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>

            {/* Control 5: Scrap Charge Ratio */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Scrap Charge in EAF</span>
                </label>
                <span className="font-display text-sm font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  {scrapRatioPct}% Scrap
                </span>
              </div>
              <input
                type="range"
                min="70"
                max="100"
                step="5"
                value={scrapRatioPct}
                onChange={(e) => handleScrapRatioChange(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>

            {/* Control 6: Green H2 Reheating Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Green H₂ Reheat Burners
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Eliminates NG furnace combustion
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={useH2Reheating}
                  onChange={(e) => handleToggleH2(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>
            </div>

            {/* Quick Presets Shortcut */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Preset Decarbonization Pathways:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('target2028')}
                  className="p-2 text-left bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-xl text-xs transition-colors"
                >
                  <div className="font-bold text-slate-900">2028 Horizon</div>
                  <div className="text-[10px] text-slate-500">20% H₂ · €95 ETS</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyPreset('clean2030')}
                  className="p-2 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl text-xs transition-colors"
                >
                  <div className="font-bold text-blue-900">2030 Clean H₂</div>
                  <div className="text-[10px] text-blue-600">50% H₂ · €135 ETS</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 5. BUYER COMPARISON TABLE: EMISSIONS INTENSITY & COST SENSITIVITY   */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <h2 className="font-display text-base font-bold text-slate-900">
                3. EU Buyer Portfolio Carbon Intensity & Exposure Table
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Identify which EU buyer relationships and destination markets are most cost-sensitive to fluctuating carbon prices
            </p>
          </div>

          {/* Search & Sort Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search buyer or EORI..."
                value={buyerTableSearch}
                onChange={(e) => setBuyerTableSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 w-44"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="text-[11px] font-semibold text-slate-400">Sort by:</span>
              <select
                value={buyerTableSort}
                onChange={(e) => setBuyerTableSort(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="cost_exposure">Total CBAM Cost Exposure</option>
                <option value="advantage">Exporter Margin Advantage (€)</option>
                <option value="tonnage">Shipped Tonnage</option>
              </select>
            </div>
          </div>
        </div>

        {/* High-Density Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">EU Buyer / Market</th>
                <th className="py-3 px-4">EORI Number</th>
                <th className="py-3 px-4 text-right">Shipped Tonnage</th>
                <th className="py-3 px-4 text-right">Actual SEE (tCO₂e/t)</th>
                <th className="py-3 px-4 text-center">Cost Sensitivity</th>
                <th className="py-3 px-4 text-right">CBAM Tariff / t</th>
                <th className="py-3 px-4 text-right">Total Buyer Exposure</th>
                <th className="py-3 px-4 text-right font-extrabold text-emerald-800">Your Sales Edge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredBuyerList.map((buyer) => (
                <tr key={buyer.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{buyer.companyName}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Globe className="w-3 h-3 text-slate-400" />
                      <span>{buyer.buyerCountry}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                    {buyer.eoriNumber}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800">
                    {buyer.quarterlyTons.toLocaleString()} t
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="font-mono font-bold text-slate-900">
                      {buyer.actualIntensity}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-medium">
                      vs {buyer.defaultBenchmark} default
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        buyer.sensitivity === 'High'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : buyer.sensitivity === 'Moderate'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {buyer.sensitivity}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    €{buyer.certCostPerTon.toFixed(2)}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-900">
                    €{buyer.totalExposureEur.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                      +€{buyer.totalSavingsVsDefaultEur.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sales Pitch Summary Footer */}
        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900">
                Commercial Sales Tool Summary:
              </span>
              <p className="text-slate-600 mt-0.5">
                Supplying Vanguard verified low-carbon steel shields your 6 EU buyers from{' '}
                <strong className="text-emerald-800">€{(annualSavingsTotal / 1_000_000).toFixed(2)}M in annual CBAM certificate penalties</strong>{' '}
                they would otherwise owe customs authorities under default benchmark rates.
              </p>
            </div>
          </div>

          {onNavigateStep && (
            <button
              type="button"
              onClick={() => onNavigateStep('step_7_reports')}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-2xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <span>Generate Buyer Pitch Package</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
