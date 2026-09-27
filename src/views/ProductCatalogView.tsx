import React, { useState } from 'react';
import { useCbam } from '../context/CbamContext';
import { ProductItem, SectorType } from '../types/cbam';
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
  Flame,
  ArrowRight,
} from 'lucide-react';

export const ProductCatalogView: React.FC = () => {
  const { products, setIsAddProductOpen, activeInstallation } = useCbam();

  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(products[0]?.id || null);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.cnCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.productionRoute.toLowerCase().includes(searchQuery.toLowerCase());

    if (sectorFilter === 'all') return matchesSearch;
    return matchesSearch && p.sector === sectorFilter;
  });

  const toggleExpand = (id: string) => {
    setExpandedProduct((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs text-slate-400">
            Installation Technical Catalog · {activeInstallation.name}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Product & Production Route Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Combined Nomenclature (CN) classified goods with explicit system boundaries, precursor mass balances, and specific embedded emissions (SEE) per metric ton.
          </p>
        </div>

        <button
          onClick={() => setIsAddProductOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add CBAM Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by product name, CN code, or technology..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Sector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800/80 overflow-x-auto">
          {[
            { id: 'all', label: 'All Sectors' },
            { id: 'iron_steel', label: 'Iron & Steel' },
            { id: 'aluminium', label: 'Aluminium' },
            { id: 'fertilizers', label: 'Fertilizers' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSectorFilter(tab.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                sectorFilter === tab.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-800">
          {filteredProducts.map((product) => {
            const isExpanded = expandedProduct === product.id;
            const savingsVsDefault = Number(
              (product.euDefaultBenchmark_tCO2e_per_t - product.totalEmissions_tCO2e_per_t).toFixed(3)
            );

            return (
              <div key={product.id} className="transition-colors">
                {/* Main Row */}
                <div
                  onClick={() => toggleExpand(product.id)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/30"
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      className="mt-1 text-slate-400 hover:text-white transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                          {product.cnCode}
                        </span>
                        <h3 className="text-sm font-bold text-white">{product.name}</h3>
                        <span className="text-xs text-slate-400 font-medium">
                          {product.isSimpleGood ? '· Simple Good' : '· Complex Good'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                        <span>Route: {product.productionRoute}</span>
                        <span>·</span>
                        <span>Quarterly Run: {product.quarterlyProductionTons.toLocaleString()} t</span>
                        <span>·</span>
                        <span className="capitalize">{product.measurementMethod.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Specific Embedded Emissions metric cluster */}
                  <div className="flex items-center gap-6 justify-between md:justify-end">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                        Total Specific SEE
                      </div>
                      <div className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                        {product.totalEmissions_tCO2e_per_t}{' '}
                        <span className="text-xs font-normal text-slate-400">tCO₂e/t</span>
                      </div>
                    </div>

                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                        EU Default
                      </div>
                      <div className="text-xs font-mono text-slate-400 tabular-nums">
                        {product.euDefaultBenchmark_tCO2e_per_t} tCO₂e/t
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400">
                        -{savingsVsDefault} tCO₂e saved
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Pane: Detailed Annex IV System Boundary & Precursors */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 bg-slate-950/60 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-150">
                    {/* 3-tier SEE Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Flame className="w-3.5 h-3.5 text-amber-400" />
                          <span>Direct Emissions (Scope 1)</span>
                        </div>
                        <div className="text-base font-mono font-bold text-white tabular-nums mt-1">
                          {product.directEmissions_tCO2e_per_t}{' '}
                          <span className="text-xs font-normal text-slate-400">tCO₂e/t</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Natural gas firing + electrode oxidation
                        </div>
                      </div>

                      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Zap className="w-3.5 h-3.5 text-yellow-400" />
                          <span>Indirect Emissions (Scope 2)</span>
                        </div>
                        <div className="text-base font-mono font-bold text-white tabular-nums mt-1">
                          {product.indirectEmissions_tCO2e_per_t}{' '}
                          <span className="text-xs font-normal text-slate-400">tCO₂e/t</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          60% Geothermal PPA + 40% Turkish Grid
                        </div>
                      </div>

                      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Layers className="w-3.5 h-3.5 text-blue-400" />
                          <span>Precursor Raw Materials</span>
                        </div>
                        <div className="text-base font-mono font-bold text-white tabular-nums mt-1">
                          {product.precursorEmissions_tCO2e_per_t}{' '}
                          <span className="text-xs font-normal text-slate-400">tCO₂e/t</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {product.precursors.length} tracked input materials
                        </div>
                      </div>
                    </div>

                    {/* Precursor Mass Balance Table */}
                    {product.precursors.length > 0 ? (
                      <div>
                        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span>Embedded Precursor Chain (Annex IV Sheet D_Processes)</span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            All precursor supplier certificates independently verified
                          </span>
                        </div>

                        <div className="border border-slate-800 rounded-lg overflow-hidden">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                              <tr>
                                <th className="py-2 px-3">Precursor Material</th>
                                <th className="py-2 px-3">CN Code</th>
                                <th className="py-2 px-3">Supplier & Origin</th>
                                <th className="py-2 px-3">Mass Ratio (t/t good)</th>
                                <th className="py-2 px-3">Verified Factor</th>
                                <th className="py-2 px-3 text-right">Audit Ref</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                              {product.precursors.map((prec) => (
                                <tr key={prec.id} className="hover:bg-slate-900/40">
                                  <td className="py-2.5 px-3 font-medium text-slate-200">
                                    {prec.name}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-emerald-400">
                                    {prec.cnCode}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-400">
                                    {prec.supplierName} ({prec.countryOfOrigin})
                                  </td>
                                  <td className="py-2.5 px-3 font-mono tabular-nums text-slate-200">
                                    {prec.consumptionPerTon}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono tabular-nums text-slate-200">
                                    {prec.directEmissionFactor} tCO₂e/t
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono text-[11px] text-slate-400">
                                    {prec.verifierCertificateRef || 'Verified'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-900/30 rounded border border-slate-800 text-xs text-slate-400">
                        Classified as a Simple Good under Article 3(19) of EU Regulation 2023/956; only direct emissions from manufacturing installation are attributable.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
