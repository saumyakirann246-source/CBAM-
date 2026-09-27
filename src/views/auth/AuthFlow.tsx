import React, { useState } from 'react';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Building2,
  Globe,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronRight,
  Factory,
  RotateCcw,
  Sparkles,
  Layers,
  Fingerprint,
} from 'lucide-react';

export type AuthScreenState = 'sign_in' | 'mfa' | 'division_select' | 'request_access' | 'authenticated_ready';

export interface DivisionItem {
  id: string;
  name: string;
  code: string;
  unLocode: string;
  country: string;
  countryCode: string;
  sector: 'iron_steel' | 'aluminium' | 'cement' | 'fertiliser' | 'hydrogen' | 'electricity';
  sectorLabel: string;
  annualCapacityTons: string;
  complianceStatus: 'compliant' | 'at_risk' | 'pending';
  statusLabel: string;
  pendingRequestsCount: number;
}

const MOCK_DIVISIONS: DivisionItem[] = [
  {
    id: 'div-01',
    name: 'Aegean Rolling Mill #04',
    code: 'VANG-AEG-04',
    unLocode: 'TRIST-004',
    country: 'Turkey',
    countryCode: 'TR',
    sector: 'iron_steel',
    sectorLabel: 'Iron & Steel (CN 72xx, 73xx)',
    annualCapacityTons: '1,200,000 t',
    complianceStatus: 'compliant',
    statusLabel: 'Q3 Verified & Ready',
    pendingRequestsCount: 1,
  },
  {
    id: 'div-02',
    name: 'Anatolia Light Metals & Smelting #02',
    code: 'VANG-ANA-02',
    unLocode: 'TRBUR-012',
    country: 'Turkey',
    countryCode: 'TR',
    sector: 'aluminium',
    sectorLabel: 'Aluminium (CN 76xx)',
    annualCapacityTons: '480,000 t',
    complianceStatus: 'at_risk',
    statusLabel: 'Default Markup Active',
    pendingRequestsCount: 2,
  },
  {
    id: 'div-03',
    name: 'Levant Technical Clinker & Cement',
    code: 'VANG-LEV-01',
    unLocode: 'EGPSD-002',
    country: 'Egypt',
    countryCode: 'EG',
    sector: 'cement',
    sectorLabel: 'Cement (CN 2523)',
    annualCapacityTons: '2,100,000 t',
    complianceStatus: 'pending',
    statusLabel: 'Lab Assay Pending',
    pendingRequestsCount: 0,
  },
  {
    id: 'div-04',
    name: 'Gulf Clean Nitrogen & Ammonia',
    code: 'VANG-GLF-03',
    unLocode: 'SAJUB-091',
    country: 'Saudi Arabia',
    countryCode: 'SA',
    sector: 'fertiliser',
    sectorLabel: 'Fertilisers (CN 2814, 3102)',
    annualCapacityTons: '650,000 t',
    complianceStatus: 'compliant',
    statusLabel: '1.01 Statutory Rate Verified',
    pendingRequestsCount: 0,
  },
];

interface AuthFlowProps {
  onComplete?: () => void;
}

