import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  FileCheck2,
  Building,
  X,
  ArrowRight,
} from 'lucide-react';
import { complianceService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ComplianceObligation, ComplianceStatus, UserRole } from '../types';

export const CompliancePage: React.FC = () => {
  const { user } = useAuth();

  const [obligations, setObligations] = useState<ComplianceObligation[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [triggeringCheck, setTriggeringCheck] = useState(false);

  // Resolution Modal
  const [selectedItem, setSelectedItem] = useState<ComplianceObligation | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  // New Obligation Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('LEASE_VALIDITY');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchCompliance = async () => {
    setLoading(true);
    try {
      const data = await complianceService.list({ status: filterStatus || undefined });
      setObligations(data.items || []);
      setMetrics(data.metrics || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompliance();
  }, [filterStatus, user]);

  const handleTriggerCheck = async () => {
    setTriggeringCheck(true);
    try {
      await complianceService.triggerCheck();
      await fetchCompliance();
    } catch (err) {
      console.error(err);
    } finally {
      setTriggeringCheck(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setResolving(true);
    try {
      await complianceService.resolve(selectedItem.id, { completionNotes });
      setSelectedItem(null);
      setCompletionNotes('');
      await fetchCompliance();
    } catch (err) {
      console.error(err);
    } finally {
      setResolving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await complianceService.create({
        obligationType: newType,
        title: newTitle,
        description: newDesc,
        dueDate: newDueDate,
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      setNewDueDate('');
      await fetchCompliance();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status: ComplianceStatus) => {
    switch (status) {
      case ComplianceStatus.OVERDUE:
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200';
      case ComplianceStatus.DUE_SOON:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200';
      case ComplianceStatus.COMPLETED:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200';
      default:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Compliance Monitoring & Covenant Watch
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tracking registered lease deeds, safety NOC renewals, undertakings & accreditation milestones
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleTriggerCheck}
            disabled={triggeringCheck}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-subtle"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${triggeringCheck ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{triggeringCheck ? 'Scanning Deadlines...' : 'Run Deadline Evaluation'}</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Compliance Covenant</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Covenants</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {metrics?.active ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Due Soon (&le;30 Days)</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            {metrics?.dueSoon ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Overdue (Escalated)</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">
            {metrics?.overdue ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Fulfilled / Verified</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {metrics?.completed ?? 0}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 text-xs font-semibold">
        {[
          { label: 'All Items', value: '' },
          { label: 'Overdue', value: 'OVERDUE' },
          { label: 'Due Soon', value: 'DUE_SOON' },
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Completed', value: 'COMPLETED' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`pb-2.5 transition-colors border-b-2 -mb-px ${
              filterStatus === tab.value
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Compliance Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Obligation Title & Type</th>
                <th className="px-5 py-3.5">Institution</th>
                <th className="px-5 py-3.5">Due Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    Loading statutory compliance obligations...
                  </td>
                </tr>
              ) : obligations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    No compliance records matching current filter.
                  </td>
                </tr>
              ) : (
                obligations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 mt-1 inline-block">
                        {item.obligationType.replace(/_/g, ' ')}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">{item.description}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{item.institution?.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {item.institution?.code} • {item.institution?.region} Region
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300 font-mono">
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {new Date(item.dueDate).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {item.status !== ComplianceStatus.COMPLETED ? (
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-colors"
                        >
                          Resolve Covenant
                        </button>
                      ) : (
                        <span className="text-emerald-600 text-xs font-semibold flex items-center justify-end">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Satisfied
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolve Compliance Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Record Compliance Resolution</h3>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResolve} className="mt-4 space-y-4 text-xs">
              <div className="p-3 rounded bg-slate-50 dark:bg-slate-800">
                <p className="font-bold text-slate-900 dark:text-white">{selectedItem.title}</p>
                <p className="text-slate-500 mt-1">{selectedItem.description}</p>
                <p className="text-amber-600 mt-1 font-mono">
                  Due: {new Date(selectedItem.dueDate).toLocaleDateString('en-IN')}
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-1">Verification / Evidence Notes</label>
                <textarea
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Record verification notes, renewal certificate reference number..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="px-4 py-1.5 rounded font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {resolving ? 'Recording...' : 'Mark as Satisfied'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Covenant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Compliance Covenant</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Covenant Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  <option value="LEASE_VALIDITY">Land Lease Validity Monitoring</option>
                  <option value="FIRE_SAFETY_RENEWAL">Fire Safety NOC Annual Renewal</option>
                  <option value="AFFIDAVIT_UNDERTAKING">AICTE Annual Undertaking Affidavit</option>
                  <option value="ENDOWMENT_FUND_DEPOSIT">Joint FDR Endowment Fund</option>
                  <option value="NBA_ACCREDITATION_COMPLIANCE">NBA Accreditation Milestone</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 30-Year Lease Expiry Review"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description / Statutory Requirement</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detail the requirement under AICTE Approval Process Handbook..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 rounded font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Covenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

