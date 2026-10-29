import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, ShieldCheck, ArrowRight, Lock, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('officer.north@regulaflow.aicte.gov.in');
  const [password, setPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSwitch = async (role: UserRole) => {
    setLoading(true);
    try {
      await switchDemoRole(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Demo switch failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-4">
          <Building className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white">
          RegulaFlow <span className="text-indigo-400">AI</span>
        </h2>
        <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
          Every approval tracked. Every deadline protected. Every action accountable.
        </p>
        <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
          Smart India Hackathon 2026 • SIH26262
        </span>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-900 text-xs text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Authorized Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* 1-Click Demo Evaluation Roles */}
          <div className="pt-6 border-t border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3 flex items-center justify-center">
              <Sparkles className="w-3 h-3 mr-1 text-indigo-400" />
              1-Click Demo Evaluation Accounts
            </p>

            <div className="grid grid-cols-1 gap-2">
              {[
                { role: UserRole.REGIONAL_OFFICER, label: 'Regional Officer (North)', desc: 'Scrutiny, deficiency flagging & EVC routing' },
                { role: UserRole.INSTITUTION_USER, label: 'Institution Principal', desc: 'Application submission & document uploading' },
                { role: UserRole.BUREAU_OFFICER, label: 'Bureau Officer (HQ)', desc: 'Executive oversight & statutory decision queue' },
                { role: UserRole.COMMITTEE_MEMBER, label: 'EVC Committee Member', desc: 'Inspection verification & observation submission' },
                { role: UserRole.SYSTEM_ADMIN, label: 'System Administrator', desc: 'Covenant configuration & full audit trail' },
              ].map((item) => (
                <button
                  key={item.role}
                  onClick={() => handleDemoSwitch(item.role)}
                  className="text-left p-2.5 rounded-lg bg-slate-800/60 hover:bg-indigo-950/60 hover:border-indigo-600 border border-slate-700/80 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-indigo-300">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-mono">1-Click &rarr;</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>

            <p className="text-center text-[10px] text-slate-500 font-mono mt-4">
              Demo Credentials: Password@123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
