import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface DemoAccount {
  role: UserRole;
  label: string;
  email: string;
  desc: string;
  category: 'Enterprise' | 'Domain';
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  // 6 Core Enterprise Roles
  {
    role: UserRole.SUPER_ADMIN,
    label: '1. Super Administrator',
    email: 'superadmin@supernexus.ai',
    desc: 'Full system control, organizations, audit logs, security & RBAC',
    category: 'Enterprise',
  },
  {
    role: UserRole.ADMIN,
    label: '2. Administrator',
    email: 'admin@supernexus.ai',
    desc: 'Operational management, assignments, document verification & alerts',
    category: 'Enterprise',
  },
  {
    role: UserRole.DEPARTMENT_OFFICER,
    label: '3. HR / Department Officer',
    email: 'officer.dept@supernexus.ai',
    desc: 'Department applications, document review, verification & missing file requests',
    category: 'Enterprise',
  },
  {
    role: UserRole.EVALUATOR,
    label: '4. Employee / Evaluator',
    email: 'evaluator@supernexus.ai',
    desc: 'Assigned scrutiny tasks, repository access, missing document requests',
    category: 'Enterprise',
  },
  {
    role: UserRole.FRESHER,
    label: '5. Fresher / Junior Evaluator',
    email: 'fresher@supernexus.ai',
    desc: 'Entry-level verification, preliminary checks & assisted evaluations',
    category: 'Enterprise',
  },
  {
    role: UserRole.VIEWER,
    label: '6. Viewer',
    email: 'viewer@supernexus.ai',
    desc: 'Read-only audit observations & status tracking',
    category: 'Enterprise',
  },
  // AICTE Regulatory Domain Roles
  {
    role: UserRole.INSTITUTION_USER,
    label: 'Institution Principal (Applicant)',
    email: 'institution@regulaflow.aicte.gov.in',
    desc: 'Self-disclosure, document uploads & response to deficiencies',
    category: 'Domain',
  },
  {
    role: UserRole.REGIONAL_OFFICER,
    label: 'Regional Officer (North)',
    email: 'officer.north@regulaflow.aicte.gov.in',
    desc: 'AICTE scrutiny, compliance scoring & EVC committee dispatch',
    category: 'Domain',
  },
];

export const LoginPage: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('superadmin@supernexus.ai');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'Enterprise' | 'Domain'>('Enterprise');

  // Clear stale errors when user edits any field
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  const formatErrorMessage = (err: any): string => {
    if (err.response?.status === 405) {
      return 'HTTP 405 Method Not Allowed: The API endpoint or routing configuration is being updated. Please retry in a moment.';
    }
    if (err.response?.status === 401) {
      return 'Invalid email address or password. Please verify your credentials.';
    }
    if (err.response?.status === 403) {
      return 'Access forbidden: This account is disabled or deactivated. Contact your system administrator.';
    }
    if (err.response?.status === 400) {
      return err.response?.data?.error || 'Invalid credential format. Please check your email and password.';
    }
    if (err.response?.data?.message) return err.response.data.message;
    if (err.response?.data?.error) return err.response.data.error;
    if (err.message && !err.message.includes('status code')) return err.message;
    return 'Authentication failed. Please verify credentials or retry with a demo account.';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your authorized email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(trimmedEmail, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSwitch = async (role: UserRole, demoEmail: string) => {
    if (loading) return;
    setEmail(demoEmail);
    setPassword('Password@123');
    setLoading(true);
    setError('');

    try {
      await switchDemoRole(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setError('');
  };

  const filteredAccounts = DEMO_ACCOUNTS.filter((acc) => acc.category === activeTab);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-4 ring-1 ring-white/20">
          <Building className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          SuperNexus <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">AI</span>
        </h1>
        <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
          Enterprise Multi-Role Regulatory Workflow, Document Verification & Compliance Intelligence
        </p>
        <div className="mt-2.5 flex items-center justify-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
            Smart India Hackathon 2026 • SIH26262
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
            RegulaFlow Engine v1.2.0
          </span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-900/90 backdrop-blur-xl py-7 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10 space-y-6">
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-xs text-rose-200 flex items-start space-x-2.5 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Authorized Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={loading}
                  autoComplete="email"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-slate-500 disabled:opacity-50"
                  placeholder="name@supernexus.ai"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Demo: Password@123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-slate-500 disabled:opacity-50"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Authenticating Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In with Credentials</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Multi-Role Demo Switcher */}
          <div className="pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                1-Click Multi-Role Demo Switcher
              </p>
              <div className="flex space-x-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('Enterprise');
                    if (error) setError('');
                  }}
                  className={`px-2 py-0.5 text-[10px] rounded font-medium transition-all ${
                    activeTab === 'Enterprise'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  6 Enterprise Roles
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('Domain');
                    if (error) setError('');
                  }}
                  className={`px-2 py-0.5 text-[10px] rounded font-medium transition-all ${
                    activeTab === 'Domain'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Domain Roles
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {filteredAccounts.map((item) => (
                <div
                  key={item.role}
                  className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800/90 border border-slate-700/60 hover:border-indigo-500/60 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {item.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                      {item.desc}
                    </p>
                    <p className="text-[9px] text-indigo-400/90 font-mono mt-1 truncate">
                      {item.email}
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between space-x-1.5">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleSelectAccount(item.email)}
                      className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-50"
                    >
                      Fill Form
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleDemoSwitch(item.role, item.email)}
                      className="text-[10px] text-indigo-300 font-semibold px-2 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600 hover:text-white border border-indigo-500/40 transition-colors flex items-center space-x-1 disabled:opacity-50"
                    >
                      <span>1-Click Login</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-[10px] text-slate-500 font-mono mt-4">
              All demo accounts encrypted with standard test credential: Password@123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
