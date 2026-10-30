import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CalendarCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Building,
  User,
  X,
  FileCheck2,
} from 'lucide-react';
import { evcService, applicationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EVCActivity, UserRole } from '../types';

export const EvcPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [activities, setActivities] = useState<EVCActivity[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState(!!searchParams.get('appId'));
  const [selectedAppId, setSelectedAppId] = useState(searchParams.get('appId') || '');
  const [scheduledDate, setScheduledDate] = useState('');
  const [chairmanName, setChairmanName] = useState('Prof. K. Venkatesh (IIT Delhi)');
  const [venueOrMode, setVenueOrMode] = useState('PHYSICAL_INSPECTION');
  const [scheduling, setScheduling] = useState(false);

  // Submit Report Modal
  const [selectedActivity, setSelectedActivity] = useState<EVCActivity | null>(null);
  const [observations, setObservations] = useState('');
  const [recommendation, setRecommendation] = useState('RECOMMENDED_APPROVAL');
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchEvc = async () => {
    setLoading(true);
    try {
      const [evcData, appData] = await Promise.all([
        evcService.list(),
        applicationService.list({ limit: 50 }),
      ]);
      setActivities(evcData || []);
      setApplications(appData.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvc();
  }, [user]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !scheduledDate || !chairmanName) return;

    setScheduling(true);
    try {
      await evcService.schedule({
        applicationId: selectedAppId,
        committeeType: 'EXPERT_VISITING_COMMITTEE',
        scheduledDate,
        venueOrMode,
        chairmanName,
      });
      setShowScheduleModal(false);
      await fetchEvc();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to schedule EVC inspection');
    } finally {
      setScheduling(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;

    setSubmittingReport(true);
    try {
      await evcService.submitReport(selectedActivity.id, {
        observations,
        recommendation,
      });
      setSelectedActivity(null);
      setObservations('');
      await fetchEvc();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit inspection report');
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Expert Visiting Committee (EVC) & Inspection Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Scheduling physical and hybrid institutional inspections, conflict detection & statutory report submissions
          </p>
        </div>

        {user?.role !== UserRole.INSTITUTION_USER && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule EVC Inspection</span>
          </button>
        )}
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Loading scheduled committee inspections...
          </div>
        ) : activities.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            No inspection activities currently scheduled.
          </div>
        ) : (
          activities.map((evc) => (
            <div
              key={evc.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                    {evc.committeeType.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      evc.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {evc.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {evc.application?.institution?.name || 'Institution Inspection'}
                  </h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                    App Ref: {evc.application?.applicationNumber}
                  </p>
                </div>

                <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                  <div className="flex items-center text-slate-700 dark:text-slate-300">
                    <User className="w-3.5 h-3.5 mr-2 text-indigo-500 shrink-0" />
                    <span className="truncate">Chairman: {evc.chairmanName}</span>
                  </div>
                  <div className="flex items-center text-slate-700 dark:text-slate-300">
                    <Clock className="w-3.5 h-3.5 mr-2 text-indigo-500 shrink-0" />
                    <span>Visit Date: {new Date(evc.scheduledDate).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex items-center text-slate-700 dark:text-slate-300">
                    <Building className="w-3.5 h-3.5 mr-2 text-indigo-500 shrink-0" />
                    <span>Mode: {evc.venueOrMode}</span>
                  </div>
                </div>

                {evc.observations && (
                  <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-bold block text-[10px] uppercase text-slate-500">Observations:</span>
                    <p className="mt-0.5 line-clamp-2">{evc.observations}</p>
                    {evc.recommendation && (
                      <span className="mt-1.5 inline-block text-[10px] font-bold text-emerald-600">
                        Recommendation: {evc.recommendation.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {evc.status !== 'COMPLETED' && user?.role !== UserRole.INSTITUTION_USER ? (
                  <button
                    onClick={() => setSelectedActivity(evc)}
                    className="w-full py-1.5 text-xs font-semibold rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    Submit Inspection Report
                  </button>
                ) : (
                  <span className="w-full text-center text-xs text-emerald-600 font-semibold flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Inspection Finalized
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Schedule EVC Inspection Visit</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSchedule} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Target Application</label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  required
                >
                  <option value="">Select Application...</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.applicationNumber} — {app.institution?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Committee Chairman (Senior Professor)</label>
                <input
                  type="text"
                  value={chairmanName}
                  onChange={(e) => setChairmanName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Scheduled Inspection Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Verification Mode</label>
                <select
                  value={venueOrMode}
                  onChange={(e) => setVenueOrMode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  <option value="PHYSICAL_INSPECTION">Physical On-Site Verification (Geotagged Video)</option>
                  <option value="HYBRID">Hybrid (Physical Labs + Virtual Faculty Interaction)</option>
                  <option value="VIRTUAL_MEETING">Virtual Scrutiny Meeting</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-4 py-1.5 rounded font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {scheduling ? 'Scheduling...' : 'Confirm EVC Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Submit Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Record Committee Observations</h3>
              <button onClick={() => setSelectedActivity(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Statutory Recommendation</label>
                <select
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  <option value="RECOMMENDED_APPROVAL">Recommended for Approval (All Norms Met)</option>
                  <option value="DEFICIENCY_NOTED">Deficiencies Noted (Refer for Rectification)</option>
                  <option value="RECOMMENDED_REJECTION">Recommended for Refusal (Critical Norms Violated)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Physical Verification Observations</label>
                <textarea
                  rows={4}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Record factual observations regarding computer labs, fire hydrants, barrier-free ramps, and biometric faculty verification..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedActivity(null)}
                  className="px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-4 py-1.5 rounded font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submittingReport ? 'Submitting...' : 'Submit Final Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

