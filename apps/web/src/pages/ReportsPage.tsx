import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  TrendingUp,
  Building,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { reportService } from '../services/api';

export const ReportsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [stageData, setStageData] = useState<any[]>([]);
  const [regionalData, setRegionalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [m, s, r] = await Promise.all([
        reportService.getMetrics(),
        reportService.getStageDistribution(),
        reportService.getRegionalPendency(),
      ]);
      setMetrics(m);
      setStageData(s || []);
      setRegionalData(r || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCsv = () => {
    window.open(reportService.exportCsvUrl(), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Regulatory Analytics & Management Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time stage-wise throughput, regional pendency analytics, and verifiable CSV export
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Verifiable CSV</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Applications</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {metrics?.totalApplications ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-amber-600 uppercase">Under Scrutiny</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            {metrics?.pendingScrutiny ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-rose-600 uppercase">Flagged Deficiencies</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">
            {metrics?.openFindingsCount ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-emerald-600 uppercase">Statutory Approvals</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {metrics?.approved ?? 0}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Application Status Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">Volume breakdown by active workflow state</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#888' }} tickFormatter={(s) => s.substring(0, 10)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#888' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Regional Directorate Pendency
          </h3>
          <p className="text-xs text-slate-500 mb-4">Pending vs approved applications by jurisdiction</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="region" tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#888' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending Cases" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" fill="#10b981" name="Approved Cases" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
