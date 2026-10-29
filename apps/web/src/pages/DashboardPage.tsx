import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  CalendarCheck2,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Building,
  UploadCloud,
  Bot,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { reportService, applicationService, complianceService, auditService } from '../services/api';
import { UserRole } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<any>(null);
  const [stageData, setStageData] = useState<any[]>([]);
  const [regionalData, setRegionalData] = useState<any[]>([]);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggeringCheck, setTriggeringCheck] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [m, s, r, appsRes, auditsRes] = await Promise.all([
        reportService.getMetrics(),
        reportService.getStageDistribution(),
        reportService.getRegionalPendency(),
        applicationService.list({ limit: 5 }),
        auditService.list({ limit: 6 }),
      ]);

      setMetrics(m);
      setStageData(s || []);
      setRegionalData(r || []);
      setRecentApps(appsRes.applications || []);
      setRecentAudits(auditsRes.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleRunComplianceCheck = async () => {
    setTriggeringCheck(true);
    try {
      await complianceService.triggerCheck();
      await fetchDashboardData();
    } catch (e) {
      console.error(e);
    } finally {
      setTriggeringCheck(false);
    }
  };

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
      case 'DEFICIENCY_RAISED':
      case 'RETURNED_FOR_CORRECTION':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800';
      case 'AWAITING_EVC':
      case 'UNDER_SCRUTINY':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800';
    }
  };

  const COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header Context Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Regulatory Operations Command Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Live AICTE Approval Lifecycle & Compliance Monitor • {user?.institutionName || user?.region ? `${user?.region} Regional Directorate` : 'HQ Oversight'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunComplianceCheck}
            disabled={triggeringCheck}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-subtle"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${triggeringCheck ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{triggeringCheck ? 'Evaluating Rules...' : 'Trigger Deadline Scheduler'}</span>
          </button>
          {user?.role === UserRole.INSTITUTION_USER && (
            <button
              onClick={() => navigate('/applications?action=new')}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>New Approval Application</span>
            </button>
          )}
        </div>
      </div>

      {/* Critical Deficiency Alert Banner if Overdue or Deficient */}
      {metrics?.overdueCompliance > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-center justify-between text-rose-900 dark:text-rose-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/50">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                Urgent Attention Required: {metrics.overdueCompliance} Overdue Compliance Item(s)
              </p>
              <p className="text-xs text-rose-700 dark:text-rose-400">
                Statutory expiry or lease covenant lapsed. Automated escalations have been generated for review.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/compliance?status=OVERDUE')}
            className="text-xs font-semibold text-rose-700 dark:text-rose-300 underline hover:no-underline flex items-center"
          >
            View Overdue Queue <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      )}

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Applications</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics?.totalApplications ?? 0}
            </span>
            <span className="text-xs text-slate-500">Academic Yr 2026-27</span>
          </div>
          <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> 100% active state machine routing
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Under Desk Scrutiny</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics?.pendingScrutiny ?? 0}
            </span>
            <span className="text-xs text-amber-600 font-medium">Assigned to Officers</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Awaiting document evidence review
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Open Deficiencies</span>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics?.openFindingsCount ?? 0}
            </span>
            <span className="text-xs text-rose-600 font-medium">Evidence-Linked</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Expired NOCs, lab carpet area deficits
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting EVC</span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics?.awaitingEVC ?? 0}
            </span>
            <span className="text-xs text-purple-600 font-medium">Inspection Stage</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Physical / Hybrid verification visits
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Distribution Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Applications by Workflow Stage
              </h2>
              <p className="text-xs text-slate-500">Real-time state machine distribution</p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Active Cases
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 10, fill: '#888888' }}
                  tickFormatter={(val) => val.replace(/_/g, ' ').substring(0, 10)}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#888888' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Pendency Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Regional Jurisdictional Pendency
              </h2>
              <p className="text-xs text-slate-500">Case volume across AICTE regional directorates</p>
            </div>
            <button
              onClick={() => navigate('/reports')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
            >
              Full Report <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="region" tick={{ fontSize: 11, fill: '#888888' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#888888' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending Cases" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" fill="#10b981" name="Approved Cases" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Applications & Recent Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Regulatory Applications
              </h3>
              <p className="text-xs text-slate-500">Active approval lifecycle cases</p>
            </div>
            <button
              onClick={() => navigate('/applications')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
            >
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Application ID</th>
                  <th className="px-4 py-3">Institution</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {app.applicationNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                        {app.institution.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">{app.institution.code}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {app.category.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStageBadgeColor(app.currentStage)}`}>
                        {app.currentStage.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/applications/${app.id}`)}
                        className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Trail Activity (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Audit Activity</h3>
            <span className="text-[10px] text-slate-400 font-mono">Immutable</span>
          </div>

          <div className="mt-3 flex-1 overflow-y-auto space-y-3">
            {recentAudits.map((event) => (
              <div key={event.id} className="text-xs border-l-2 border-indigo-500 pl-3 py-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {event.action.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  by {event.user?.fullName || event.actorEmail}
                </p>
                {event.reason && (
                  <p className="text-slate-400 text-[10px] italic mt-0.5 truncate">
                    "{event.reason}"
                  </p>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/audit')}
            className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-indigo-600 dark:text-indigo-400 hover:underline text-center"
          >
            Open Full Audit Trail &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
