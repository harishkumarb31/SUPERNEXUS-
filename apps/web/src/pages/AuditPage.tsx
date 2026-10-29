import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  Clock,
  User,
  X,
  Lock,
} from 'lucide-react';
import { auditService } from '../services/api';
import { AuditEventItem } from '../types';

export const AuditPage: React.FC = () => {
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<AuditEventItem | null>(null);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const data = await auditService.list({
        action: filterAction || undefined,
        page: pagination.page,
        limit: pagination.limit,
      });
      setEvents(data.events || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, [filterAction, pagination.page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Immutable Regulatory Audit Trail
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tamper-evident verification log recording all stage transitions, deficiency resolutions, and statutory actions
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Lock className="w-4 h-4 text-emerald-500" />
          <span>Non-deletable system journal</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Filter Action:</span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
          >
            <option value="">All Audit Actions</option>
            <option value="STAGE_TRANSITION">Stage Transition</option>
            <option value="APPLICATION_SUBMIT">Application Submit</option>
            <option value="DEFICIENCY_FLAGGED">Deficiency Flagged</option>
            <option value="DEFICIENCY_RESOLVED">Deficiency Resolved</option>
            <option value="DOCUMENT_UPLOAD">Document Upload</option>
            <option value="EVC_SCHEDULED">EVC Scheduled</option>
            <option value="LOGIN">User Authentication</option>
          </select>
        </div>
      </div>

      {/* Audit Events Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Actor & Role</th>
                <th className="px-5 py-3.5">Entity</th>
                <th className="px-5 py-3.5">Reason / Comments</th>
                <th className="px-5 py-3.5 text-right">State Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Loading audit trail journal...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No audit records matching filter.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono text-slate-500">
                      {new Date(ev.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4 font-bold text-indigo-600 dark:text-indigo-400">
                      {ev.action.replace(/_/g, ' ')}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {ev.user?.fullName || ev.actorEmail}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">{ev.actorRole}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      <span className="font-mono">{ev.entityType}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 max-w-xs truncate">
                      {ev.reason || '-'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedEvent(ev)}
                        className="px-2.5 py-1 text-xs rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white transition-colors"
                      >
                        Inspect State
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {events.length} of {pagination.total} audit entries</span>
          <div className="flex space-x-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-2 py-1 font-semibold text-slate-700 dark:text-slate-300">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* State Inspection Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Audit State Inspection: {selectedEvent.action}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Actor: {selectedEvent.actorEmail} ({selectedEvent.actorRole}) • IP: {selectedEvent.ipAddress}
                </p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-semibold block mb-1 text-slate-500">Before Mutation State:</span>
                <pre className="p-3 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 h-48 overflow-y-auto">
                  {selectedEvent.beforeStateJson
                    ? JSON.stringify(JSON.parse(selectedEvent.beforeStateJson), null, 2)
                    : '// No prior state recorded (Genesis event)'}
                </pre>
              </div>
              <div>
                <span className="font-semibold block mb-1 text-slate-500">After Mutation State:</span>
                <pre className="p-3 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 h-48 overflow-y-auto">
                  {selectedEvent.afterStateJson
                    ? JSON.stringify(JSON.parse(selectedEvent.afterStateJson), null, 2)
                    : '// No state delta recorded'}
                </pre>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded bg-indigo-600 text-white"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
