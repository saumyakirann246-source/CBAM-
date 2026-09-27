import React, { useState } from 'react';
import { useCbam } from '../context/CbamContext';
import { BuyerFormat } from '../types/cbam';
import {
  X,
  Send,
  FileCode,
  FileSpreadsheet,
  FileText,
  Webhook,
  ShieldCheck,
  CheckCircle,
  Copy,
  Download,
} from 'lucide-react';

export const DispatchModal: React.FC = () => {
  const {
    dispatchModalBuyer,
    setDispatchModalBuyer,
    dispatchToBuyer,
    products,
    vaultDocuments,
    activeInstallation,
    selectedQuarter,
    triggerToast,
  } = useCbam();

  const [selectedFormat, setSelectedFormat] = useState<BuyerFormat>(
    dispatchModalBuyer?.preferredFormat || 'eu_cbam_xml'
  );
  const [includeVerifierCert, setIncludeVerifierCert] = useState(true);
  const [includeSubInstallationDetail, setIncludeSubInstallationDetail] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  if (!dispatchModalBuyer) return null;

  const allocatedProds = products.filter((p) =>
    dispatchModalBuyer.allocatedProductIds.includes(p.id)
  );

  const verifierDoc = vaultDocuments.find((d) => d.docType === 'verification_statement') || vaultDocuments[0];

  const handleDispatch = () => {
    dispatchToBuyer(dispatchModalBuyer.id, selectedFormat);
    setDispatchModalBuyer(null);
  };

  const xmlSample = `<?xml version="1.0" encoding="UTF-8"?>
<cbam:DeclarationPackage xmlns:cbam="urn:eu:cbam:v2.3" version="2.3.1">
  <cbam:Header>
    <cbam:ReportingPeriod>${selectedQuarter}</cbam:ReportingPeriod>
    <cbam:Timestamp>${new Date().toISOString()}</cbam:Timestamp>
    <cbam:ExporterUNLOCODE>${activeInstallation.unLocode}</cbam:ExporterUNLOCODE>
    <cbam:InstallationName>${activeInstallation.name}</cbam:InstallationName>
    <cbam:CountryCode>${activeInstallation.country.substring(0, 2)}</cbam:CountryCode>
    <cbam:BuyerEORINumber>${dispatchModalBuyer.eoriNumber}</cbam:BuyerEORINumber>
    <cbam:BuyerName>${dispatchModalBuyer.companyName}</cbam:BuyerName>
  </cbam:Header>
  <cbam:GoodsList>
${allocatedProds
  .map(
    (p) => `    <cbam:Good>
      <cbam:CNCode>${p.cnCode.replace(/\s+/g, '')}</cbam:CNCode>
      <cbam:CommercialName>${p.name}</cbam:CommercialName>
      <cbam:ProductionRoute>${p.productionRoute}</cbam:ProductionRoute>
      <cbam:DirectSEE unit="tCO2e/t">${p.directEmissions_tCO2e_per_t}</cbam:DirectSEE>
      <cbam:IndirectSEE unit="tCO2e/t">${p.indirectEmissions_tCO2e_per_t}</cbam:IndirectSEE>
      <cbam:PrecursorSEE unit="tCO2e/t">${p.precursorEmissions_tCO2e_per_t}</cbam:PrecursorSEE>
      <cbam:TotalSpecificEmbedded unit="tCO2e/t">${p.totalEmissions_tCO2e_per_t}</cbam:TotalSpecificEmbedded>
    </cbam:Good>`
  )
  .join('\n')}
  </cbam:GoodsList>
  <cbam:VerificationDetails>
    <cbam:AccreditedVerifier>${verifierDoc?.verifierName}</cbam:AccreditedVerifier>
    <cbam:AccreditationRef>${verifierDoc?.accreditationNumber}</cbam:AccreditationRef>
    <cbam:DigitalSignatureHash>${verifierDoc?.sha256Hash}</cbam:DigitalSignatureHash>
    <cbam:OpinionStatus>${verifierDoc?.status === 'verified_clean' ? 'UNQUALIFIED_POSITIVE' : 'QUALIFIED'}</cbam:OpinionStatus>
  </cbam:VerificationDetails>
</cbam:DeclarationPackage>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(xmlSample);
    setIsCopied(true);
    triggerToast('XML declaration payload copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadPayload = () => {
    const blob = new Blob([xmlSample], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CBAM_Declaration_${dispatchModalBuyer.eoriNumber}_${selectedQuarter}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('CBAM XML file saved locally.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40">
          <div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Exporter Dispatch Terminal
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Dispatch CBAM Data Package to {dispatchModalBuyer.companyName}
            </h2>
          </div>
          <button
            onClick={() => setDispatchModalBuyer(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Buyer & Consignment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-950/60 border border-slate-800/80 rounded-lg">
            <div>
              <div className="text-xs text-slate-400">Buyer EORI & Country</div>
              <div className="text-xs font-mono font-medium text-slate-200 mt-1">
                {dispatchModalBuyer.eoriNumber}
              </div>
              <div className="text-xs text-slate-400">{dispatchModalBuyer.buyerCountry}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Shipped Consignment</div>
              <div className="text-sm font-semibold text-slate-100 font-mono tabular-nums mt-1">
                {dispatchModalBuyer.quarterlyShippedTons.toLocaleString()} t
              </div>
              <div className="text-xs text-slate-400">Reporting {selectedQuarter}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Total Embedded Emissions</div>
              <div className="text-sm font-semibold text-emerald-400 font-mono tabular-nums mt-1">
                {dispatchModalBuyer.embeddedEmissionsTotal_tCO2e.toLocaleString()} tCO₂e
              </div>
              <div className="text-xs text-slate-400">
                Avg: {(dispatchModalBuyer.embeddedEmissionsTotal_tCO2e / dispatchModalBuyer.quarterlyShippedTons).toFixed(3)} tCO₂e/t
              </div>
            </div>
          </div>

          {/* Format Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Output Format (Buyer Platform Target)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {[
                {
                  id: 'eu_cbam_xml' as BuyerFormat,
                  label: 'EU Registry XML',
                  sub: 'v2.3 Schema',
                  icon: FileCode,
                },
                {
                  id: 'eu_official_excel' as BuyerFormat,
                  label: 'Commission Excel',
                  sub: 'Annex IV Template',
                  icon: FileSpreadsheet,
                },
                {
                  id: 'buyer_custom_csv' as BuyerFormat,
                  label: 'Buyer CSV / Portal',
                  sub: 'Normalized format',
                  icon: FileText,
                },
                {
                  id: 'direct_api' as BuyerFormat,
                  label: 'REST API Push',
                  sub: 'Direct Webhook',
                  icon: Webhook,
                },
              ].map((fmt) => {
                const Icon = fmt.icon;
                const isSel = selectedFormat === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setSelectedFormat(fmt.id)}
                    className={`flex flex-col items-start p-3 text-left rounded-lg border transition-all ${
                      isSel
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-2 ${isSel ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <div className="text-xs font-semibold">{fmt.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{fmt.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Included Products */}
          <div>
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Goods Covered in this Package ({allocatedProds.length})
            </div>
            <div className="border border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-800 text-xs">
              {allocatedProds.map((prod) => (
                <div key={prod.id} className="p-3 bg-slate-950/30 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-emerald-400 font-medium mr-2">{prod.cnCode}</span>
                    <span className="text-slate-200 font-medium">{prod.name}</span>
                    <div className="text-[11px] text-slate-400 mt-0.5">{prod.productionRoute}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-semibold text-slate-200">
                      {prod.totalEmissions_tCO2e_per_t}
                    </span>
                    <span className="text-slate-400 ml-1">tCO₂e/t</span>
                    <div className="text-[10px] text-emerald-400 font-mono">
                      Dir: {prod.directEmissions_tCO2e_per_t} · Ind: {prod.indirectEmissions_tCO2e_per_t}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Statement Attachment */}
          <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-lg flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <div className="font-semibold text-slate-200 flex items-center justify-between">
                <span>Accredited Verifier Statement Attached</span>
                <span className="text-[11px] font-mono text-emerald-400">UNQUALIFIED POSITIVE</span>
              </div>
              <p className="text-slate-400 mt-1 leading-relaxed">
                {verifierDoc?.verifierName} ({verifierDoc?.accreditationBody}). Cryptographic hash:
                <span className="font-mono text-slate-300 block truncate mt-0.5">
                  {verifierDoc?.sha256Hash}
                </span>
              </p>
            </div>
          </div>

          {/* Payload Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Transmission Payload Preview
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  {isCopied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={downloadPayload}
                  className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
              </div>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-40 leading-snug">
              {xmlSample}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Records timestamped in immutable export registry.
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDispatchModalBuyer(null)}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDispatch}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Dispatch Package
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
