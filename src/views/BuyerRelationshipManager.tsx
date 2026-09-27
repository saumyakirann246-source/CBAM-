import React, { useState } from 'react';
import { useCbam } from '../context/CbamContext';
import { BuyerRelationship, BuyerFormat, DispatchStatus } from '../types/cbam';
import {
  Users,
  Plus,
  Send,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCode,
  FileSpreadsheet,
  FileText,
  Webhook,
  Mail,
  Phone,
  Building2,
  Globe,
  Hash,
  Download,
} from 'lucide-react';

export const BuyerRelationshipManager: React.FC = () => {
  const {
    buyers,
    products,
    setDispatchModalBuyer,
    setIsAddBuyerOpen,
    updateBuyerStatus,
    selectedQuarter,
    triggerToast,
  } = useCbam();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBuyerDetail, setSelectedBuyerDetail] = useState<BuyerRelationship | null>(null);

  const filteredBuyers = buyers.filter((b) => {
    const matchesSearch =
      b.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.eoriNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.buyerCountry.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && b.status === statusFilter;
  });

  const getFormatLabel = (fmt: BuyerFormat) => {
    switch (fmt) {
      case 'eu_cbam_xml':
        return { label: 'EU Registry XML v2.3', icon: FileCode };
      case 'eu_official_excel':
        return { label: 'Commission Annex IV Excel', icon: FileSpreadsheet };
      case 'buyer_custom_csv':
        return { label: 'Normalized Buyer CSV', icon: FileText };
      case 'direct_api':
        return { label: 'Direct REST API Push', icon: Webhook };
    }
  };

  const downloadDirectXml = (buyer: BuyerRelationship) => {
    const allocated = products.filter((p) => buyer.allocatedProductIds.includes(p.id));
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<cbam:BuyerPackage xmlns:cbam="urn:eu:cbam:v2.3">
  <cbam:BuyerEORI>${buyer.eoriNumber}</cbam:BuyerEORI>
  <cbam:BuyerName>${buyer.companyName}</cbam:BuyerName>
  <cbam:Quarter>${selectedQuarter}</cbam:Quarter>
  <cbam:ShippedTons>${buyer.quarterlyShippedTons}</cbam:ShippedTons>
  <cbam:EmbeddedTotal_tCO2e>${buyer.embeddedEmissionsTotal_tCO2e}</cbam:EmbeddedTotal_tCO2e>
  <cbam:Products>
    ${allocated.map((p) => `<cbam:Product CN="${p.cnCode}" SEE="${p.totalEmissions_tCO2e_per_t}" />`).join('\n    ')}
  </cbam:Products>
</cbam:BuyerPackage>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CBAM_Data_${buyer.eoriNumber}_${selectedQuarter}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast(`Direct XML generated for ${buyer.companyName}`);
  };

  return (
    <div className="space-y-6">
      {/* Header and Strategic Statement */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs text-slate-400">
            System of Record Architecture · Exporter-First Paradigm
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Buyer Relationship & Dispatch Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Eliminate duplicate entry into 6+ distinct EU importer portals. Your installation’s single golden emissions dataset is mapped and dispatched to each buyer in their required format.
          </p>
        </div>

        <button
          onClick={() => setIsAddBuyerOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Connect New EU Importer
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by buyer name, EORI number, or EU country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Status Filter Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800/80 overflow-x-auto">
          {[
            { id: 'all', label: 'All Buyers' },
            { id: 'ready', label: 'Ready' },
            { id: 'dispatched', label: 'Dispatched' },
            { id: 'buyer_accepted', label: 'Accepted' },
            { id: 'revision_requested', label: 'Needs Revision' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Buyer Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBuyers.map((buyer) => {
          const formatInfo = getFormatLabel(buyer.preferredFormat);
          const FormatIcon = formatInfo.icon;
          const allocatedProds = products.filter((p) =>
            buyer.allocatedProductIds.includes(p.id)
          );

          let statusBadgeColor = 'text-slate-400';
          let statusText = 'Pending';
          if (buyer.status === 'buyer_accepted') {
            statusBadgeColor = 'text-emerald-400';
            statusText = 'Accepted by Importer';
          } else if (buyer.status === 'dispatched') {
            statusBadgeColor = 'text-blue-400';
            statusText = 'Dispatched · In Review';
          } else if (buyer.status === 'revision_requested') {
            statusBadgeColor = 'text-amber-400';
            statusText = 'Revision Requested';
          } else if (buyer.status === 'ready') {
            statusBadgeColor = 'text-slate-200';
            statusText = 'Ready to Dispatch';
          }

          return (
            <div
              key={buyer.id}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">
                      {buyer.companyName}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {buyer.eoriNumber} · {buyer.buyerCountry}
                    </div>
                  </div>
                  <span className={`text-[11px] font-medium shrink-0 ${statusBadgeColor}`}>
                    {statusText}
                  </span>
                </div>

                {/* Shipped & Carbon stats */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Shipped ({selectedQuarter})
                    </div>
                    <div className="text-sm font-bold font-mono text-white tabular-nums mt-0.5">
                      {buyer.quarterlyShippedTons.toLocaleString()} t
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Total Embedded CO₂
                    </div>
                    <div className="text-sm font-bold font-mono text-emerald-400 tabular-nums mt-0.5">
                      {buyer.embeddedEmissionsTotal_tCO2e.toLocaleString()} t
                    </div>
                  </div>
                </div>

                {/* Format requirement */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Target Schema:</span>
                  <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                    <FormatIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{formatInfo.label}</span>
                  </div>
                </div>

                {/* Products allocated */}
                <div className="mt-3">
                  <div className="text-[11px] text-slate-400 mb-1">
                    Products ({allocatedProds.length}):
                  </div>
                  <div className="space-y-1">
                    {allocatedProds.map((p) => (
                      <div
                        key={p.id}
                        className="text-[11px] text-slate-300 flex items-center justify-between py-0.5"
                      >
                        <span className="truncate max-w-[170px]">{p.name}</span>
                        <span className="font-mono text-emerald-400">
                          {p.totalEmissions_tCO2e_per_t} tCO₂e/t
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom buyer notes */}
                {buyer.customMappingNotes && (
                  <div className="mt-3 p-2 bg-slate-950/40 rounded border border-slate-800 text-[11px] text-slate-400 italic">
                    "{buyer.customMappingNotes}"
                  </div>
                )}

                {/* Primary Contact */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div className="font-medium text-slate-300">{buyer.primaryContact.name}</div>
                  <div className="flex items-center gap-1 truncate text-slate-400">
                    <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{buyer.primaryContact.email}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => setDispatchModalBuyer(buyer)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Package
                </button>

                <button
                  onClick={() => downloadDirectXml(buyer)}
                  title="Direct XML Download"
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                {buyer.portalLink && (
                  <a
                    href={buyer.portalLink}
                    target="_blank"
                    rel="noreferrer"
                    title="External Portal Link"
                    className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredBuyers.length === 0 && (
        <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl space-y-3">
          <Users className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No matching buyers found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or connect a new European importer.
          </p>
          <button
            onClick={() => setIsAddBuyerOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Connect First Buyer
          </button>
        </div>
      )}
    </div>
  );
};
