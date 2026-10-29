export enum UserRole {
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

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  region?: string | null;
  institutionId?: string | null;
  institutionName?: string | null;
  institutionCode?: string | null;
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

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  documentType: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  checksumSha256: string;
  version: number;
  uploadDate: string;
  expiryDate?: string | null;
  status: string;
  verifiedBy?: string | null;
  extractions?: Array<{
    id: string;
    rawText: string;
    extractedFieldsJson?: string | null;
    confidenceScore: number;
    ocrEngine: string;
    processedAt: string;
  }>;
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
