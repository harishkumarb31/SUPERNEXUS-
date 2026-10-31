import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Search,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Building,
  Edit2,
  Check,
  X,
  Lock,
  UploadCloud,
  XCircle,
  Filter,
  Plus,
  FileText,
  User,
  Calendar,
  Layers,
  Send,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Bot,
  HelpCircle,
  ChevronRight,
  FileUp,
  History,
  Tag,
  CheckSquare,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole, Permission, ApplicationDocument, DocumentCategory, DocumentRequest } from '../types';
import { documentService, documentRequestService, applicationService } from '../services/api';

export const DocumentIntelligencePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab from URL search params (defaults to 'overview')
  const activeTab = searchParams.get('tab') || 'overview';
  const targetDocId = searchParams.get('id');
  const prefillTaskId = searchParams.get('taskId');
  const prefillTaskTitle = searchParams.get('taskTitle');
  const prefillAppId = searchParams.get('appId');

  const setTab = (tab: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next);
  };

  // User Authority Flags
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.SYSTEM_ADMIN;
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.BUREAU_OFFICER || isSuperAdmin;
  const isOfficer = user?.role === UserRole.DEPARTMENT_OFFICER || user?.role === UserRole.REGIONAL_OFFICER || isAdmin;
  const isViewer = user?.role === UserRole.VIEWER;
  const canVerify = isOfficer;
  const canManageRequests = isOfficer;
  const canManageCategories = isOfficer;

  // Data States
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [requestStats, setRequestStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Selected Document for Drawer & OCR
  const [selectedDoc, setSelectedDoc] = useState<ApplicationDocument | null>(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);

  // OCR Field Editing (Preserved feature)
  const [isEditingFields, setIsEditingFields] = useState(false);
  const [editedFields, setEditedFields] = useState<any>({});
  const [ocrRunning, setOcrRunning] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [newCategoryModalOpen, setNewCategoryModalOpen] = useState(false);

  // Targeted item for modals
  const [actionDoc, setActionDoc] = useState<ApplicationDocument | null>(null);
  const [actionRequest, setActionRequest] = useState<DocumentRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [verificationComments, setVerificationComments] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');

  // Upload Form State
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadDocType, setUploadDocType] = useState('GENERAL_SUPPORTING_DOCUMENT');
  const [uploadAppId, setUploadAppId] = useState(prefillAppId || '');
  const [uploadTaskId, setUploadTaskId] = useState(prefillTaskId || '');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadExpiry, setUploadExpiry] = useState('');
  const [uploadRestricted, setUploadRestricted] = useState(false);
  const [uploadRequestId, setUploadRequestId] = useState('');
  const [uploading, setUploading] = useState(false);

  // Request Form State
  const [reqTitle, setReqTitle] = useState('');
  const [reqCategory, setReqCategory] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [reqPriority, setReqPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [reqRequiredBy, setReqRequiredBy] = useState('');
  const [reqTaskId, setReqTaskId] = useState(prefillTaskId || '');
  const [reqAppId, setReqAppId] = useState(prefillAppId || '');
  const [reqDesc, setReqDesc] = useState(prefillTaskTitle ? `Required for task: ${prefillTaskTitle}` : '');
  const [reqSubmitting, setReqSubmitting] = useState(false);

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatCode, setNewCatCode] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Load All Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [docsData, catsData, statsData, reqsData, reqStatsData, appsData] = await Promise.all([
        documentService.list({ limit: 100 }),
        documentService.listCategories(),
        documentService.getStats(),
        documentRequestService.list({ limit: 100 }),
        documentRequestService.getStats(),
        applicationService.list({ limit: 50 }).catch(() => ({ applications: [] })),
      ]);

      setDocuments(docsData.documents || []);
      setCategories(catsData || []);
      setStats(statsData || {});
      setRequests(reqsData.requests || []);
      setRequestStats(reqStatsData || {});
      setApplications(appsData.applications || []);

      // If URL has ?id=, open that document
      if (targetDocId) {
        const found = (docsData.documents || []).find((d: any) => d.id === targetDocId);
        if (found) {
          setSelectedDoc(found);
          setDetailsDrawerOpen(true);
        }
      }
    } catch (err) {
      console.error('Failed to load document management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Handle Drag & Drop Upload
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadFiles(Array.from(e.dataTransfer.files));
      if (!uploadTitle) {
        setUploadTitle(e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFiles(Array.from(e.target.files));
      if (!uploadTitle) {
        setUploadTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  // Submit Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadFiles.length === 0) {
      alert('Please select at least one document to upload.');
      return;
    }

    setUploading(true);
    try {
      for (const file of uploadFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', uploadTitle || file.name);
        formData.append('documentType', uploadDocType);
        if (uploadCategory) formData.append('categoryId', uploadCategory);
        if (uploadAppId) formData.append('applicationId', uploadAppId);
        if (uploadTaskId) formData.append('taskId', uploadTaskId);
        if (uploadDesc) formData.append('description', uploadDesc);
        if (uploadExpiry) formData.append('expiryDate', uploadExpiry);
        if (uploadRestricted) formData.append('isRestricted', 'true');
        if (uploadRequestId) formData.append('documentRequestId', uploadRequestId);

        await documentService.upload(formData);
      }

      setUploadFiles([]);
      setUploadTitle('');
      setUploadDesc('');
      setUploadRequestId('');
      setUploadModalOpen(false);
      setTab('repository');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Document upload failed.');
    } finally {
      setUploading(false);
    }
  };

  // Submit Missing Document Request
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !reqReason.trim()) {
      alert('Document title and operational reason are required.');
      return;
    }

    setReqSubmitting(true);
    try {
      await documentRequestService.create({
        title: reqTitle.trim(),
        categoryId: reqCategory || undefined,
        reason: reqReason.trim(),
        priority: reqPriority,
        requiredByDate: reqRequiredBy || undefined,
        applicationId: reqAppId || undefined,
        taskId: reqTaskId || undefined,
        description: reqDesc.trim() || undefined,
      });

      setReqTitle('');
      setReqReason('');
      setReqDesc('');
      setRequestModalOpen(false);
      setTab(isOfficer ? 'requests' : 'my-requests');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit document request.');
    } finally {
      setReqSubmitting(false);
    }
  };

  // Verify Document
  const handleVerify = async (status: 'VERIFIED' | 'REJECTED' | 'REQUIRES_RESUBMISSION') => {
    if (!actionDoc) return;
    if (status === 'REJECTED' && !rejectionReason.trim()) {
      alert('Please provide a mandatory reason for rejecting this document.');
      return;
    }

    try {
      await documentService.verify(actionDoc.id, {
        status,
        comments: verificationComments.trim() || undefined,
        rejectionReason: rejectionReason.trim() || undefined,
      });

      setVerifyModalOpen(false);
      setRejectModalOpen(false);
      setActionDoc(null);
      setRejectionReason('');
      setVerificationComments('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Verification update failed.');
    }
  };

  // Assign Request
  const handleAssignRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionRequest || !assigneeId) return;

    try {
      await documentRequestService.assign(actionRequest.id, {
        assignedToId: assigneeId,
        notes: assignmentNotes.trim() || undefined,
      });

      setAssignModalOpen(false);
      setActionRequest(null);
      setAssigneeId('');
      setAssignmentNotes('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign request.');
    }
  };

  // Reject Request
  const handleRejectRequest = async () => {
    if (!actionRequest || !rejectionReason.trim()) {
      alert('Please enter a clear reason for declining this request.');
      return;
    }

    try {
      await documentRequestService.updateStatus(actionRequest.id, {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
      });

      setRejectModalOpen(false);
      setActionRequest(null);
      setRejectionReason('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject request.');
    }
  };

  // Create Custom Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      await documentService.createCategory({
        name: newCatName.trim(),
        code: newCatCode.trim() || undefined,
        description: newCatDesc.trim() || undefined,
      });

      setNewCatName('');
      setNewCatCode('');
      setNewCatDesc('');
      setNewCategoryModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create category.');
    }
  };

  // Trigger OCR
  const handleRunOcr = async (docId: string) => {
    setOcrRunning(true);
    try {
      const res = await documentService.triggerOcr(docId);
      setSelectedDoc((prev: any) => ({
        ...prev,
        status: 'OCR_COMPLETED',
        extractions: [
          {
            id: res.extractionId,
            rawText: res.text,
            extractedFieldsJson: JSON.stringify(res.fields),
            confidenceScore: res.confidence,
            ocrEngine: res.engine,
            processedAt: new Date().toISOString(),
          },
        ],
      }));
      setEditedFields(res.fields);
    } catch (err) {
      console.error(err);
    } finally {
      setOcrRunning(false);
    }
  };

  // Save OCR Edited Fields
  const handleSaveFields = async () => {
    if (!selectedDoc) return;
    try {
      await documentService.updateFields(selectedDoc.id, editedFields, 'Manual officer verification update');
      setIsEditingFields(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update document fields.');
    }
  };

  // Filtered Documents Logic
  const filteredDocs = documents.filter((doc) => {
    // Tab Scoping
    if (activeTab === 'verified' && doc.status !== 'VERIFIED') return false;
    if (activeTab === 'rejected' && doc.status !== 'REJECTED') return false;
    if (
      activeTab === 'verification' &&
      !['PENDING_VERIFICATION', 'UNDER_REVIEW', 'PENDING_OCR', 'UPLOADED'].includes(doc.status)
    ) {
      return false;
    }
    if (activeTab === 'my-docs' && doc.uploaderId !== user?.id) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        (doc.title && doc.title.toLowerCase().includes(q)) ||
        doc.originalName.toLowerCase().includes(q) ||
        doc.documentType.toLowerCase().includes(q) ||
        (doc.description && doc.description.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Category filter
    if (selectedCategory !== 'ALL' && doc.categoryId !== selectedCategory) return false;

    // Status filter
    if (selectedStatus !== 'ALL' && doc.status !== selectedStatus) return false;

    // Department filter
    if (selectedDept !== 'ALL' && doc.departmentId !== selectedDept) return false;

    return true;
  });

  // Filtered Requests Logic
  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'pending-requests' && ['CLOSED', 'REJECTED', 'AVAILABLE_FOR_EMPLOYEE'].includes(r.status)) {
      return false;
    }
    if (activeTab === 'my-requests' && r.requesterId !== user?.id) return false;
    return true;
  });

  // Status Styling Helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Clock className="w-3 h-3 mr-1" /> Under Review
          </span>
        );
      case 'REQUIRES_RESUBMISSION':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 mr-1" /> Resubmit Required
          </span>
        );
      case 'FLAGGED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <AlertCircle className="w-3 h-3 mr-1" /> Flagged Deficiency
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3 mr-1" /> Pending Verification
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white animate-pulse">
            URGENT
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
            HIGH
          </span>
        );
      case 'NORMAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
            NORMAL
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-500/20 text-slate-400">
            LOW
          </span>
        );
    }
  };

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE_FOR_EMPLOYEE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Available in Vault
          </span>
        );
      case 'DOCUMENT_UPLOADED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300">
            <Clock className="w-3 h-3 mr-1" /> In Verification
          </span>
        );
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300">
            <User className="w-3 h-3 mr-1" /> Assigned / In Progress
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300">
            <XCircle className="w-3 h-3 mr-1" /> Request Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
            <Send className="w-3 h-3 mr-1" /> Submitted
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                <FileCheck2 className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Enterprise Document Management & Verification</h1>
                <p className="text-xs text-indigo-200/80">
                  Secure repository, AI-assisted scrutiny, verification governance & employee missing document workflow
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isViewer && (
              <button
                onClick={() => setUploadModalOpen(true)}
                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <UploadCloud className="w-4 h-4 mr-2" />
                Upload Document
              </button>
            )}

            {!isViewer && (
              <button
                onClick={() => setRequestModalOpen(true)}
                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Request Missing Document
              </button>
            )}

            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Refresh repository"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-indigo-900/40">
          <div
            onClick={() => setTab('repository')}
            className="cursor-pointer bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded-xl p-3 transition-colors"
          >
            <div className="text-[11px] text-slate-400 font-medium">Total Documents</div>
            <div className="text-xl font-bold text-white mt-1">{stats?.totalDocs || 0}</div>
          </div>

          <div
            onClick={() => setTab('verified')}
            className="cursor-pointer bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded-xl p-3 transition-colors"
          >
            <div className="text-[11px] text-emerald-400 font-medium flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{stats?.verifiedDocs || 0}</div>
          </div>

          <div
            onClick={() => setTab('verification')}
            className="cursor-pointer bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded-xl p-3 transition-colors"
          >
            <div className="text-[11px] text-amber-400 font-medium flex items-center">
              <Clock className="w-3 h-3 mr-1" /> In Verification
            </div>
            <div className="text-xl font-bold text-amber-400 mt-1">{stats?.pendingDocs || 0}</div>
          </div>

          <div
            onClick={() => setTab('rejected')}
            className="cursor-pointer bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded-xl p-3 transition-colors"
          >
            <div className="text-[11px] text-rose-400 font-medium flex items-center">
              <XCircle className="w-3 h-3 mr-1" /> Rejected
            </div>
            <div className="text-xl font-bold text-rose-400 mt-1">{stats?.rejectedDocs || 0}</div>
          </div>

          <div
            onClick={() => setTab(isOfficer ? 'requests' : 'my-requests')}
            className="cursor-pointer bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded-xl p-3 transition-colors"
          >
            <div className="text-[11px] text-purple-400 font-medium flex items-center">
              <Send className="w-3 h-3 mr-1" /> Active Requests
            </div>
            <div className="text-xl font-bold text-purple-400 mt-1">{requestStats?.pending || 0}</div>
          </div>

          <div
            onClick={() => setTab('categories')}
            className="cursor-pointer bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded-xl p-3 transition-colors"
          >
            <div className="text-[11px] text-indigo-300 font-medium flex items-center">
              <Tag className="w-3 h-3 mr-1" /> Categories
            </div>
            <div className="text-xl font-bold text-indigo-300 mt-1">{categories.length || 10}</div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center space-x-1 overflow-x-auto scrollbar-none pb-px">
        <button
          onClick={() => setTab('overview')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <Layers className="w-4 h-4 mr-2" /> Document Overview
        </button>

        <button
          onClick={() => setTab('repository')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center whitespace-nowrap ${
            activeTab === 'repository'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <FileText className="w-4 h-4 mr-2" /> Central Repository ({documents.length})
        </button>

        <button
          onClick={() => setTab('verification')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center whitespace-nowrap ${
            activeTab === 'verification'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <Clock className="w-4 h-4 mr-2 text-amber-500" />
          Verification Queue
          {stats?.pendingDocs > 0 && (
            <span className="ml-2 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {stats.pendingDocs}
            </span>
          )}
        </button>

        <button
          onClick={() => setTab('verified')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center whitespace-nowrap ${
            activeTab === 'verified'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Verified ({stats?.verifiedDocs || 0})
        </button>

        <button
          onClick={() => setTab('rejected')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center whitespace-nowrap ${
            activeTab === 'rejected'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <XCircle className="w-4 h-4 mr-2 text-rose-500" /> Rejected ({stats?.rejectedDocs || 0})
        </button>

        {/* Requests Management for HR/Admin or My Requests for Employee */}
        {isOfficer ? (
          <button
            onClick={() => setTab('requests')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center whitespace-nowrap ${
              activeTab === 'requests' || activeTab === 'pending-requests'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Send className="w-4 h-4 mr-2 text-purple-500" />
            Document Requests
            {requestStats?.pending > 0 && (
              <span className="ml-2 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-600 text-white">
                {requestStats.pending}
              </span>
            )}
          </button>
        ) : (
          <button
            onClick={() => setTab('my-requests')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center whitespace-nowrap ${
              activeTab === 'my-requests'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Send className="w-4 h-4 mr-2 text-purple-500" /> My Requests ({requests.length})
          </button>
        )}

        <button
          onClick={() => setTab('my-docs')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center whitespace-nowrap ${
            activeTab === 'my-docs'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <User className="w-4 h-4 mr-2" /> My Documents
        </button>

        <button
          onClick={() => setTab('categories')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center whitespace-nowrap ${
            activeTab === 'categories'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <Tag className="w-4 h-4 mr-2" /> Categories
        </button>

        <button
          onClick={() => setTab('ocr-intelligence')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center whitespace-nowrap ${
            activeTab === 'ocr-intelligence'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <Sparkles className="w-4 h-4 mr-2 text-indigo-400" /> OCR & AI Scrutiny Studio
        </button>
      </div>

      {/* 3. TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Workflow Banner */}
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex items-start gap-3">
            <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                SuperNexus AI Statutory Document Governance Engine
              </h4>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-0.5">
                All files undergo automatic SHA-256 integrity hashing, duplicate verification, and OCR information extraction.
                Employees encountering unavailable documents for assigned tasks can issue a 1-click request to notify HR and Administration.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Urgent / Pending Document Requests */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
                  <Send className="w-4 h-4 mr-2 text-purple-600" /> Pending Missing Document Requests
                </h3>
                <button
                  onClick={() => setTab(isOfficer ? 'requests' : 'my-requests')}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
                >
                  View All ({requests.length}) <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-3">
                {requests.slice(0, 4).map((req) => (
                  <div key={req.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{req.title}</span>
                        {getPriorityBadge(req.priority)}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{req.reason}</p>
                      <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-1">
                        <span>By {req.requester?.fullName || 'Employee'}</span>
                        <span>•</span>
                        <span>{req.categoryName || 'General'}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {getRequestStatusBadge(req.status)}
                    </div>
                  </div>
                ))}
                {requests.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400">No active document requests.</div>
                )}
              </div>
            </div>

            {/* Verification Queue Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-amber-500" /> Verification Queue Awaiting Officer Sign-Off
                </h3>
                <button
                  onClick={() => setTab('verification')}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
                >
                  Open Queue ({stats?.pendingDocs || 0}) <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-3">
                {documents
                  .filter((d) => ['PENDING_VERIFICATION', 'UNDER_REVIEW', 'PENDING_OCR', 'UPLOADED'].includes(d.status))
                  .slice(0, 4)
                  .map((doc) => (
                    <div key={doc.id} className="py-3 flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {doc.title || doc.originalName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {doc.originalName} • {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Uploaded by {doc.uploader?.fullName || 'Institution'} • {new Date(doc.uploadDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center space-x-2">
                        {canVerify && (
                          <button
                            onClick={() => {
                              setActionDoc(doc);
                              setVerifyModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedDoc(doc);
                            setDetailsDrawerOpen(true);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-200"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                {documents.filter((d) => ['PENDING_VERIFICATION', 'UNDER_REVIEW'].includes(d.status)).length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400">All uploaded documents are verified!</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2, 4, 5, 6, 10: DOCUMENT REPOSITORY / VERIFICATION / VERIFIED / REJECTED / MY-DOCS */}
      {(activeTab === 'repository' ||
        activeTab === 'verification' ||
        activeTab === 'verified' ||
        activeTab === 'rejected' ||
        activeTab === 'my-docs') && (
        <div className="space-y-4">
          {/* Search & Filter Controls */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, original filename, document type, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded-lg px-3 py-2 outline-none"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              {activeTab === 'repository' && (
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded-lg px-3 py-2 outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="PENDING_VERIFICATION">Pending Verification</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="FLAGGED">Flagged</option>
                </select>
              )}

              {(searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                    setSelectedStatus('ALL');
                  }}
                  className="p-2 text-xs text-slate-400 hover:text-slate-200"
                  title="Reset filters"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Document Table / Cards */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Document Title & Filename</th>
                    <th className="py-3 px-4">Category & Department</th>
                    <th className="py-3 px-4">Uploader / Owner</th>
                    <th className="py-3 px-4">Verification Status</th>
                    <th className="py-3 px-4">Version & Size</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredDocs.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-start space-x-3">
                          <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0">
                            <FileText className="w-4 h-4" />
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center">
                              {doc.title || doc.originalName}
                              {doc.isRestricted && (
                                <span title="Restricted Document">
                                  <Lock className="w-3 h-3 ml-1.5 text-rose-500" />
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{doc.originalName}</div>
                            {doc.rejectionReason && (
                              <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center">
                                <AlertTriangle className="w-3 h-3 mr-1 shrink-0" />
                                Rejection: {doc.rejectionReason}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {doc.category?.name || 'General Document'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {doc.department?.name || 'Central Regulatory Registry'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 dark:text-slate-300">
                          {doc.uploader?.fullName || doc.institution?.name || 'External Applicant'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(doc.status)}
                        {doc.verifiedBy && (
                          <div className="text-[10px] text-slate-400 mt-1">By {doc.verifiedBy}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          v{doc.version}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {canVerify && doc.status !== 'VERIFIED' && (
                            <button
                              onClick={() => {
                                setActionDoc(doc);
                                setVerifyModalOpen(true);
                              }}
                              className="px-2 py-1 rounded text-[11px] font-semibold bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
                              title="Verify document"
                            >
                              Verify
                            </button>
                          )}

                          {canVerify && doc.status !== 'REJECTED' && (
                            <button
                              onClick={() => {
                                setActionDoc(doc);
                                setRejectModalOpen(true);
                              }}
                              className="px-2 py-1 rounded text-[11px] font-semibold bg-rose-600/10 text-rose-600 hover:bg-rose-600/20"
                              title="Reject document"
                            >
                              Reject
                            </button>
                          )}

                          <a
                            href={documentService.downloadUrl(doc.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                            title="Download document"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => {
                              setSelectedDoc(doc);
                              setDetailsDrawerOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                            title="View details & OCR extractions"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredDocs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                        No documents found matching the active filters or scope.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 7 & 8: DOCUMENT REQUESTS (MANAGEMENT OR EMPLOYEE TRACKER) */}
      {(activeTab === 'requests' || activeTab === 'pending-requests' || activeTab === 'my-requests') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50">
            <div>
              <h3 className="text-sm font-bold text-purple-900 dark:text-purple-300 flex items-center">
                <Send className="w-4 h-4 mr-2" />
                {isOfficer ? 'Employee Missing Document Requests & Escalation Queue' : 'My Requested Documents Tracking Board'}
              </h3>
              <p className="text-xs text-purple-700 dark:text-purple-400 mt-0.5">
                {isOfficer
                  ? 'Employees submit requests for missing application records. Assign officers or fulfill directly by uploading.'
                  : 'Track the live fulfillment status of required documents requested for your assigned evaluation tasks.'}
              </p>
            </div>

            <button
              onClick={() => setRequestModalOpen(true)}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all self-start"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Request Missing File
            </button>
          </div>

          {/* Requests Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Request # & Document Title</th>
                    <th className="py-3 px-4">Requester & Dept</th>
                    <th className="py-3 px-4">Priority & Deadline</th>
                    <th className="py-3 px-4">Fulfillment Status</th>
                    <th className="py-3 px-4">Assigned Officer</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                          <span className="font-mono text-indigo-500">{req.requestNumber}</span>
                          <span>•</span>
                          <span>{req.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-md">{req.reason}</p>
                        {req.rejectionReason && (
                          <div className="text-[11px] text-rose-500 font-semibold mt-1">
                            Declined: {req.rejectionReason}
                          </div>
                        )}
                        {req.task && (
                          <div className="text-[10px] text-indigo-400 mt-1 flex items-center">
                            <CheckSquare className="w-3 h-3 mr-1" />
                            For Task: {req.task.title}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {req.requester?.fullName}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {req.department?.name || 'Department Scrutiny'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div>{getPriorityBadge(req.priority)}</div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {req.requiredByDate
                            ? `Due: ${new Date(req.requiredByDate).toLocaleDateString()}`
                            : 'No hard deadline'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {getRequestStatusBadge(req.status)}
                        {req.fulfilledDocument && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                            Fulfilled: {req.fulfilledDocument.originalName}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 dark:text-slate-300">
                          {req.assignedTo?.fullName || (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {isOfficer && req.status !== 'AVAILABLE_FOR_EMPLOYEE' && req.status !== 'CLOSED' && (
                            <>
                              <button
                                onClick={() => {
                                  setActionRequest(req);
                                  setAssignModalOpen(true);
                                }}
                                className="px-2 py-1 rounded text-[11px] font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700"
                              >
                                Assign
                              </button>

                              <button
                                onClick={() => {
                                  setUploadRequestId(req.id);
                                  setUploadTitle(req.title);
                                  setUploadAppId(req.applicationId || '');
                                  setUploadTaskId(req.taskId || '');
                                  setUploadModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded text-[11px] font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
                              >
                                Upload & Fulfill
                              </button>

                              <button
                                onClick={() => {
                                  setActionRequest(req);
                                  setRejectModalOpen(true);
                                }}
                                className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                                title="Decline request"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {req.fulfilledDocument && (
                            <a
                              href={documentService.downloadUrl(req.fulfilledDocument.id)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-600 text-white hover:bg-emerald-500 inline-flex items-center"
                            >
                              <Download className="w-3.5 h-3.5 mr-1" /> Get Document
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                        No requests found in this queue.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 10: CATEGORIES MANAGEMENT STUDIO */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Document Classification Categories</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Statutory document classifications governing verification rules and retention policies
              </p>
            </div>

            {canManageCategories && (
              <button
                onClick={() => setNewCategoryModalOpen(true)}
                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add Category
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                    <Tag className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {cat.code}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-3">{cat.name}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{cat.description}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                  <span>{(cat._count?.documents || 0)} Documents</span>
                  <span>{(cat._count?.requests || 0)} Requests</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB 11: OCR FIELD INTELLIGENCE STUDIO (Preserved) */}
      {activeTab === 'ocr-intelligence' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Selector Column */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm h-[650px] overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Select Document for Scrutiny
            </h3>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    if (doc.extractions?.[0]?.extractedFieldsJson) {
                      try {
                        setEditedFields(JSON.parse(doc.extractions[0].extractedFieldsJson));
                      } catch (e) {
                        setEditedFields({});
                      }
                    }
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedDoc?.id === doc.id
                      ? 'bg-indigo-50/80 border-indigo-500 dark:bg-indigo-950/40 dark:border-indigo-600'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                    {doc.title || doc.originalName}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{doc.documentType}</span>
                    <span>v{doc.version}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OCR Field Inspection Column */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            {selectedDoc ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedDoc.title || selectedDoc.originalName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      SHA256: <span className="font-mono text-slate-400">{selectedDoc.checksumSha256.slice(0, 24)}...</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRunOcr(selectedDoc.id)}
                      disabled={ocrRunning}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm flex items-center"
                    >
                      <Sparkles className={`w-3.5 h-3.5 mr-1.5 ${ocrRunning ? 'animate-spin' : ''}`} />
                      {ocrRunning ? 'Analyzing Text...' : 'Run OCR Inspection'}
                    </button>

                    <a
                      href={documentService.downloadUrl(selectedDoc.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Structured Extraction Fields */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      OCR Extracted Metadata Fields
                    </h4>
                    {canVerify && (
                      <button
                        onClick={() => setIsEditingFields(!isEditingFields)}
                        className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" />
                        {isEditingFields ? 'Cancel Editing' : 'Edit Extracted Fields'}
                      </button>
                    )}
                  </div>

                  {Object.keys(editedFields).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(editedFields).map(([key, val]) => (
                        <div
                          key={key}
                          className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                        >
                          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </label>
                          {isEditingFields ? (
                            <input
                              type="text"
                              value={String(val || '')}
                              onChange={(e) =>
                                setEditedFields((prev: any) => ({ ...prev, [key]: e.target.value }))
                              }
                              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-xs outline-none"
                            />
                          ) : (
                            <span className="text-xs font-medium text-slate-900 dark:text-white">
                              {String(val || 'N/A')}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                      No extracted OCR fields found. Click "Run OCR Inspection" to extract structured text.
                    </div>
                  )}

                  {isEditingFields && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={handleSaveFields}
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 flex items-center shadow"
                      >
                        <Check className="w-4 h-4 mr-1.5" /> Save Verified Corrections
                      </button>
                    </div>
                  )}

                  {saveSuccess && (
                    <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs rounded-lg flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Document field corrections saved and recorded in audit log.
                    </div>
                  )}
                </div>

                {/* Raw OCR Text View */}
                {selectedDoc.extractions?.[0]?.rawText && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Extracted Text Stream
                    </h4>
                    <pre className="p-4 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                      {selectedDoc.extractions[0].rawText}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400 text-xs">
                <FileText className="w-12 h-12 text-slate-600 mb-3 stroke-1" />
                Select a document from the left to inspect OCR text and field bindings.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. MODAL: UPLOAD DOCUMENT */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center mb-1">
              <UploadCloud className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Upload Statutory Regulatory Document
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Upload PDF, DOCX, XLSX, or image records into the secure SuperNexus AI vault
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/50"
              >
                <input
                  type="file"
                  id="doc-upload"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="doc-upload" className="cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    Drag & drop files here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Supports PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (up to 20MB)
                  </p>
                </label>

                {uploadFiles.length > 0 && (
                  <div className="mt-3 text-left bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="font-semibold text-emerald-600 flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {uploadFiles.length} file(s) selected:
                    </span>
                    <ul className="text-[11px] text-slate-500 mt-1">
                      {uploadFiles.map((f, i) => (
                        <li key={i} className="truncate">
                          {f.name} ({(f.size / 1024).toFixed(1)} KB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Registered Land Lease Deed 2026"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Classification Category
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Application / Task Association */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Related Application (Optional)
                  </label>
                  <select
                    value={uploadAppId}
                    onChange={(e) => setUploadAppId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  >
                    <option value="">None / Standalone Vault File</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.applicationNumber} - {app.institution?.name?.slice(0, 24)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Document Expiry Date (if applicable)
                  </label>
                  <input
                    type="date"
                    value={uploadExpiry}
                    onChange={(e) => setUploadExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* If fulfilling a document request */}
              {isOfficer && (
                <div>
                  <label className="text-xs font-semibold text-purple-600 dark:text-purple-400 block mb-1">
                    Fulfill Employee Missing Document Request
                  </label>
                  <select
                    value={uploadRequestId}
                    onChange={(e) => setUploadRequestId(e.target.value)}
                    className="w-full px-3 py-2 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-300 dark:border-purple-800 rounded-lg text-xs outline-none text-slate-900 dark:text-white"
                  >
                    <option value="">None</option>
                    {requests
                      .filter((r) => r.status !== 'AVAILABLE_FOR_EMPLOYEE' && r.status !== 'CLOSED')
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.requestNumber} — {r.title} (Requested by {r.requester?.fullName})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Description / Version Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context, sub-registrar details, or compliance notes..."
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Restricted Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="restricted-toggle"
                  checked={uploadRestricted}
                  onChange={(e) => setUploadRestricted(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="restricted-toggle" className="text-xs text-slate-700 dark:text-slate-300">
                  Mark as confidential / restricted access
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center shadow-lg"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" /> Uploading & Validating...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5 mr-2" /> Submit for Verification
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. MODAL: REQUEST MISSING DOCUMENT (Phase 4 Employee Flow) */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setRequestModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center mb-1">
              <Send className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
              Request Unavailable Document for Task
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Dispatches statutory notifications to HR, Administration, and Super Admin to upload missing files.
            </p>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Document Name / Record Required *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Registered Land Lease Deed, Fire Safety NOC Renewal"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Document Category
                  </label>
                  <select
                    value={reqCategory}
                    onChange={(e) => setReqCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs outline-none text-slate-900 dark:text-white"
                  >
                    <option value="">General Supporting</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Priority Level
                  </label>
                  <select
                    value={reqPriority}
                    onChange={(e: any) => setReqPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs outline-none text-slate-900 dark:text-white"
                  >
                    <option value="NORMAL">Normal Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent (SLA Triggered)</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Required-By Date
                </label>
                <input
                  type="date"
                  value={reqRequiredBy}
                  onChange={(e) => setReqRequiredBy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Operational Justification / Scrutiny Reason *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain why this file is indispensable for your verification task..."
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reqSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center shadow-lg"
                >
                  {reqSubmitting ? 'Submitting & Notifying...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. MODAL: VERIFY DOCUMENT */}
      {verifyModalOpen && actionDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center mb-1">
              <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-500" />
              Certify & Verify Document
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              You are certifying that "{actionDoc.title || actionDoc.originalName}" satisfies regulatory scrutiny norms.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Verification Comments / Audit Sign-off
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Verified sub-registrar seal, carpet area matches Chapter 4 instructional norms..."
                  value={verificationComments}
                  onChange={(e) => setVerificationComments(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setVerifyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerify('VERIFIED')}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
                >
                  Confirm Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. MODAL: REJECT DOCUMENT / REQUEST (Mandatory Reason) */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <h3 className="text-base font-bold text-rose-600 flex items-center mb-1">
              <XCircle className="w-5 h-5 mr-2" />
              {actionDoc ? 'Reject Uploaded Document' : 'Decline Document Request'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Regulatory governance requires a mandatory explanation for every rejected file or request.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide precise deficiency, expired date, uncertified copy, or policy violation..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    setRejectModalOpen(false);
                    setActionDoc(null);
                    setActionRequest(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={actionDoc ? () => handleVerify('REJECTED') : handleRejectRequest}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12. MODAL: ASSIGN DOCUMENT REQUEST */}
      {assignModalOpen && actionRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center mb-1">
              <User className="w-5 h-5 mr-2 text-indigo-500" />
              Assign Document Request
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Delegate "{actionRequest.title}" ({actionRequest.requestNumber}) to an officer or self.
            </p>

            <form onSubmit={handleAssignRequest} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Assignee User ID / Target Officer *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter User ID or email of officer"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Assignment Instructions / Registry Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Check physical archive record room cabinet 4..."
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 13. MODAL: NEW CATEGORY */}
      {newCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center mb-1">
              <Tag className="w-5 h-5 mr-2 text-indigo-500" />
              Add Document Classification Category
            </h3>

            <form onSubmit={handleCreateCategory} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Intellectual Property & Patents"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Category Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="CAT_IP_PATENTS"
                  value={newCatCode}
                  onChange={(e) => setNewCatCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs outline-none text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Scope of documents classified under this category..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 14. SLIDE-OVER DRAWER: DOCUMENT DETAILS, VERSIONS & VERIFICATION AUDIT TRAIL */}
      {detailsDrawerOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
                      <FileText className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Document Inspection</h3>
                      <p className="text-[10px] text-slate-400 font-mono">Ref ID: {selectedDoc.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDetailsDrawerOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Primary Card */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      {selectedDoc.title || selectedDoc.originalName}
                    </span>
                    {getStatusBadge(selectedDoc.status)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{selectedDoc.description}</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400">File Type:</span>{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedDoc.mimeType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Size:</span>{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {(selectedDoc.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Category:</span>{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {selectedDoc.category?.name || 'General'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Version:</span>{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">v{selectedDoc.version}</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    SHA256: {selectedDoc.checksumSha256}
                  </div>
                </div>

                {/* Verification History Trail */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center">
                    <History className="w-3.5 h-3.5 mr-1.5" /> Verification & Audit Sign-Off Trail
                  </h4>
                  <div className="space-y-2">
                    {selectedDoc.verifications && selectedDoc.verifications.length > 0 ? (
                      selectedDoc.verifications.map((v, i) => (
                        <div
                          key={v.id || i}
                          className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {v.verifier?.fullName || 'Certified Officer'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(v.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="mt-1">{getStatusBadge(v.status)}</div>
                          {v.comments && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5">{v.comments}</p>
                          )}
                          {v.rejectionReason && (
                            <p className="text-[11px] text-rose-500 mt-1.5 font-medium">
                              Deficiency: {v.rejectionReason}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                        Pending statutory verification.
                      </div>
                    )}
                  </div>
                </div>

                {/* Versions */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Version History</h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">v{selectedDoc.version} (Active)</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{selectedDoc.originalName}</div>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(selectedDoc.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <a
                  href={documentService.downloadUrl(selectedDoc.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg"
                >
                  <Download className="w-4 h-4 mr-2" /> Download Authenticated File
                </a>

                {canVerify && selectedDoc.status !== 'VERIFIED' && (
                  <button
                    onClick={() => {
                      setActionDoc(selectedDoc);
                      setVerifyModalOpen(true);
                    }}
                    className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    Verify
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
