import React, { useState } from 'react';
import { useCbam } from '../context/CbamContext';
import { SectorType } from '../types/cbam';
import { X, Layers, Hash, Fuel, Zap, GitCommit } from 'lucide-react';

export const AddProductModal: React.FC = () => {
  const { isAddProductOpen, setIsAddProductOpen, addProduct, activeInstallation } = useCbam();

  const [name, setName] = useState('');
  const [cnCode, setCnCode] = useState('');
  const [sector, setSector] = useState<SectorType>('iron_steel');
  const [productionRoute, setProductionRoute] = useState('Electric Arc Furnace (EAF) + Secondary Refining');
  const [isSimpleGood, setIsSimpleGood] = useState(false);
  const [directEmissions, setDirectEmissions] = useState(0.35);
  const [indirectEmissions, setIndirectEmissions] = useState(0.18);
  const [precursorEmissions, setPrecursorEmissions] = useState(0.08);
  const [euDefaultBenchmark, setEuDefaultBenchmark] = useState(1.85);
  const [quarterlyProductionTons, setQuarterlyProductionTons] = useState(50000);
  const [measurementMethod, setMeasurementMethod] = useState<'calculation_based' | 'measurement_based_cems'>('calculation_based');

  if (!isAddProductOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cnCode) return;

    addProduct({
      name,
      cnCode: cnCode.trim(),
      sector,
      productionRoute,
      isSimpleGood,
      directEmissions_tCO2e_per_t: Number(directEmissions),
      indirectEmissions_tCO2e_per_t: Number(indirectEmissions),
      precursorEmissions_tCO2e_per_t: Number(precursorEmissions),
      totalEmissions_tCO2e_per_t: Number((Number(directEmissions) + Number(indirectEmissions) + Number(precursorEmissions)).toFixed(3)),
      euDefaultBenchmark_tCO2e_per_t: Number(euDefaultBenchmark),
      quarterlyProductionTons: Number(quarterlyProductionTons),
      installationFacilityId: activeInstallation.id,
      measurementMethod,
      precursors: [],
    });

    setIsAddProductOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40">
          <div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Product & Production Catalog
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Define New CBAM Good & Production Route
            </h2>
          </div>
          <button
            onClick={() => setIsAddProductOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Product Commercial Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Wire Rod in Coils (Grade SAE 1008)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                EU Combined Nomenclature (CN Code) *
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 7213 91 10"
                  value={cnCode}
                  onChange={(e) => setCnCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                CBAM Industrial Sector
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value as SectorType)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="iron_steel">Iron & Steel</option>
                <option value="aluminium">Aluminium</option>
                <option value="fertilizers">Fertilizers</option>
                <option value="cement">Cement</option>
                <option value="chemicals">Chemicals</option>
                <option value="hydrogen">Hydrogen</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Good Classification
              </label>
              <div className="flex items-center gap-3 h-[38px]">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="goodClass"
                    checked={!isSimpleGood}
                    onChange={() => setIsSimpleGood(false)}
                    className="text-emerald-500"
                  />
                  <span>Complex Good (requires precursors)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="goodClass"
                    checked={isSimpleGood}
                    onChange={() => setIsSimpleGood(true)}
                    className="text-emerald-500"
                  />
                  <span>Simple Good</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Production Route & Technology
            </label>
            <input
              type="text"
              placeholder="e.g. Electric Arc Furnace with scrap recycling + continuous casting"
              value={productionRoute}
              onChange={(e) => setProductionRoute(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Specific Emissions breakdown */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-3">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Specific Embedded Emissions (tCO₂e per Metric Ton of Good)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Direct (Scope 1)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={directEmissions}
                  onChange={(e) => setDirectEmissions(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Indirect (Scope 2)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={indirectEmissions}
                  onChange={(e) => setIndirectEmissions(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Precursors
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={precursorEmissions}
                  onChange={(e) => setPrecursorEmissions(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">Total Calculated SEE: </span>
                <span className="font-mono font-bold text-emerald-400">
                  {(Number(directEmissions) + Number(indirectEmissions) + Number(precursorEmissions)).toFixed(3)} tCO₂e/t
                </span>
              </div>
              <div>
                <label className="inline text-slate-400 mr-2">EU Default Benchmark:</label>
                <input
                  type="number"
                  step="0.01"
                  value={euDefaultBenchmark}
                  onChange={(e) => setEuDefaultBenchmark(Number(e.target.value))}
                  className="w-20 px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Quarterly Installation Production (Tons)
              </label>
              <input
                type="number"
                value={quarterlyProductionTons}
                onChange={(e) => setQuarterlyProductionTons(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                GHG Measurement Methodology
              </label>
              <select
                value={measurementMethod}
                onChange={(e) => setMeasurementMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="calculation_based">Calculation-based (Activity data × EF × NCV)</option>
                <option value="measurement_based_cems">Measurement-based (Continuous CEMS Stack)</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddProductOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
            >
              Save Product to Catalog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
