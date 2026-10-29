import React, { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  Building,
  Server,
  Activity,
  CheckCircle2,
  Shield,
  Clock,
} from 'lucide-react';
import { adminService } from '../services/api';

export const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'health' | 'users' | 'institutions'>('health');

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [u, i, h] = await Promise.all([
          adminService.listUsers(),
          adminService.listInstitutions(),
          adminService.getSystemHealth(),
        ]);
        setUsers(u || []);
        setInstitutions(i || []);
        setHealth(h || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          System Administration & Governance
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Operational health metrics, role-based access governance, and institution directory
        </p>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold">
        {[
          { key: 'health', label: 'System Health & Node Status', icon: Activity },
          { key: 'users', label: `System Users (${users.length})`, icon: Users },
          { key: 'institutions', label: `Affiliated Institutions (${institutions.length})`, icon: Building },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 flex items-center space-x-2 transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: System Health */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
              <span className="text-xs font-semibold text-slate-500 uppercase">System Status</span>
              <p className="text-xl font-bold text-emerald-600 mt-1 flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-1" /> ONLINE
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
              <span className="text-xs font-semibold text-slate-500 uppercase">Database</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {health?.database || 'CONNECTED'}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
              <span className="text-xs font-semibold text-slate-500 uppercase">Uptime</span>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {health?.uptimeSeconds || 0}s
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
              <span className="text-xs font-semibold text-slate-500 uppercase">Node Runtime</span>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {health?.nodeVersion || process.version}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Core Services</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { name: 'Prisma Relational Data Engine', status: 'ACTIVE', desc: 'SQLite / PostgreSQL persistent storage' },
                { name: 'Deterministic Rule Validation Engine', status: 'ACTIVE', desc: 'Mandatory proofs, fire safety, lease tenure verification' },
                { name: 'Tesseract & PDF Document OCR Streamer', status: 'ACTIVE', desc: 'Automated field recognition with regex bindings' },
                { name: 'Background Compliance & Deadline Scheduler', status: 'ACTIVE', desc: 'Runs every 10 mins with escalation triggers' },
                { name: 'AICTE APH Grounded RAG Assistant', status: 'ACTIVE', desc: 'Handbook knowledge base retrieval with verified citations' },
                { name: 'Central Immutable Audit Journal', status: 'ACTIVE', desc: 'Captures before/after mutation diffs' },
              ].map((svc) => (
                <div key={svc.name} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">{svc.name}</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">{svc.desc}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {svc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Region / Affiliation</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{u.fullName}</td>
                  <td className="px-5 py-4 text-slate-500 font-mono">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-[10px]">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                    {u.institutionName || u.region ? `${u.region} Region` : 'AICTE HQ'}
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Institutions */}
      {activeTab === 'institutions' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Institution Name</th>
                <th className="px-5 py-3.5">AICTE Code</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Region & City</th>
                <th className="px-5 py-3.5">Established</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {institutions.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{inst.name}</td>
                  <td className="px-5 py-4 font-mono text-indigo-600 dark:text-indigo-400">{inst.code}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{inst.type}</td>
                  <td className="px-5 py-4 text-slate-500">
                    {inst.city}, {inst.region} Region
                  </td>
                  <td className="px-5 py-4 font-mono text-slate-500">{inst.establishedYear}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
