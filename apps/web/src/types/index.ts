export enum UserRole {
  // Enterprise Multi-Role Hierarchy
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  DEPARTMENT_OFFICER = 'DEPARTMENT_OFFICER',
  EVALUATOR = 'EVALUATOR',
  FRESHER = 'FRESHER',
  VIEWER = 'VIEWER',

  // Domain Roles (Interoperable)
  INSTITUTION_USER = 'INSTITUTION_USER',
  REGIONAL_OFFICER = 'REGIONAL_OFFICER',
  BUREAU_OFFICER = 'BUREAU_OFFICER',
  COMMITTEE_MEMBER = 'COMMITTEE_MEMBER',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
}

export enum ApplicationStage {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_SCRUTINY = 'UNDER_SCRUTINY',
  DEFICIENCY_RAISED = 'DEFICIENCY_RAISED',
  RETURNED_FOR_CORRECTION = 'RETURNED_FOR_CORRECTION',
  RESUBMITTED = 'RESUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  AWAITING_EVC = 'AWAITING_EVC',
  AWAITING_DECISION = 'AWAITING_DECISION',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CLOSED = 'CLOSED',
}

export enum ComplianceStatus {
  ACTIVE = 'ACTIVE',
  DUE_SOON = 'DUE_SOON',
  OVERDUE = 'OVERDUE',
  COMPLETED = 'COMPLETED',
}

export enum Permission {
  USER_VIEW = 'user.view',
  USER_CREATE = 'user.create',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',
  ROLE_MANAGE = 'role.manage',
  INSTITUTION_VIEW = 'institution.view',
  INSTITUTION_MANAGE = 'institution.manage',
  DEPARTMENT_VIEW = 'department.view',
  DEPARTMENT_MANAGE = 'department.manage',
  APPLICATION_VIEW = 'application.view',
  APPLICATION_CREATE = 'application.create',
  APPLICATION_UPDATE = 'application.update',
  APPLICATION_ASSIGN = 'application.assign',
  APPLICATION_REVIEW = 'application.review',
  APPLICATION_APPROVE = 'application.approve',
  DOCUMENT_VIEW = 'document.view',
  DOCUMENT_UPLOAD = 'document.upload',
  DOCUMENT_VERIFY = 'document.verify',
  DOCUMENT_REJECT = 'document.reject',
  DOCUMENT_DELETE = 'document.delete',
  DOCUMENT_REQUEST = 'document.request',
  DOCUMENT_REQUEST_MANAGE = 'document.request.manage',
  DOCUMENT_CATEGORY_MANAGE = 'document.category.manage',
  COMPLIANCE_VIEW = 'compliance.view',
  COMPLIANCE_MANAGE = 'compliance.manage',
  TASK_VIEW = 'task.view',
  TASK_MANAGE = 'task.manage',
  TASK_ASSIGN = 'task.assign',
  REPORTS_VIEW = 'reports.view',
  REPORTS_EXPORT = 'reports.export',
  AUDIT_VIEW = 'audit.view',
  SETTINGS_MANAGE = 'settings.manage',
}

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  designation?: string | null;
  region?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  institutionId?: string | null;
  institutionName?: string | null;
  institutionCode?: string | null;
  permissions?: Permission[];
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  _count?: { users: number };
  users?: Array<{ id: string; fullName: string; role: string; designation?: string | null }>;
}

