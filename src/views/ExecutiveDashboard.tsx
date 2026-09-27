import React from 'react';
import { useCbam } from '../context/CbamContext';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ShieldCheck,
  Send,
  AlertCircle,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const ExecutiveDashboard: React.FC = () => {
  const {
    buyers,
    products,
    totalShippedTons,
    totalEmbeddedEmissions_tCO2e,
    averageSpecificEmissions,
    totalSavingsVsEuDefaultEur,
    complianceReadinessPercent,
    selectedQuarter,
    setDispatchModalBuyer,
    setIsAddBuyerOpen,
    setCurrentView,
    activeInstallation,
  } = useCbam();

  const readyBuyers = buyers.filter((b) => b.status === 'ready' || b.status === 'revision_requested');
  const acceptedBuyers = buyers.filter((b) => b.status === 'buyer_accepted');

  return (
    <div className="space-y-6">
      {/* Top Banner & Context */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs text-slate-400">
            Installation System of Record · {activeInstallation.name} ({activeInstallation.unLocode})
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Executive CBAM Cross-Buyer Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Centralized registry monitoring {buyers.length} EU buyers across {acceptedBuyers.length + readyBuyers.length} active consignments for {selectedQuarter}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('reports')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
            Official Annex IV Generator
          </button>
          <button
            onClick={() => setIsAddBuyerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Connect EU Buyer
          </button>
        </div>
      </div>

      {/* Cross-Buyer Core Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Total Exported Volume</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {totalShippedTons.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium">metric tons</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-mono font-medium">+12.4%</span>
            <span>vs previous quarter</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Total Embedded Carbon</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {totalEmbeddedEmissions_tCO2e.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium">tCO₂e</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <span className="font-mono text-slate-300">Avg {averageSpecificEmissions} tCO₂e/t</span>
            <span>(actual verified)</span>
          </div>
        </div>

        {/* Metric 3: The Competitive Advantage */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Buyer CBAM Penalty Avoided</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-300 tabular-nums">
              €{(totalSavingsVsEuDefaultEur / 1000000).toFixed(2)}M
            </span>
            <span className="text-xs text-slate-400 font-medium">saved</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            vs EU Default values at €68.50/t
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Declaration Dispatch Rate</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {complianceReadinessPercent}%
            </span>
            <span className="text-xs text-slate-400 font-medium">ready / signed</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {buyers.filter((b) => b.status === 'buyer_accepted').length} accepted · {readyBuyers.length} awaiting dispatch
          </div>
        </div>
      </div>

      {/* Exporter Value Proposition Banner */}
      <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
              Single System of Record Advantage
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Your installation data is calculated once and automatically mapped into 6 distinct formats (Official EU XML, Commission Excel, Klöckner Nexigen, etc.) preventing 140+ hours of redundant portal entries across European buyers.
            </p>
          </div>
        </div>
        <button
          onClick={() => setCurrentView('buyers')}
          className="shrink-0 text-xs font-medium text-emerald-300 hover:text-emerald-200 underline underline-offset-4 flex items-center gap-1"
        >
          Manage All Buyer Mappings
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid: Cross-Buyer Table + Product Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Buyer Dispatch Status */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Connected EU Buyers & Consignments</h2>
              <div className="text-xs text-slate-400 mt-0.5">
                Current {selectedQuarter} declaration status across all commercial partners
              </div>
            </div>
            <button
              onClick={() => setCurrentView('buyers')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              View directory
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Buyer / EORI</th>
                  <th className="py-2.5 px-4 font-medium">Shipped Volume</th>
                  <th className="py-2.5 px-4 font-medium">Embedded Carbon</th>
                  <th className="py-2.5 px-4 font-medium">Preferred Target</th>
                  <th className="py-2.5 px-4 font-medium">Compliance State</th>
                  <th className="py-2.5 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {buyers.map((buyer) => {
                  let statusColor = 'text-slate-400';
                  let statusText = 'Pending';
                  if (buyer.status === 'buyer_accepted') {
                    statusColor = 'text-emerald-400';
                    statusText = 'Accepted by Buyer';
                  } else if (buyer.status === 'dispatched') {
                    statusColor = 'text-blue-400';
                    statusText = 'Dispatched (Awaiting Ack)';
                  } else if (buyer.status === 'revision_requested') {
                    statusColor = 'text-amber-400';
                    statusText = 'Revision Requested';
                  } else if (buyer.status === 'ready') {
                    statusColor = 'text-slate-300';
                    statusText = 'Ready to Dispatch';
                  }

                  return (
                    <tr key={buyer.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{buyer.companyName}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {buyer.eoriNumber} · {buyer.buyerCountry}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-200 tabular-nums">
                        {buyer.quarterlyShippedTons.toLocaleString()} t
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono font-medium text-slate-200 tabular-nums">
                          {buyer.embeddedEmissionsTotal_tCO2e.toLocaleString()} tCO₂e
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {(buyer.embeddedEmissionsTotal_tCO2e / buyer.quarterlyShippedTons).toFixed(3)} tCO₂e/t
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                        {buyer.preferredFormat === 'eu_cbam_xml' && 'EU XML v2.3'}
                        {buyer.preferredFormat === 'eu_official_excel' && 'Commission Excel'}
                        {buyer.preferredFormat === 'buyer_custom_csv' && 'Custom CSV'}
                        {buyer.preferredFormat === 'direct_api' && 'REST API'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${statusColor}`}>
                          {statusText}
                        </span>
                        {buyer.acknowledgmentRef && (
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                            {buyer.acknowledgmentRef}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setDispatchModalBuyer(buyer)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors whitespace-nowrap"
                        >
                          Dispatch
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Product Emissions Split & Benchmark Comparison */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white">Product Emissions vs EU Defaults</h2>
              <button
                onClick={() => setCurrentView('catalog')}
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                Catalog
              </button>
            </div>

            <div className="space-y-4 mt-4">
              {products.slice(0, 4).map((prod) => {
                const savingPercentage = Math.round(
                  ((prod.euDefaultBenchmark_tCO2e_per_t - prod.totalEmissions_tCO2e_per_t) /
                    prod.euDefaultBenchmark_tCO2e_per_t) *
                    100
                );
                return (
                  <div key={prod.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200 truncate max-w-[180px]">
                        {prod.name}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-medium">
                        {savingPercentage}% lower than EU default
                      </span>
                    </div>

                    {/* Comparative bars */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>Actual: {prod.totalEmissions_tCO2e_per_t} tCO₂e/t</span>
                        <span>EU Default: {prod.euDefaultBenchmark_tCO2e_per_t} tCO₂e/t</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden flex">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (prod.totalEmissions_tCO2e_per_t / prod.euDefaultBenchmark_tCO2e_per_t) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4">
            <div className="p-3 bg-slate-950/60 rounded-lg text-xs text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">Third-Party Verification Notice</div>
              <p className="leading-relaxed text-[11px]">
                Audited by TÜV SÜD Umweltpartner GmbH. Validated under ISO 14064-3 reasonable assurance standard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
