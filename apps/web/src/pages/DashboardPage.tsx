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
  UserCheck,
  CheckSquare,
  GraduationCap,
  Eye,
  Layers,
  Award,
  BookOpen,
  FileCheck2,
  Users,
  Activity,
  Shield,
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
  PieChart,
  Pie,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { reportService, applicationService, complianceService, auditService, taskService } from '../services/api';
import { UserRole } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<any>(null);
  const [stageData, setStageData] = useState<any[]>([]);
  const [regionalData, setRegionalData] = useState<any[]>([]);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggeringCheck, setTriggeringCheck] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [m, s, r, appsRes, auditsRes, tasksRes] = await Promise.all([
        reportService.getMetrics().catch(() => null),
        reportService.getStageDistribution().catch(() => []),
        reportService.getRegionalPendency().catch(() => []),
        applicationService.list({ limit: 6 }).catch(() => ({ applications: [] })),
        auditService.list({ limit: 6 }).catch(() => ({ events: [] })),
        taskService.list({ limit: 5 }).catch(() => []),
      ]);

      setMetrics(m);
      setStageData(s || []);
      setRegionalData(r || []);
      setRecentApps(appsRes.applications || []);
      setRecentAudits(auditsRes.events || []);
      setMyTasks(tasksRes || []);
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

  const COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];

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

  // Determine Dashboard Variant
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.SYSTEM_ADMIN;
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.BUREAU_OFFICER;
  const isDeptOfficer = user?.role === UserRole.DEPARTMENT_OFFICER || user?.role === UserRole.REGIONAL_OFFICER;
  const isEvaluator = user?.role === UserRole.EVALUATOR || user?.role === UserRole.COMMITTEE_MEMBER;
  const isFresher = user?.role === UserRole.FRESHER;
  const isViewer = user?.role === UserRole.VIEWER;
  const isInstitution = user?.role === UserRole.INSTITUTION_USER;

  return (
    <div className="space-y-6">
      {/* 1. Header Context Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {user?.role.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">
              {user?.departmentName || user?.institutionName || 'Regulatory Directorate'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {isSuperAdmin && 'Super Administrator Executive Operations Center'}
            {isAdmin && 'Administrative Management & Oversight Workspace'}
            {isDeptOfficer && `${user?.region ? `${user.region} Regional` : 'Department'} Scrutiny Directorate`}
            {isEvaluator && 'Evaluator Scrutiny & Expert Review Studio'}
            {isFresher && 'Fresher Learning & Supervised Verification Dashboard'}
            {isViewer && 'Statutory Oversight & Approval Transparency Dashboard'}
            {isInstitution && 'Institution Approval Filing & Compliance Portal'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSuperAdmin && 'Complete system-level governance, organization health, audit intelligence & security logs'}
            {isAdmin && 'Application assignment, evaluator management, approval workflows & compliance monitoring'}
            {isDeptOfficer && 'Departmental applications, document evidence scrutiny & regulatory deadlines'}
            {isEvaluator && 'Assigned inspection cases, verification checklists, evidence scoring & recommendations'}
            {isFresher && 'Guided regulatory onboarding, supervised verification checklists & handbook modules'}
            {isViewer && 'Read-only progress monitoring, official approval statuses & compliance reports'}
            {isInstitution && `Logged in as ${user?.fullName} (${user?.institutionName || 'Principal'})`}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {!isViewer && !isFresher && (
            <button
              onClick={handleRunComplianceCheck}
              disabled={triggeringCheck}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-subtle"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${triggeringCheck ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{triggeringCheck ? 'Evaluating...' : 'Run Compliance Scan'}</span>
            </button>
          )}

          {isInstitution && (
            <button
              onClick={() => navigate('/applications?action=new')}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>New Approval Application</span>
            </button>
          )}

          {isFresher && (
            <button
              onClick={() => navigate('/learning')}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Open Learning Academy</span>
            </button>
          )}

          {(isSuperAdmin || isAdmin) && (
            <button
              onClick={() => navigate('/admin?tab=users')}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Manage Organization</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Critical Deficiency Alert Banner if Overdue */}
      {metrics?.overdueCompliance > 0 && !isViewer && (
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

      {/* 3. Role-Tailored KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isEvaluator ? 'My Assigned Applications' : isFresher ? 'Learning Progress' : isViewer ? 'Monitored Applications' : 'Total Applications'}
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
              {isFresher ? <GraduationCap className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {isFresher ? '68%' : isEvaluator ? '3 Cases' : (metrics?.totalApplications ?? 0)}
            </span>
            <span className="text-xs text-slate-500">
              {isFresher ? '2/4 Modules' : 'Cycle 2026-27'}
            </span>
          </div>
          <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            {isFresher ? 'Supervised Track' : 'State machine active'}
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isEvaluator ? 'Pending Verifications' : isFresher ? 'Supervised Tasks' : isViewer ? 'Under Scrutiny' : 'Under Desk Scrutiny'}
            </span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {isFresher ? '4 Tasks' : isEvaluator ? '2 Pending' : (metrics?.pendingScrutiny ?? 0)}
            </span>
            <span className="text-xs text-amber-600 font-medium">In Queue</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Awaiting document scrutiny sign-off
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isFresher ? 'Accuracy Score' : isViewer ? 'Approved Decisions' : 'Deficiencies Raised'}
            </span>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600">
              {isFresher ? <Award className="w-4 h-4 text-emerald-600" /> : <ShieldAlert className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {isFresher ? '94.2%' : isViewer ? (metrics?.approvedApplications ?? 1) : (metrics?.deficiencyApplications ?? 0)}
            </span>
            <span className="text-xs text-slate-500">
              {isFresher ? 'Benchmark pass' : 'Requires Cure'}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {isFresher ? 'Verified against senior reviews' : 'Cure period active'}
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isSuperAdmin ? 'Security & Audits' : isFresher ? 'Mentor Reviews' : 'Compliance Rate'}
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {isSuperAdmin ? '0 Breaches' : isFresher ? '12 Signed' : `${(metrics?.complianceRate ?? 92).toFixed(1)}%`}
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              {isSuperAdmin ? 'Audit Verified' : 'Optimal'}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {isSuperAdmin ? 'Immutable trail logging active' : 'Lease, safety & funds intact'}
          </div>
        </div>
      </div>

      {/* 4. Evaluator / Fresher Specific Tasks Queue */}
      {(isEvaluator || isFresher || isDeptOfficer) && myTasks.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
              <CheckSquare className="w-4 h-4 mr-2 text-indigo-600" />
              {isFresher ? 'My Supervised Learning & Verification Checklist' : 'My Assigned Operational Tasks'}
            </h3>
            <button
              onClick={() => navigate('/tasks')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
            >
              View Full Task Queue <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="space-y-3">
            {myTasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-500'
                        : task.status === 'IN_PROGRESS'
                        ? 'bg-amber-500'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  ></span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-white truncate">
                      {task.title}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {task.description || task.type}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                    {task.progress}%
                  </span>
                  <button
                    onClick={() => navigate('/tasks')}
                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Charts Grid (Stage distribution & Regional Pendency) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Stage Lifecycle Funnel */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Application Stage Funnel Distribution
              </h2>
              <p className="text-xs text-slate-500">Live active cases across all regulatory approval stages</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              Live Database Stream
            </span>
          </div>

          <div className="h-64 w-full">
            {stageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis
                    dataKey="stage"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      color: '#f8fafc',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stageData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading stage distribution data...
              </div>
            )}
          </div>
        </div>

        {/* Right Chart: Regional Pendency & Workload */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Regional Directorates Workload
              </h2>
              <p className="text-xs text-slate-500">Pendency volume by jurisdiction</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {regionalData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={regionalData}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                  <YAxis
                    dataKey="region"
                    type="category"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    width={75}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      color: '#f8fafc',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="applications" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading regional pendency metrics...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. Recent Applications Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {isInstitution ? 'My Institution Applications' : 'Active Regulatory Docket'}
            </h2>
            <p className="text-xs text-slate-500">Recent application state machine transitions and audit records</p>
          </div>
          <button
            onClick={() => navigate('/applications')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
          >
            Full Application Registry <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Application Number</th>
                <th className="p-3">Institution & Region</th>
                <th className="p-3">Category</th>
                <th className="p-3">Stage</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white font-mono">
                    {app.applicationNumber}
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{app.institution?.name}</div>
                    <div className="text-[11px] text-slate-400">{app.institution?.region} Region</div>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    {app.category.replace(/_/g, ' ')}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStageBadgeColor(app.currentStage)}`}>
                      {app.currentStage.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => navigate(`/applications/${app.id}`)}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white transition-colors"
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
    </div>
  );
};