export interface UserTask {
  id: string;
  title: string;
  description?: string | null;
  type: 'SCRUTINY' | 'VERIFICATION' | 'LEARNING' | 'EVALUATION' | 'COMPLIANCE';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  progress: number;
  dueDate?: string | null;
  assignedToId: string;
  assignedTo?: { id: string; fullName: string; email: string; role: string; designation?: string | null };
  assignedById?: string | null;
  assignedBy?: { id: string; fullName: string; email: string };
  applicationId?: string | null;
  application?: {
    id: string;
    applicationNumber: string;
    currentStage: string;
    institution?: { name: string; code: string };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Institution {
  id: string;
  code: string;
  name: string;
  type: string;
  region: string;
  state: string;
  city: string;
  address: string;
  pincode: string;
  contactEmail: string;
  contactPhone: string;
  establishedYear: number;
}

export interface DocumentCategory {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isDefault?: boolean;
  _count?: { documents: number; requests: number };
}

export interface DocumentVerification {
  id: string;
  documentId: string;
  verifierId: string;
  verifier?: { id: string; fullName: string; email: string; role: string };
  status: string;
  comments?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  checksumSha256: string;
  uploadedById?: string | null;
  uploadedBy?: { id: string; fullName: string };
  changeSummary?: string | null;
  createdAt: string;
}

export interface ApplicationDocument {
  id: string;
  applicationId?: string | null;
  application?: {
    id: string;
    applicationNumber: string;
    currentStage: string;
    institution?: { name: string; code: string };
  } | null;
  documentType: string;
  title?: string | null;
  description?: string | null;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  checksumSha256: string;
  version: number;
  uploadDate: string;
  expiryDate?: string | null;
  status: string; // UPLOADED, PENDING_VERIFICATION, UNDER_REVIEW, VERIFIED, REJECTED, REQUIRES_RESUBMISSION, PENDING_OCR, OCR_COMPLETED, FLAGGED
  rejectionReason?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  categoryId?: string | null;
  category?: DocumentCategory | null;
  departmentId?: string | null;
  department?: Department | null;
  uploaderId?: string | null;
  uploader?: { id: string; fullName: string; email: string; role?: string } | null;
  institutionId?: string | null;
  institution?: { id: string; name: string; code: string } | null;
  taskId?: string | null;
  task?: { id: string; title: string; status: string } | null;
  isRestricted?: boolean;
  verifications?: DocumentVerification[];
  versions?: DocumentVersion[];
  fulfilledRequests?: DocumentRequest[];
  extractions?: Array<{
    id: string;
    rawText: string;
    extractedFieldsJson?: string | null;
    confidenceScore: number;
    ocrEngine: string;
    processedAt: string;
  }>;
}

export interface DocumentRequest {
  id: string;
  requestNumber: string;
  title: string;
  categoryId?: string | null;
  category?: DocumentCategory | null;
  categoryName?: string | null;
  description?: string | null;
  reason: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  requiredByDate?: string | null;
  status:
    | 'SUBMITTED'
    | 'PENDING_ASSIGNMENT'
    | 'ASSIGNED'
    | 'IN_PROGRESS'
    | 'DOCUMENT_UPLOADED'
    | 'AVAILABLE_FOR_EMPLOYEE'
    | 'REJECTED'
    | 'CLOSED';
  requesterId: string;
  requester?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    designation?: string | null;
  };
  assignedToId?: string | null;
  assignedTo?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    designation?: string | null;
  } | null;
  departmentId?: string | null;
  department?: Department | null;
  applicationId?: string | null;
  application?: {
    id: string;
    applicationNumber: string;
    institution?: { name: string; code: string };
  } | null;
  taskId?: string | null;
  task?: { id: string; title: string; status: string } | null;
  fulfilledDocumentId?: string | null;
  fulfilledDocument?: ApplicationDocument | null;
  rejectionReason?: string | null;
  clarificationNotes?: string | null;
  assignments?: DocumentRequestAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRequestAssignment {
  id: string;
  requestId: string;
  assignedById?: string | null;
  assignedBy?: { id: string; fullName: string; email: string } | null;
  assignedToId: string;
  assignedTo: { id: string; fullName: string; email: string };
  notes?: string | null;
  timestamp: string;
}

export interface ValidationFinding {
  id: string;
  applicationId: string;
  documentId?: string | null;
  ruleCode: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'UNDER_REVIEW' | 'CONFIRMED' | 'DISMISSED' | 'RESOLVED';
  evidenceExcerpt?: string | null;
  detectedAt: string;
  resolvedByUser?: { fullName: string } | null;
  resolutionNotes?: string | null;
  resolutionDate?: string | null;
}

export interface ComplianceObligation {
  id: string;
  institutionId: string;
  applicationId?: string | null;
  obligationType: string;
  title: string;
  description: string;
  dueDate: string;
  warningDays: number;
  status: ComplianceStatus;
  evidenceDocumentId?: string | null;
  completedAt?: string | null;
  completionNotes?: string | null;
  institution?: {
    id: string;
    name: string;
    code: string;
    region: string;
  };
  application?: {
    id: string;
    applicationNumber: string;
    currentStage: string;
  };
}

export interface EVCActivity {
  id: string;
  applicationId: string;
  committeeType: string;
  scheduledDate: string;
  venueOrMode: string;
  status: string;
  chairmanName: string;
  membersJson: string;
  checklistJson?: string | null;
  observations?: string | null;
  recommendation?: string | null;
  completedAt?: string | null;
  application?: {
    id: string;
    applicationNumber: string;
    institution?: {
      name: string;
      code: string;
      city: string;
      state: string;
    };
  };
}

export interface ApplicationDetail {
  id: string;
  applicationNumber: string;
  academicYear: string;
  category: string;
  currentStage: ApplicationStage;
  priority: string;
  institutionId: string;
  institution: Institution;
  assignedOfficerId?: string | null;
  assignedOfficer?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    region?: string | null;
  } | null;
  submissionDate?: string | null;
  deadlineDate?: string | null;
  lastResubmissionDate?: string | null;
  programmesData?: string | null;
  infrastructureData?: string | null;
  facultyData?: string | null;
  financialData?: string | null;
  scrutinyRemarks?: string | null;
  createdAt: string;
  updatedAt: string;
  documents: ApplicationDocument[];
  findings: ValidationFinding[];
  complianceItems: ComplianceObligation[];
  evcActivities: EVCActivity[];
  stageHistory: Array<{
    id: string;
    fromStage: string;
    toStage: string;
    action: string;
    actorName?: string | null;
    actorRole?: string | null;
    reason?: string | null;
    timestamp: string;
  }>;
}

export interface NotificationItem {
  id: string;
  category: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

export interface AuditEventItem {
  id: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  beforeStateJson?: string | null;
  afterStateJson?: string | null;
  reason?: string | null;
  ipAddress?: string | null;
  timestamp: string;
  user?: {
    fullName: string;
    email: string;
    role: string;
  } | null;
}

