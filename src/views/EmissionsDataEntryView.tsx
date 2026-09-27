import React, { useState } from 'react';
import { useCbam } from '../context/CbamContext';
import { FuelEntry, ProcessEmissionEntry } from '../types/cbam';
import {
  Flame,
  Zap,
  Lock,
  CheckCircle2,
  Plus,
  RefreshCw,
  Calculator,
  ShieldCheck,
  FileCheck,
  HelpCircle,
  TrendingDown,
} from 'lucide-react';

export const EmissionsDataEntryView: React.FC = () => {
  const {
    emissionsData,
    updateEmissionsInput,
    selectedQuarter,
    activeInstallation,
    triggerToast,
  } = useCbam();

  const [grossProductionTons, setGrossProductionTons] = useState(emissionsData.grossProductionTons);
  const [usePPA, setUsePPA] = useState(emissionsData.indirectEmissions.usePPA);
  const [electricityMWh, setElectricityMWh] = useState(emissionsData.indirectEmissions.electricityConsumptionMWh);
  const [gridFactor, setGridFactor] = useState(emissionsData.indirectEmissions.gridEmissionFactor);
  const [ppaFactor, setPpaFactor] = useState(emissionsData.indirectEmissions.ppaFactor);
  const [fuels, setFuels] = useState<FuelEntry[]>(emissionsData.directEmissions.fuels);
  const [processes, setProcesses] = useState<ProcessEmissionEntry[]>(emissionsData.directEmissions.process);

  // Recalculations
  const totalDirectFuels = fuels.reduce((acc, f) => acc + f.totalEmissions_tCO2e, 0);
  const totalDirectProcesses = processes.reduce((acc, p) => acc + p.totalEmissions_tCO2e, 0);
  const totalDirect_tCO2e = Number((totalDirectFuels + totalDirectProcesses).toFixed(1));

  const effectiveElectricityFactor = usePPA ? (0.6 * ppaFactor + 0.4 * gridFactor) : gridFactor;
  const totalIndirect_tCO2e = Number((electricityMWh * effectiveElectricityFactor).toFixed(1));

  const grandTotal_tCO2e = Number((totalDirect_tCO2e + totalIndirect_tCO2e).toFixed(1));
  const specificDirectSEE = grossProductionTons > 0 ? Number((totalDirect_tCO2e / grossProductionTons).toFixed(3)) : 0;
  const specificIndirectSEE = grossProductionTons > 0 ? Number((totalIndirect_tCO2e / grossProductionTons).toFixed(3)) : 0;
  const specificTotalSEE = Number((specificDirectSEE + specificIndirectSEE).toFixed(3));

  const handleUpdateFuelAmount = (id: string, newAmount: number) => {
    setFuels((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const total = Number((newAmount * f.netCalorificValue * f.emissionFactor).toFixed(1));
          return { ...f, amount: newAmount, totalEmissions_tCO2e: total };
        }
        return f;
      })
    );
  };

  const handleSaveAndRecalculate = () => {
    updateEmissionsInput({
      grossProductionTons,
      directEmissions: {
        fuels,
        process: processes,
        totalDirect_tCO2e,
      },
      indirectEmissions: {
        electricityConsumptionMWh: electricityMWh,
        gridEmissionFactor: gridFactor,
        ppaFactor,
        usePPA,
        totalIndirect_tCO2e,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs text-slate-400">
            Installation GHG Ledger · {activeInstallation.name}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Quarterly Emissions Accounting & Calculation Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Record Scope 1 fuel combustions, metallurgical process reactions, and Scope 2 electricity consumption under European Commission Regulation 2023/1773.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 font-mono">
            <Lock className="w-3.5 h-3.5" />
            <span>Audited & Verified (TÜV SÜD)</span>
          </div>

          <button
            onClick={handleSaveAndRecalculate}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Recalculate Golden SEE
          </button>
        </div>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Total Direct Emissions (Scope 1)</div>
          <div className="mt-2 text-xl font-bold font-mono text-white tabular-nums">
            {totalDirect_tCO2e.toLocaleString()}{' '}
            <span className="text-xs text-slate-400 font-normal">tCO₂e</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            SEE: {specificDirectSEE} tCO₂e / t good
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Total Indirect Emissions (Scope 2)</div>
          <div className="mt-2 text-xl font-bold font-mono text-white tabular-nums">
            {totalIndirect_tCO2e.toLocaleString()}{' '}
            <span className="text-xs text-slate-400 font-normal">tCO₂e</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            SEE: {specificIndirectSEE} tCO₂e / t good
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Combined Installation Total</div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-400 tabular-nums">
            {grandTotal_tCO2e.toLocaleString()}{' '}
            <span className="text-xs text-slate-400 font-normal">tCO₂e</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            Net Activity Level: {grossProductionTons.toLocaleString()} t
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Total Specific SEE</div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-300 tabular-nums">
            {specificTotalSEE}{' '}
            <span className="text-xs text-slate-400 font-normal">tCO₂e/t</span>
          </div>
          <div className="text-xs text-emerald-400 mt-1">
            -64% lower than EU default benchmark
          </div>
        </div>
      </div>

      {/* Production Run Setting */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-200">
            Installation Activity Level ({selectedQuarter})
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Verified metric tons of steel billets and hot-rolled coils produced during the period.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={grossProductionTons}
            onChange={(e) => setGrossProductionTons(Number(e.target.value))}
            className="w-36 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white text-right focus:outline-none focus:border-emerald-500"
          />
          <span className="text-xs text-slate-400">metric tons</span>
        </div>
      </div>

      {/* Section 1: Direct Emissions (Scope 1) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Direct Fuel Combustion & Process Activity</h2>
              <div className="text-xs text-slate-400">Natural gas, light fuel oil, graphite electrode consumption</div>
            </div>
          </div>
          <div className="text-xs font-mono text-slate-300 font-bold">
            Subtotal: {totalDirect_tCO2e.toLocaleString()} tCO₂e
          </div>
        </div>

        {/* Fuels Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Fuel / Energy Stream</th>
                <th className="py-2.5 px-3">Activity Consumption</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3">NCV (GJ/unit)</th>
                <th className="py-2.5 px-3">EF (tCO₂/GJ)</th>
                <th className="py-2.5 px-3 text-right">Total Emissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {fuels.map((fuel) => (
                <tr key={fuel.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-medium text-slate-200">{fuel.fuelType}</td>
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      value={fuel.amount}
                      onChange={(e) => handleUpdateFuelAmount(fuel.id, Number(e.target.value))}
                      className="w-32 px-2 py-1 bg-slate-950 border border-slate-800 rounded font-mono text-slate-100 text-right focus:outline-none focus:border-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">{fuel.unit}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">{fuel.netCalorificValue}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">{fuel.emissionFactor}</td>
                  <td className="py-3 px-3 font-mono font-bold text-white text-right tabular-nums">
                    {fuel.totalEmissions_tCO2e.toLocaleString()} tCO₂e
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Process Emissions */}
        <div className="pt-2">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Metallurgical & Chemical Process Sources
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {processes.map((proc) => (
              <div
                key={proc.id}
                className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200">{proc.source}</div>
                  <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                    {proc.activityAmount} {proc.unit} × {proc.emissionFactor} tCO₂/t
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-white">
                  {proc.totalEmissions_tCO2e.toLocaleString()} tCO₂e
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Indirect Emissions (Scope 2) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-yellow-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Indirect Electricity Accounting</h2>
              <div className="text-xs text-slate-400">Turkish transmission grid vs Verified Renewable PPA contracts</div>
            </div>
          </div>
          <div className="text-xs font-mono text-slate-300 font-bold">
            Subtotal: {totalIndirect_tCO2e.toLocaleString()} tCO₂e
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Metered Electricity (MWh)
            </label>
            <input
              type="number"
              value={electricityMWh}
              onChange={(e) => setElectricityMWh(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-white text-right focus:outline-none focus:border-emerald-500"
            />
            <div className="text-[11px] text-slate-400">
              Verified by TEİAŞ substation telemetry meters
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Country Grid Factor (Turkey)
            </label>
            <input
              type="number"
              step="0.001"
              value={gridFactor}
              onChange={(e) => setGridFactor(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-white text-right focus:outline-none focus:border-emerald-500"
            />
            <div className="text-[11px] text-slate-400">
              Official IEA / EU CBAM country benchmark default
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">
                PPA Contract Factor
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-emerald-400">
                <input
                  type="checkbox"
                  checked={usePPA}
                  onChange={(e) => setUsePPA(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Apply PPA</span>
              </label>
            </div>
            <input
              type="number"
              step="0.001"
              disabled={!usePPA}
              value={ppaFactor}
              onChange={(e) => setPpaFactor(Number(e.target.value))}
              className={`w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-right focus:outline-none focus:border-emerald-500 ${
                usePPA ? 'text-white' : 'text-slate-600'
              }`}
            />
            <div className="text-[11px] text-slate-400">
              Enerjisa Geothermal PPA with Guarantees of Origin (GoO)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