export const AuthFlow: React.FC<AuthFlowProps> = ({ onComplete }) => {
  const { signInWithGoogle, currentUser } = useFirebaseAuth();
  const [screen, setScreen] = useState<AuthScreenState>('sign_in');
  const [email, setEmail] = useState('elena.rostova@vanguard-metals.com');
  const [password, setPassword] = useState('••••••••••••');
  const [hasMultipleDivisions, setHasMultipleDivisions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // MFA state
  const [mfaCode, setMfaCode] = useState(['5', '2', '8', '', '', '']);
  const [trustDevice, setTrustDevice] = useState(true);

  // Division state
  const [divisionSearch, setDivisionSearch] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<DivisionItem | null>(MOCK_DIVISIONS[0]);

  // Request Access state
  const [requestOrg, setRequestOrg] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!email || !password) {
      setAuthError('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setScreen('mfa');
    }, 600);
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (hasMultipleDivisions) {
        setScreen('division_select');
      } else {
        setSelectedDivision(MOCK_DIVISIONS[0]);
        setScreen('authenticated_ready');
      }
    }, 600);
  };

  const handleMfaDigitChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...mfaCode];
    updated[index] = val;
    setMfaCode(updated);

    if (val && index < 5) {
      const nextInput = document.getElementById(`mfa-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSelectDivision = (div: DivisionItem) => {
    setSelectedDivision(div);
    if (onComplete) {
      onComplete();
    } else {
      setScreen('authenticated_ready');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-slate-900 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="h-16 px-6 sm:px-10 border-b border-emerald-100/80 bg-white/95 backdrop-blur-md flex items-center justify-between z-10 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-emerald-500/25">
            CB
          </div>
          <span className="font-display text-base font-bold tracking-tight text-slate-900">
            CBAM Exporter Tracker
          </span>
          <span className="hidden sm:inline-block text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Enterprise Gateway
          </span>
        </div>

        <div className="text-xs font-mono text-slate-400 hidden sm:block">
          Regulation (EU) 2023/956 & 2023/1773
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-8 z-10">
        <div className="w-full max-w-[460px]">
          {/* SCREEN 1: SIGN IN */}
          {screen === 'sign_in' && (
            <div className="bg-white border border-emerald-100/90 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
              <div className="space-y-1.5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">
                  Welcome to CBAM Exporter
                </h2>
                <p className="text-xs text-slate-500">
                  Manage emissions, declarations, and EU buyer counterparties.
                </p>
              </div>

              {/* Error Banner */}
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Google Sign-in Button */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    await signInWithGoogle();
                    if (onComplete) {
                      onComplete();
                    } else {
                      setScreen('authenticated_ready');
                    }
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-800 shadow-xs hover:border-slate-300 transition-all hover:scale-[1.01]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-slate-200" />
                <span className="bg-white px-3 text-[10px] uppercase font-bold text-slate-400">
                  Or use corporate credentials
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Corporate Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => alert('Password recovery link sent.')}
                      className="text-xs text-emerald-600 hover:underline font-medium"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Single vs Multi-Plant Toggle */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Organization type:</span>
                  <button
                    type="button"
                    onClick={() => setHasMultipleDivisions(!hasMultipleDivisions)}
                    className="font-medium text-emerald-700 hover:underline"
                  >
                    {hasMultipleDivisions ? 'Multi-Plant (4 Sites)' : 'Single Plant (Direct Entry)'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.01]"
                >
                  {isLoading ? 'Verifying...' : 'Sign In with Credentials'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                New manufacturing exporter?{' '}
                <button
                  type="button"
                  onClick={() => setScreen('request_access')}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  Request a workspace
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 2: MFA */}
          {screen === 'mfa' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
              <div className="space-y-1 text-center">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Two-Factor Authentication
                </h2>
                <p className="text-xs text-slate-500">
                  Enter the 6-digit code sent to your authenticated device.
                </p>
              </div>

              <form onSubmit={handleMfaSubmit} className="space-y-6">
                <div className="flex justify-center gap-2">
                  {mfaCode.map((digit, i) => (
                    <input
                      key={i}
                      id={`mfa-input-${i}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleMfaDigitChange(i, e.target.value)}
                      className="w-11 h-12 text-center text-lg font-bold font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    id="trust-device"
                    checked={trustDevice}
                    onChange={(e) => setTrustDevice(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="trust-device">Trust this workstation for 30 days</label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.01]"
                >
                  {isLoading ? 'Confirming...' : 'Verify Token & Continue'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
                <button
                  type="button"
                  onClick={() => alert('New token dispatched.')}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  Resend token
                </button>
                <button
                  type="button"
                  onClick={() => setScreen('sign_in')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  Back to credentials
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 3: DIVISION SELECTOR */}
          {screen === 'division_select' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl p-6 sm:p-8 space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Select Operating Facility
                </h2>
                <p className="text-xs text-slate-500">
                  Your credentials grant access to 4 registered manufacturing divisions.
                </p>
              </div>

              <div className="space-y-2.5">
                {MOCK_DIVISIONS.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => handleSelectDivision(d)}
                    className="p-3.5 bg-slate-50/80 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-300 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{d.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {d.unLocode} · {d.sectorLabel}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      Enter <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 4: REQUEST ACCESS */}
          {screen === 'request_access' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl p-6 sm:p-8 space-y-5">
              <div className="space-y-1 text-center">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Request Exporter Workspace
                </h2>
                <p className="text-xs text-slate-500">
                  Onboard your industrial facility for EU CBAM compliance tracking.
                </p>
              </div>

              {requestSubmitted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-bold text-slate-900 text-sm">Request Submitted!</div>
                  <p className="text-xs text-slate-600">
                    Our compliance onboarding team will contact you within 24 business hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setRequestSubmitted(false);
                      setScreen('sign_in');
                    }}
                    className="mt-2 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setRequestSubmitted(true);
                  }}
                  className="space-y-3.5 text-xs"
                >
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anatolia Industrial Steel Inc."
                      value={requestOrg}
                      onChange={(e) => setRequestOrg(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Work Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="compliance@company.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs"
                  >
                    Submit Workspace Request
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setScreen('sign_in')}
                      className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                    >
                      Cancel & Return
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* SCREEN 5: AUTHENTICATED READY */}
          {screen === 'authenticated_ready' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Workspace Authenticated
              </h2>
              <p className="text-xs text-slate-500">
                Logged in as <span className="font-semibold text-slate-800">{email}</span>. Plant: <span className="font-semibold text-emerald-700">{selectedDivision?.name}</span>.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                {onComplete && (
                  <button
                    type="button"
                    onClick={onComplete}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    Open Executive Dashboard
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setScreen('sign_in')}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                >
                  Sign Out / Switch Account
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="h-14 px-6 border-t border-slate-200/80 bg-white text-xs text-slate-400 flex items-center justify-between">
        <div>SOC 2 Type II Certified · ISO 27001 · Annex IV Standard</div>
        <div>TÜV SÜD Validated</div>
      </footer>
    </div>
  );
};
