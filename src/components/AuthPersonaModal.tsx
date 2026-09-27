import React, { useState } from 'react';
import { useCbam } from '../context/CbamContext';
import { mockPersonas, mockInstallations } from '../data/mockCbamData';
import { X, UserCheck, ShieldCheck, Factory, LogIn, CheckCircle2, Lock } from 'lucide-react';

export const AuthPersonaModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    activePersona,
    setActivePersona,
    activeInstallation,
    setActiveInstallation,
    triggerToast,
  } = useCbam();

  const [email, setEmail] = useState(activePersona.email);
  const [password, setPassword] = useState('••••••••••••');
  const [authMode, setAuthMode] = useState<'persona' | 'credentials'>('persona');

  if (!isAuthModalOpen) return null;

  const handleSelectPersona = (persona: typeof mockPersonas[0]) => {
    setActivePersona(persona);
    triggerToast(`Active session switched to ${persona.name} (${persona.role})`);
    setIsAuthModalOpen(false);
  };

  const handleSelectInstallation = (inst: typeof mockInstallations[0]) => {
    setActiveInstallation(inst);
    triggerToast(`Active facility switched to ${inst.name} (${inst.unLocode})`);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast(`Authenticated successfully as ${activePersona.name}!`);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40">
          <div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Access & Identity Management
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Exporter Authentication & Persona Switcher
            </h2>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/20 px-6 pt-3 gap-6 text-xs font-medium">
          <button
            onClick={() => setAuthMode('persona')}
            className={`pb-2.5 transition-colors ${
              authMode === 'persona'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Demo Persona Switcher (4 Roles)
          </button>
          <button
            onClick={() => setAuthMode('credentials')}
            className={`pb-2.5 transition-colors ${
              authMode === 'credentials'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Enterprise SSO & Credentials
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {authMode === 'persona' ? (
            <>
              <div>
                <div className="text-xs text-slate-400 mb-3">
                  Select a persona below to experience the platform from different industrial perspectives:
                </div>

                <div className="space-y-2.5">
                  {mockPersonas.map((persona) => {
                    const isSelected = activePersona.id === persona.id;
                    return (
                      <button
                        key={persona.id}
                        type="button"
                        onClick={() => handleSelectPersona(persona)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/50 shadow-sm'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                              isSelected
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {persona.avatarText}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <span>{persona.name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700">
                                {persona.badge}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">{persona.role}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{persona.organization}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Facility Selector */}
              <div className="pt-4 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Active Manufacturing Installation
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {mockInstallations.map((inst) => {
                    const isInstSel = activeInstallation.id === inst.id;
                    return (
                      <button
                        key={inst.id}
                        type="button"
                        onClick={() => handleSelectInstallation(inst)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          isInstSel
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                            : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Factory className={`w-4 h-4 ${isInstSel ? 'text-emerald-400' : 'text-slate-500'}`} />
                          <span className="text-[10px] font-mono text-slate-400">{inst.unLocode}</span>
                        </div>
                        <div className="text-xs font-semibold">{inst.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{inst.city}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Corporate Work Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-400">
                EU CBAM security requirement: Two-factor authentication (TOTP hardware token or Okta/Azure AD SSO) enforced for all authorized installation signatories.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In to Enterprise Workspace
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
