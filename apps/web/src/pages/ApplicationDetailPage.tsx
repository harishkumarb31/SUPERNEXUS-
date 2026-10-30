import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Building,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  CalendarCheck2,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Eye,
  FileCheck,
  Download,
  Trash2,
  X,
  ChevronRight,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { applicationService, documentService, validationService, complianceService, evcService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ApplicationDetail, ApplicationStage, UserRole } from '../types';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'documents' | 'findings' | 'compliance' | 'evc' | 'details' | 'history'>('documents');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocType, setUploadDocType] = useState('LAND_TITLE_LEASE_DEED');
  const [uploadExpiry, setUploadExpiry] = useState('');
  const [uploading, setUploading] = useState(false);

  // Transition Modal
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [targetStage, setTargetStage] = useState<ApplicationStage>(ApplicationStage.UNDER_SCRUTINY);
  const [transitionReason, setTransitionReason] = useState('');
  const [transitionSubmitting, setTransitionSubmitting] = useState(false);
  const [transitionError, setTransitionError] = useState('');

  const validTransitionsMap: Record<string, ApplicationStage[]> = {
    [ApplicationStage.DRAFT]: [ApplicationStage.SUBMITTED],
    [ApplicationStage.SUBMITTED]: [ApplicationStage.UNDER_SCRUTINY, ApplicationStage.CLOSED],
    [ApplicationStage.UNDER_SCRUTINY]: [
      ApplicationStage.DEFICIENCY_RAISED,
      ApplicationStage.AWAITING_EVC,
      ApplicationStage.UNDER_REVIEW,
      ApplicationStage.CLOSED,
    ],
    [ApplicationStage.DEFICIENCY_RAISED]: [
      ApplicationStage.RETURNED_FOR_CORRECTION,
      ApplicationStage.UNDER_SCRUTINY,
    ],
    [ApplicationStage.RETURNED_FOR_CORRECTION]: [ApplicationStage.RESUBMITTED],
    [ApplicationStage.RESUBMITTED]: [ApplicationStage.UNDER_SCRUTINY],
    [ApplicationStage.AWAITING_EVC]: [ApplicationStage.UNDER_REVIEW, ApplicationStage.DEFICIENCY_RAISED],
    [ApplicationStage.UNDER_REVIEW]: [
      ApplicationStage.AWAITING_DECISION,
      ApplicationStage.DEFICIENCY_RAISED,
      ApplicationStage.CLOSED,
    ],
    [ApplicationStage.AWAITING_DECISION]: [
      ApplicationStage.APPROVED,
      ApplicationStage.REJECTED,
      ApplicationStage.UNDER_REVIEW,
    ],
    [ApplicationStage.APPROVED]: [ApplicationStage.CLOSED],
    [ApplicationStage.REJECTED]: [ApplicationStage.CLOSED],
    [ApplicationStage.CLOSED]: [],
  };

  // OCR Extraction Modal
  const [selectedExtraction, setSelectedExtraction] = useState<any>(null);

  // Finding Resolution Modal
  const [selectedFinding, setSelectedFinding] = useState<any>(null);
  const [resolutionStatus, setResolutionStatus] = useState('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchApplication = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await applicationService.getById(id);
      setApplication(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id, user]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !id) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('applicationId', id);
      formData.append('documentType', uploadDocType);
      if (uploadExpiry) formData.append('expiryDate', uploadExpiry);

      await documentService.upload(formData);
      setShowUploadModal(false);
      setUploadFile(null);
      await fetchApplication();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setTransitionSubmitting(true);
    setTransitionError('');
    try {
      await applicationService.transition(id, targetStage, transitionReason);
      setShowTransitionModal(false);
      setTransitionReason('');
      await fetchApplication();
    } catch (err: any) {
      setTransitionError(err.response?.data?.error || 'Stage transition failed');
    } finally {
      setTransitionSubmitting(false);
    }
  };

  const handleResubmitApplication = async () => {
    if (!id) return;
    if (!confirm('Confirm resubmission of corrected documentation to AICTE regional scrutiny?')) return;

    setTransitionSubmitting(true);
    try {
      await applicationService.transition(
        id,
        ApplicationStage.RESUBMITTED,
        'Institution uploaded rectified documentation and resubmitted application for re-scrutiny'
      );
      await fetchApplication();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Resubmission failed');
    } finally {
      setTransitionSubmitting(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!id) return;
    if (!confirm('Are you sure you want to submit this application for statutory review?')) return;

    try {
      await applicationService.submit(id);
      await fetchApplication();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Submission failed');
    }
  };

  const handleResolveFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFinding) return;

    try {
      await validationService.resolveFinding(selectedFinding.id, resolutionStatus, resolutionNotes);
      setSelectedFinding(null);
      await fetchApplication();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update finding');
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

  const workflowSteps = [
    ApplicationStage.DRAFT,
    ApplicationStage.SUBMITTED,
    ApplicationStage.UNDER_SCRUTINY,
    ApplicationStage.DEFICIENCY_RAISED,
    ApplicationStage.AWAITING_EVC,
    ApplicationStage.UNDER_REVIEW,
    ApplicationStage.AWAITING_DECISION,
    ApplicationStage.APPROVED,
  ];

  if (loading || !application) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        Loading regulatory application workspace...
      </div>
    );
  }

  const currentStepIdx = workflowSteps.indexOf(application.currentStage);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {application.applicationNumber}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStageBadgeColor(application.currentStage)}`}>
                {application.currentStage.replace(/_/g, ' ')}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono">
                {application.priority} PRIORITY
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center font-medium text-slate-700 dark:text-slate-300">
                <Building className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                {application.institution.name} ({application.institution.code})
              </span>
              <span>•</span>
              <span>{application.institution.region} Region</span>
              <span>•</span>
              <span>Academic Year: {application.academicYear}</span>
              <span>•</span>
              <span>Category: {application.category.replace(/_/g, ' ')}</span>
            </div>
          </div>

          {/* Action Buttons based on User Role & Stage */}
          <div className="flex items-center space-x-2">
            {application.currentStage === ApplicationStage.DRAFT && user?.role === UserRole.INSTITUTION_USER && (
              <button
                onClick={handleSubmitApplication}
                className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit for Scrutiny</span>
              </button>
            )}

            {application.currentStage === ApplicationStage.RETURNED_FOR_CORRECTION && user?.role === UserRole.INSTITUTION_USER && (
              <button
                onClick={handleResubmitApplication}
                disabled={transitionSubmitting}
                className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{transitionSubmitting ? 'Resubmitting...' : 'Resubmit Corrected Application'}</span>
              </button>
            )}

            {user?.role !== UserRole.INSTITUTION_USER && (
              <button
                onClick={() => {
                  setTransitionError('');
                  const allowed = validTransitionsMap[application.currentStage] || [];
                  if (allowed.length > 0) {
                    setTargetStage(allowed[0]);
                  }
                  setShowTransitionModal(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Transition Stage</span>
              </button>
            )}
          </div>
        </div>

        {/* Visual Workflow Stepper */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Statutory Workflow Movement
          </p>
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {workflowSteps.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={step} className="flex items-center flex-1 min-w-[100px] last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCurrent
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950'
                          : isPast
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isPast ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`mt-1.5 text-[10px] text-center font-medium ${
                        isCurrent
                          ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                          : isPast
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {idx < workflowSteps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        idx < currentStepIdx ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold">
        {[
          { key: 'documents', label: `Documents & OCR (${application.documents.length})`, icon: FileText },
          { key: 'findings', label: `Deficiencies & Flags (${application.findings.length})`, icon: ShieldAlert },
          { key: 'compliance', label: `Compliance Covenants (${application.complianceItems.length})`, icon: ShieldCheck },
          { key: 'evc', label: `EVC Inspections (${application.evcActivities.length})`, icon: CalendarCheck2 },
          { key: 'details', label: 'Institutional Data', icon: Building },
          { key: 'history', label: `Audit & Timeline (${application.stageHistory.length})`, icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 flex items-center space-x-2 transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Documents & OCR Intelligence */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Regulatory Proof Documents
              </h3>
              <p className="text-xs text-slate-500">
                Uploaded deeds, safety certificates & undertakings subjected to automated OCR extraction
              </p>
            </div>
            {user?.role === UserRole.INSTITUTION_USER && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Proof Document</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {application.documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase">
                      {doc.documentType.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        doc.status === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                          : doc.status === 'FLAGGED'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400'
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-400'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-2 truncate" title={doc.originalName}>
                    {doc.originalName}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • SHA-256: {doc.checksumSha256.substring(0, 10)}...
                  </p>

                  {doc.expiryDate && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Expiry: {new Date(doc.expiryDate).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (doc.extractions && doc.extractions[0]) {
                        setSelectedExtraction(doc.extractions[0]);
                      } else {
                        documentService.triggerOcr(doc.id).then(() => fetchApplication());
                      }
                    }}
                    className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View OCR Extractions</span>
                  </button>

                  <a
                    href={documentService.downloadUrl(doc.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-slate-400 hover:text-slate-600"
                    title="Download Private Vault Proof"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Deficiencies & Scrutiny Findings */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Evidence-Linked Deficiencies & Scrutiny Findings
              </h3>
              <p className="text-xs text-slate-500">
                Rule-triggered and officer-confirmed statutory defects citing exact document evidence
              </p>
            </div>
          </div>

          {application.findings.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-emerald-600">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
              No open deficiencies flagged for this application. All statutory requirements currently satisfied.
            </div>
          ) : (
            <div className="space-y-3">
              {application.findings.map((f) => (
                <div
                  key={f.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card flex flex-col md:flex-row items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          f.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {f.severity}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {f.ruleCode}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Detected: {new Date(f.detectedAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{f.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{f.description}</p>

                    {f.evidenceExcerpt && (
                      <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 mt-2">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-[10px] uppercase">
                          Source Document Evidence Citation:
                        </span>
                        "{f.evidenceExcerpt}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-1 rounded border ${
                        f.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      Status: {f.status}
                    </span>

                    {user?.role !== UserRole.INSTITUTION_USER && f.status !== 'RESOLVED' && (
                      <button
                        onClick={() => setSelectedFinding(f)}
                        className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-colors"
                      >
                        Resolve / Update
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Compliance Obligations */}
      {activeTab === 'compliance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Associated Statutory Compliance Obligations
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {application.complianceItems.map((comp) => (
              <div
                key={comp.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                    {comp.obligationType.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      comp.status === 'OVERDUE'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : comp.status === 'DUE_SOON'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {comp.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-2">{comp.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{comp.description}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-mono flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Due Date: {new Date(comp.dueDate).toLocaleDateString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: EVC Activities */}
      {activeTab === 'evc' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Expert Visiting Committee (EVC) Schedule & Verification
            </h3>
            {user?.role !== UserRole.INSTITUTION_USER && (
              <button
                onClick={() => navigate(`/evc?appId=${application.id}`)}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Open Scheduling Workspace
              </button>
            )}
          </div>

          {application.evcActivities.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              No EVC activity currently scheduled for this case.
            </div>
          ) : (
            application.evcActivities.map((evc) => (
              <div
                key={evc.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                    {evc.committeeType.replace(/_/g, ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {evc.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Chairman:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{evc.chairmanName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Scheduled Date:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(evc.scheduledDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Inspection Mode:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{evc.venueOrMode}</span>
                  </div>
                </div>

                {evc.observations && (
                  <div className="p-3 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="font-bold block text-slate-700 dark:text-slate-300">
                      Committee Observations & Recommendation:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">{evc.observations}</p>
                    {evc.recommendation && (
                      <span className="mt-2 inline-block px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                        {evc.recommendation.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 5: Institutional Data */}
      {activeTab === 'details' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Institution Profile</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-xs">
              <div>
                <span className="text-slate-400 block">Institution Name</span>
                <span className="font-semibold">{application.institution.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Permanent AICTE Code</span>
                <span className="font-semibold font-mono">{application.institution.code}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Region</span>
                <span className="font-semibold">{application.institution.region}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Established Year</span>
                <span className="font-semibold">{application.institution.establishedYear}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sanctioned Programmes & Intake Data</h3>
            <pre className="mt-2 p-3 rounded bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
              {application.programmesData
                ? JSON.stringify(JSON.parse(application.programmesData), null, 2)
                : 'No programme data serialized'}
            </pre>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Infrastructure & Built-Up Space Metrics</h3>
            <pre className="mt-2 p-3 rounded bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
              {application.infrastructureData
                ? JSON.stringify(JSON.parse(application.infrastructureData), null, 2)
                : 'No infrastructure metrics serialized'}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 6: Audit & Timeline */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Application Lifecycle Audit Timeline
          </h3>

          <div className="space-y-4 border-l-2 border-indigo-500 pl-4">
            {application.stageHistory.map((hist) => (
              <div key={hist.id} className="relative text-xs">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900" />
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {hist.fromStage} &rarr; {hist.toStage}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(hist.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-slate-500 mt-0.5">
                  Action taken by: <span className="font-semibold">{hist.actorName || 'System'}</span> ({hist.actorRole || 'SYSTEM'})
                </p>
                {hist.reason && <p className="text-slate-600 dark:text-slate-300 italic mt-0.5">"{hist.reason}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upload Regulatory Document</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Document Category</label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  <option value="LAND_TITLE_LEASE_DEED">Land Title / Registered 30-Year Lease Deed</option>
                  <option value="FIRE_SAFETY_NOC">Fire Safety NOC Certificate</option>
                  <option value="OCCUPANCY_CERTIFICATE">Municipal Occupancy Certificate</option>
                  <option value="BUILDING_PLAN_SANCTION">Sanctioned Building Plan Approval</option>
                  <option value="AICTE_UNDERTAKING_AFFIDAVIT">AICTE Anti-Ragging & Service Affidavit</option>
                  <option value="AUDITED_BALANCE_SHEET">Audited Balance Sheet & Financial Records</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Document File (PDF, PNG, JPEG)</label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Expiry Date (if applicable)</label>
                <input
                  type="date"
                  value={uploadExpiry}
                  onChange={(e) => setUploadExpiry(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-3.5 py-1.5 rounded font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {uploading ? 'Processing OCR...' : 'Upload & Scrutinize'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OCR Extractions View Modal */}
      {selectedExtraction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  OCR Text Recognition & Field Extractions
                </h3>
                <p className="text-[11px] text-slate-400">
                  Engine: {selectedExtraction.ocrEngine} • Confidence: {(selectedExtraction.confidenceScore * 100).toFixed(1)}%
                </p>
              </div>
              <button onClick={() => setSelectedExtraction(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Structured Detected Fields:
                </span>
                <pre className="p-3 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto">
                  {selectedExtraction.extractedFieldsJson
                    ? JSON.stringify(JSON.parse(selectedExtraction.extractedFieldsJson), null, 2)
                    : 'No structured fields detected'}
                </pre>
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Raw Extracted Text Stream:
                </span>
                <div className="max-h-48 overflow-y-auto p-3 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                  {selectedExtraction.rawText}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedExtraction(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded bg-indigo-600 text-white"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage Transition Modal */}
      {showTransitionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Transition Workflow Stage</h3>
              <button onClick={() => setShowTransitionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {transitionError && (
              <div className="mt-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                {transitionError}
              </div>
            )}

            <form onSubmit={handleTransition} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Target Stage</label>
                {(validTransitionsMap[application.currentStage] || []).length > 0 ? (
                  <select
                    value={targetStage}
                    onChange={(e) => setTargetStage(e.target.value as ApplicationStage)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    {(validTransitionsMap[application.currentStage] || []).map((st) => (
                      <option key={st} value={st}>
                        {st.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-slate-400 italic">No further transitions permissible for stage {application.currentStage}.</p>
                )}
              </div>

              <div>
                <label className="block font-semibold mb-1">Statutory Reason / Reviewer Comments</label>
                <textarea
                  rows={3}
                  value={transitionReason}
                  onChange={(e) => setTransitionReason(e.target.value)}
                  placeholder="Record formal reasons citing AICTE APH clauses or committee findings..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowTransitionModal(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transitionSubmitting}
                  className="px-4 py-1.5 rounded font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {transitionSubmitting ? 'Transitioning...' : 'Confirm Transition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Finding Resolution Modal */}
      {selectedFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Review Deficiency Finding</h3>
              <button onClick={() => setSelectedFinding(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResolveFinding} className="mt-4 space-y-4 text-xs">
              <div className="p-3 rounded bg-slate-50 dark:bg-slate-800">
                <p className="font-bold text-slate-900 dark:text-white">{selectedFinding.title}</p>
                <p className="text-slate-500 mt-1">{selectedFinding.description}</p>
              </div>

              <div>
                <label className="block font-semibold mb-1">Resolution Status</label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  <option value="CONFIRMED">Confirmed Statutory Deficiency</option>
                  <option value="RESOLVED">Resolved (Rectification Verified)</option>
                  <option value="DISMISSED">Dismissed (False Positive / Clarified)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Resolution Notes</label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Record verification notes or grounds of resolution..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedFinding(null)}
                  className="px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Submit Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

