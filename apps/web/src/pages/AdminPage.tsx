import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Settings,
  Users,
  Building,
  Server,
  Activity,
  CheckCircle2,
  Shield,
  Clock,
  Layers,
  Key,
  Lock,
  ShieldAlert,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { adminService } from '../services/api';
import { UserRole } from '../types';

export const AdminPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'users';

  const [activeTab, setActiveTab] = useState<'users' | 'departments' | 'institutions' | 'roles' | 'security' | 'health'>(
    ['users', 'departments', 'institutions', 'roles', 'security', 'health'].includes(initialTab)
      ? initialTab
      : 'users'
  );

  const [users, setUsers] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [rolesData, setRolesData] = useState<any>(null);
  const [securityStats, setSecurityStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['users', 'departments', 'institutions', 'roles', 'security', 'health'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [u, i, d, r, s, h] = await Promise.all([
          adminService.listUsers(),
          adminService.listInstitutions(),
          adminService.listDepartments(),
          adminService.getRolesAndPermissions(),
          adminService.getSecurityStats(),
          adminService.getSystemHealth(),
        ]);
        setUsers(u || []);
        setInstitutions(i || []);
        setDepartments(d || []);
        setRolesData(r || null);
        setSecurityStats(s || null);
        setHealth(h || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleTabChange = (key: any) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
          <Settings className="w-6 h-6 mr-2.5 text-indigo-600 dark:text-indigo-400" />
          Enterprise Administration & RBAC Governance Studio
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Organization topology, centralized role-based access management, department directories & security intelligence
        </p>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold overflow-x-auto">
        {[
          { key: 'users', label: `Users (${users.length})`, icon: Users },
          { key: 'departments', label: `Departments (${departments.length})`, icon: Layers },
          { key: 'institutions', label: `Institutions (${institutions.length})`, icon: Building },
          { key: 'roles', label: 'Roles & Permissions Matrix', icon: Key },
          { key: 'security', label: 'Security Intelligence & Audits', icon: ShieldAlert },
          { key: 'health', label: 'System Health & Node Status', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`pb-3 flex items-center space-x-2 transition-colors border-b-2 -mb-px whitespace-nowrap ${
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

      {/* Tab 1: Users */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email or role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
            </div>
            <span className="text-xs text-slate-400">Total {filteredUsers.length} user accounts</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">User & Designation</th>
                  <th className="p-3">Role Profile</th>
                  <th className="p-3">Department / Division</th>
                  <th className="p-3">Affiliation / Region</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{u.fullName}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                      {u.designation && (
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block mt-0.5">
                          {u.designation}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {u.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {u.departmentName || 'Central Administration'}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {u.institutionName || (u.region ? `${u.region} Regional Office` : 'National HQ')}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Departments */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    {dept.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                    {dept.name}
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {dept._count?.users || 0} Officers
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {dept.description || 'Departmental operations and compliance scrutiny unit.'}
              </p>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Key Officers
                </span>
                <div className="space-y-1.5">
                  {(dept.users || []).slice(0, 3).map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{u.fullName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{u.role.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Institutions */}
      {activeTab === 'institutions' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Institution Name & Code</th>
                <th className="p-3">Category</th>
                <th className="p-3">Region & Location</th>
                <th className="p-3">Workload Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {institutions.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3">
                    <div className="font-semibold text-slate-900 dark:text-white">{inst.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">Code: {inst.code}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {inst.type}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    <div>{inst.region} Region</div>
                    <div className="text-[11px] text-slate-400">{inst.city}, {inst.state}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-3 text-slate-500">
                      <span>Applications: <strong className="text-slate-900 dark:text-white">{inst._count?.applications || 0}</strong></span>
                      <span>Compliance Covenants: <strong className="text-slate-900 dark:text-white">{inst._count?.complianceItems || 0}</strong></span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Roles & Permissions Matrix */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200">
            <strong>Centralized RBAC Matrix:</strong> Permissions are assigned deterministically to each role profile according to the principle of least privilege.
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3 w-48">Role Profile</th>
                  <th className="p-3 w-28">Granted</th>
                  <th className="p-3">Granted Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(rolesData?.roles || []).map((r: any) => (
                  <tr key={r.role} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      {r.role.replace(/_/g, ' ')}
                    </td>
                    <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">
                      {r.permissionCount}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {r.permissions.map((p: string) => (
                          <span
                            key={p}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Security Intelligence */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total User Accounts</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {securityStats?.totalUsers || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
              <span className="text-xs font-semibold text-slate-500 uppercase">Active Sessions</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {securityStats?.activeUsers || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
              <span className="text-xs font-semibold text-slate-500 uppercase">Audited Events</span>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                {securityStats?.auditCount || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
              <span className="text-xs font-semibold text-slate-500 uppercase">Security Escalations</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {securityStats?.escalationsCount || 0}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Recent Audited Security Actions
            </h3>
            <div className="space-y-2 text-xs">
              {(securityStats?.recentAudits || []).map((audit: any) => (
                <div
                  key={audit.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white mr-2">{audit.action}</span>
                    <span className="text-slate-400">by {audit.actorEmail} ({audit.actorRole})</span>
                    {audit.reason && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{audit.reason}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(audit.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: System Health */}
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
              <span className="text-xs font-semibold text-slate-500 uppercase">Database Provider</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                SQLite / Prisma
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
              <span className="text-xs font-semibold text-slate-500 uppercase">Process Uptime</span>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {health?.uptimeSeconds || 0}s
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
              <span className="text-xs font-semibold text-slate-500 uppercase">Node Engine</span>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {health?.nodeVersion || process.version}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Database Entity Store Diagnostics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <span className="text-slate-400">Applications:</span>
                <span className="font-bold ml-2 text-slate-900 dark:text-white">{health?.stats?.applications || 0}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <span className="text-slate-400">Users:</span>
                <span className="font-bold ml-2 text-slate-900 dark:text-white">{health?.stats?.users || 0}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <span className="text-slate-400">Institutions:</span>
                <span className="font-bold ml-2 text-slate-900 dark:text-white">{health?.stats?.institutions || 0}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <span className="text-slate-400">Departments:</span>
                <span className="font-bold ml-2 text-slate-900 dark:text-white">{health?.stats?.departments || 0}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <span className="text-slate-400">Active Tasks:</span>
                <span className="font-bold ml-2 text-slate-900 dark:text-white">{health?.stats?.tasks || 0}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <span className="text-slate-400">Audit Events:</span>
                <span className="font-bold ml-2 text-slate-900 dark:text-white">{health?.stats?.auditEvents || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
