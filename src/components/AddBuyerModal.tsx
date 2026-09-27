import React, { useState } from 'react';
import { useCbam } from '../context/CbamContext';
import { BuyerFormat } from '../types/cbam';
import { X, Building2, User, Mail, Globe, Hash, Package } from 'lucide-react';

export const AddBuyerModal: React.FC = () => {
  const { isAddBuyerOpen, setIsAddBuyerOpen, addBuyer, products } = useCbam();

  const [companyName, setCompanyName] = useState('');
  const [buyerCountry, setBuyerCountry] = useState('Germany (DE)');
  const [eoriNumber, setEoriNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('Carbon Compliance & Procurement');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [preferredFormat, setPreferredFormat] = useState<BuyerFormat>('eu_cbam_xml');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([products[0]?.id || 'prod-01']);
  const [quarterlyShippedTons, setQuarterlyShippedTons] = useState(15000);
  const [customMappingNotes, setCustomMappingNotes] = useState('');

  if (!isAddBuyerOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !eoriNumber) return;

    // Calculate approximate embedded emissions based on selected products
    const selectedProds = products.filter((p) => selectedProductIds.includes(p.id));
    const avgEmission =
      selectedProds.length > 0
        ? selectedProds.reduce((acc, p) => acc + p.totalEmissions_tCO2e_per_t, 0) / selectedProds.length
        : 0.65;
    const embeddedEmissionsTotal_tCO2e = Number((quarterlyShippedTons * avgEmission).toFixed(1));

    addBuyer({
      companyName,
      buyerCountry,
      eoriNumber: eoriNumber.toUpperCase().trim(),
      primaryContact: {
        name: contactName || 'EU Procurement Lead',
        role: contactRole,
        email: contactEmail || 'procurement@buyer.eu',
        phone: contactPhone || '+49 000 000000',
      },
      preferredFormat,
      allocatedProductIds: selectedProductIds,
      quarterlyShippedTons,
      embeddedEmissionsTotal_tCO2e,
      status: 'ready',
      lastDispatchDate: null,
      customMappingNotes: customMappingNotes || 'Direct exporter declaration via CBAM Exporter Tracker.',
    });

    setIsAddBuyerOpen(false);
  };

  const toggleProduct = (prodId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(prodId) ? prev.filter((id) => id !== prodId) : [...prev, prodId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40">
          <div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Buyer Relationship Manager
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Connect EU Importer / Customer
            </h2>
          </div>
          <button
            onClick={() => setIsAddBuyerOpen(false)}
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
                EU Importer Company Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Salzgitter Flachstahl GmbH"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                EU Member State Country *
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <select
                  value={buyerCountry}
                  onChange={(e) => setBuyerCountry(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Germany (DE)">Germany (DE)</option>
                  <option value="France (FR)">France (FR)</option>
                  <option value="Italy (IT)">Italy (IT)</option>
                  <option value="Spain (ES)">Spain (ES)</option>
                  <option value="Netherlands (NL)">Netherlands (NL)</option>
                  <option value="Belgium (BE)">Belgium (BE)</option>
                  <option value="Luxembourg (LU)">Luxembourg (LU)</option>
                  <option value="Poland (PL)">Poland (PL)</option>
                  <option value="Sweden (SE)">Sweden (SE)</option>
                  <option value="Finland (FI)">Finland (FI)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Importer EORI Number *
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. DE1098492019"
                  value={eoriNumber}
                  onChange={(e) => setEoriNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Preferred Export Format
              </label>
              <select
                value={preferredFormat}
                onChange={(e) => setPreferredFormat(e.target.value as BuyerFormat)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="eu_cbam_xml">Official EU Registry XML (v2.3)</option>
                <option value="eu_official_excel">European Commission Excel (Annex IV)</option>
                <option value="buyer_custom_csv">Buyer Normalized CSV / Portal</option>
                <option value="direct_api">Direct REST API Push</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Primary Contact Person
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Dr. Thomas Becker"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Contact Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  placeholder="t.becker@importer.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Allocated Export Consignment (Quarterly Metric Tons)
            </label>
            <input
              type="number"
              min={1}
              value={quarterlyShippedTons}
              onChange={(e) => setQuarterlyShippedTons(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Assigned Products from Installation Catalog
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-950/60 border border-slate-800 rounded-lg">
              {products.map((p) => {
                const isChecked = selectedProductIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors text-xs ${
                      isChecked ? 'bg-emerald-500/10 text-emerald-300' : 'text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleProduct(p.id)}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>{p.name}</span>
                    </div>
                    <span className="font-mono text-slate-400">{p.cnCode}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Custom Mapping & Portal Instructions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Buyer requires specific sub-installation boundary identifiers..."
              value={customMappingNotes}
              onChange={(e) => setCustomMappingNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddBuyerOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
            >
              Save & Connect Buyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
