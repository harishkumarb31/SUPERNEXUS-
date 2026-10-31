// RegulaFlow AI Shared Domain Types & Enums
// Smart India Hackathon 2026 - Problem Statement: SIH26262

export enum UserRole {
  // Enterprise Multi-Role Hierarchy
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  DEPARTMENT_OFFICER = 'DEPARTMENT_OFFICER',
  EVALUATOR = 'EVALUATOR',
  FRESHER = 'FRESHER',
  VIEWER = 'VIEWER',

  // Domain Roles (Interoperable with Enterprise System)
  INSTITUTION_USER = 'INSTITUTION_USER',
  REGIONAL_OFFICER = 'REGIONAL_OFFICER',
  BUREAU_OFFICER = 'BUREAU_OFFICER',
  COMMITTEE_MEMBER = 'COMMITTEE_MEMBER',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN'
}

export enum Permission {
  // User & Identity
  USER_VIEW = 'user.view',
  USER_CREATE = 'user.create',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',
  ROLE_MANAGE = 'role.manage',

  // Institution & Department
  INSTITUTION_VIEW = 'institution.view',
  INSTITUTION_MANAGE = 'institution.manage',
  DEPARTMENT_VIEW = 'department.view',
  DEPARTMENT_MANAGE = 'department.manage',

  // Application & Workflow
  APPLICATION_VIEW = 'application.view',
  APPLICATION_CREATE = 'application.create',
  APPLICATION_UPDATE = 'application.update',
  APPLICATION_ASSIGN = 'application.assign',
  APPLICATION_REVIEW = 'application.review',
  APPLICATION_APPROVE = 'application.approve',

  // Documents
  DOCUMENT_VIEW = 'document.view',
  DOCUMENT_UPLOAD = 'document.upload',
  DOCUMENT_VERIFY = 'document.verify',
  DOCUMENT_REJECT = 'document.reject',
  DOCUMENT_DELETE = 'document.delete',
  DOCUMENT_REQUEST = 'document.request',
  DOCUMENT_REQUEST_MANAGE = 'document.request.manage',
  DOCUMENT_CATEGORY_MANAGE = 'document.category.manage',

  // Compliance
  COMPLIANCE_VIEW = 'compliance.view',
  COMPLIANCE_MANAGE = 'compliance.manage',

  // Task & Learning
  TASK_VIEW = 'task.view',
  TASK_MANAGE = 'task.manage',
  TASK_ASSIGN = 'task.assign',

  // Reports & Analytics
  REPORTS_VIEW = 'reports.view',
  REPORTS_EXPORT = 'reports.export',

  // Audit & Security
  AUDIT_VIEW = 'audit.view',
  SETTINGS_MANAGE = 'settings.manage'
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.SYSTEM_ADMIN]: Object.values(Permission),

  [UserRole.ADMIN]: [
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.INSTITUTION_VIEW,
    Permission.INSTITUTION_MANAGE,
    Permission.DEPARTMENT_VIEW,
    Permission.APPLICATION_VIEW,
    Permission.APPLICATION_ASSIGN,
    Permission.APPLICATION_REVIEW,
    Permission.APPLICATION_APPROVE,
    Permission.DOCUMENT_VIEW,
    Permission.DOCUMENT_UPLOAD,
    Permission.DOCUMENT_VERIFY,
    Permission.DOCUMENT_REJECT,
    Permission.DOCUMENT_DELETE,
    Permission.DOCUMENT_REQUEST,
    Permission.DOCUMENT_REQUEST_MANAGE,
    Permission.DOCUMENT_CATEGORY_MANAGE,
    Permission.COMPLIANCE_VIEW,
    Permission.COMPLIANCE_MANAGE,
    Permission.TASK_VIEW,
    Permission.TASK_MANAGE,
    Permission.TASK_ASSIGN,
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT,
    Permission.AUDIT_VIEW
  ],
  [UserRole.BUREAU_OFFICER]: [
    Permission.USER_VIEW,
    Permission.INSTITUTION_VIEW,
    Permission.INSTITUTION_MANAGE,
    Permission.DEPARTMENT_VIEW,
    Permission.APPLICATION_VIEW,
    Permission.APPLICATION_ASSIGN,
    Permission.APPLICATION_REVIEW,
    Permission.APPLICATION_APPROVE,
    Permission.DOCUMENT_VIEW,
    Permission.DOCUMENT_UPLOAD,
    Permission.DOCUMENT_VERIFY,
    Permission.DOCUMENT_REJECT,
    Permission.DOCUMENT_DELETE,
    Permission.DOCUMENT_REQUEST,
    Permission.DOCUMENT_REQUEST_MANAGE,
    Permission.DOCUMENT_CATEGORY_MANAGE,
    Permission.COMPLIANCE_VIEW,
    Permission.COMPLIANCE_MANAGE,
    Permission.TASK_VIEW,
    Permission.TASK_MANAGE,
    Permission.TASK_ASSIGN,
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT,
    Permission.AUDIT_VIEW
  ],

  [UserRole.DEPARTMENT_OFFICER]: [
    Permission.USER_VIEW,
    Permission.INSTITUTION_VIEW,
    Permission.DEPARTMENT_VIEW,
    Permission.APPLICATION_VIEW,
    Permission.APPLICATION_REVIEW,
    Permission.DOCUMENT_VIEW,
    Permission.DOCUMENT_UPLOAD,
    Permission.DOCUMENT_VERIFY,
    Permission.DOCUMENT_REJECT,
    Permission.DOCUMENT_REQUEST,
    Permission.DOCUMENT_REQUEST_MANAGE,
    Permission.DOCUMENT_CATEGORY_MANAGE,
    Permission.COMPLIANCE_VIEW,
    Permission.TASK_VIEW,
    Permission.TASK_MANAGE,
    Permission.REPORTS_VIEW,
    Permission.AUDIT_VIEW
  ],
  [UserRole.REGIONAL_OFFICER]: [
    Permission.USER_VIEW,
    Permission.INSTITUTION_VIEW,
    Permission.DEPARTMENT_VIEW,
    Permission.APPLICATION_VIEW,
    Permission.APPLICATION_REVIEW,
    Permission.DOCUMENT_VIEW,
    Permission.DOCUMENT_UPLOAD,
    Permission.DOCUMENT_VERIFY,
    Permission.DOCUMENT_REJECT,
    Permission.DOCUMENT_REQUEST,
    Permission.DOCUMENT_REQUEST_MANAGE,
    Permission.DOCUMENT_CATEGORY_MANAGE,
    Permission.COMPLIANCE_VIEW,
    Permission.TASK_VIEW,
    Permission.TASK_MANAGE,
    Permission.REPORTS_VIEW,
    Permission.AUDIT_VIEW
  ],

  [UserRole.EVALUATOR]: [
    Permission.APPLICATION_VIEW,
    Permission.APPLICATION_REVIEW,
    Permission.DOCUMENT_VIEW,
    Permission.DOCUMENT_UPLOAD,
    Permission.DOCUMENT_VERIFY,
    Permission.DOCUMENT_REQUEST,
    Permission.COMPLIANCE_VIEW,
    Permission.TASK_VIEW,
    Permission.TASK_MANAGE
  ],
  [UserRole.COMMITTEE_MEMBER]: [
    Permission.APPLICATION_VIEW,
    Permission.APPLICATION_REVIEW,
    Permission.DOCUMENT_VIEW,
    Permission.DOCUMENT_UPLOAD,
    Permission.DOCUMENT_VERIFY,
    Permission.DOCUMENT_REQUEST,
    Permission.COMPLIANCE_VIEW,
    Permission.TASK_VIEW,
    Permission.TASK_MANAGE
  ],

  [UserRole.FRESHER]: [
    Permission.APPLICATION_VIEW,
    Permission.DOCUMENT_VIEW,
    Permission.DOCUMENT_UPLOAD,
    Permission.DOCUMENT_REQUEST,
    Permission.TASK_VIEW,
    Permission.TASK_MANAGE
  ],

  [UserRole.VIEWER]: [
    Permission.APPLICATION_VIEW,
    Permission.DOCUMENT_VIEW,
    Permission.REPORTS_VIEW
  ],

  [UserRole.INSTITUTION_USER]: [
    Permission.APPLICATION_VIEW,
    Permission.APPLICATION_CREATE,
    Permission.APPLICATION_UPDATE,
    Permission.DOCUMENT_VIEW,
    Permission.DOCUMENT_UPLOAD,
    Permission.COMPLIANCE_VIEW,
    Permission.COMPLIANCE_MANAGE
  ]
};

export function hasPermission(role: UserRole | string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role as UserRole];
  if (!perms) return false;
  return perms.includes(permission);
}

export function getCanonicalRole(role: UserRole | string): UserRole {
  switch (role) {
    case 'SYSTEM_ADMIN':
      return UserRole.SUPER_ADMIN;
    case 'BUREAU_OFFICER':
      return UserRole.ADMIN;
    case 'REGIONAL_OFFICER':
      return UserRole.DEPARTMENT_OFFICER;
    case 'COMMITTEE_MEMBER':
      return UserRole.EVALUATOR;
    default:
      return role as UserRole;
  }
}

export enum Region {
  NORTHERN = 'NORTHERN',
  WESTERN = 'WESTERN',
  SOUTHERN = 'SOUTHERN',
  EASTERN = 'EASTERN',
  CENTRAL = 'CENTRAL',
  SOUTH_WESTERN = 'SOUTH_WESTERN'
}

export enum InstitutionType {
  ENGINEERING_TECH = 'ENGINEERING_TECH',
  MANAGEMENT = 'MANAGEMENT',
  PHARMACY = 'PHARMACY',
  POLYTECHNIC = 'POLYTECHNIC',
  ARCHITECTURE_PLANNING = 'ARCHITECTURE_PLANNING',
  APPLIED_ARTS_CRAFTS = 'APPLIED_ARTS_CRAFTS'
}

export enum ApplicationCategory {
  EXTENSION_OF_APPROVAL = 'EXTENSION_OF_APPROVAL',
  NEW_INSTITUTION = 'NEW_INSTITUTION',
  INCREASE_IN_INTAKE = 'INCREASE_IN_INTAKE',
  NEW_PROGRAMME_DIVISION = 'NEW_PROGRAMME_DIVISION',
  CLOSURE_OF_PROGRAMME = 'CLOSURE_OF_PROGRAMME',
  COLLABORATION_TWINNING = 'COLLABORATION_TWINNING'
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
  CLOSED = 'CLOSED'
}

export enum ApplicationPriority {
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum DocumentType {
  LAND_TITLE_LEASE_DEED = 'LAND_TITLE_LEASE_DEED',
  OCCUPANCY_CERTIFICATE = 'OCCUPANCY_CERTIFICATE',
  FIRE_SAFETY_NOC = 'FIRE_SAFETY_NOC',
  BUILDING_PLAN_SANCTION = 'BUILDING_PLAN_SANCTION',
  AICTE_UNDERTAKING_AFFIDAVIT = 'AICTE_UNDERTAKING_AFFIDAVIT',
  AUDITED_BALANCE_SHEET = 'AUDITED_BALANCE_SHEET',
  FACULTY_STAFF_DECLARATION = 'FACULTY_STAFF_DECLARATION',
  BAR_COUNCIL_PCI_COA_APPROVAL = 'BAR_COUNCIL_PCI_COA_APPROVAL'
}

export enum DocumentStatus {
  UPLOADED = 'UPLOADED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  REQUIRES_RESUBMISSION = 'REQUIRES_RESUBMISSION',
  // Compatibility
  PENDING_OCR = 'PENDING_OCR',
  OCR_COMPLETED = 'OCR_COMPLETED',
  FLAGGED = 'FLAGGED'
}

export enum DocumentRequestStatus {
  SUBMITTED = 'SUBMITTED',
  PENDING_ASSIGNMENT = 'PENDING_ASSIGNMENT',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  AVAILABLE_FOR_EMPLOYEE = 'AVAILABLE_FOR_EMPLOYEE',
  REJECTED = 'REJECTED',
  CLOSED = 'CLOSED'
}

export enum DocumentRequestPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum FindingSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum FindingStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  CONFIRMED = 'CONFIRMED',
  DISMISSED = 'DISMISSED',
  RESOLVED = 'RESOLVED'
}

export enum ObligationType {
  LEASE_VALIDITY = 'LEASE_VALIDITY',
  AFFIDAVIT_UNDERTAKING = 'AFFIDAVIT_UNDERTAKING',
  ENDOWMENT_FUND_DEPOSIT = 'ENDOWMENT_FUND_DEPOSIT',
  FIRE_SAFETY_RENEWAL = 'FIRE_SAFETY_RENEWAL',
  NBA_ACCREDITATION_COMPLIANCE = 'NBA_ACCREDITATION_COMPLIANCE',
  BARRIER_FREE_ENVIRONMENT_PWD = 'BARRIER_FREE_ENVIRONMENT_PWD'
}

export enum ComplianceStatus {
  ACTIVE = 'ACTIVE',
  DUE_SOON = 'DUE_SOON',
  OVERDUE = 'OVERDUE',
  COMPLETED = 'COMPLETED'
}

export enum CommitteeType {
  EXPERT_VISITING_COMMITTEE = 'EXPERT_VISITING_COMMITTEE',
  SCRUTINY_COMMITTEE = 'SCRUTINY_COMMITTEE',
  STANDING_COMPLAINTS_COMMITTEE = 'STANDING_COMPLAINTS_COMMITTEE',
  APPELLATE_COMMITTEE = 'APPELLATE_COMMITTEE'
}

export enum EVCStatus {
  PROPOSED = 'PROPOSED',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  RESCHEDULED = 'RESCHEDULED',
  CANCELLED = 'CANCELLED'
}

export enum EVCRecommendation {
  RECOMMENDED_APPROVAL = 'RECOMMENDED_APPROVAL',
  DEFICIENCY_NOTED = 'DEFICIENCY_NOTED',
  RECOMMENDED_REJECTION = 'RECOMMENDED_REJECTION',
  REQUIRES_SECOND_INSPECTION = 'REQUIRES_SECOND_INSPECTION'
}

export enum NotificationCategory {
  APPLICATION_STATUS = 'APPLICATION_STATUS',
  DEFICIENCY_ALERT = 'DEFICIENCY_ALERT',
  COMPLIANCE_REMINDER = 'COMPLIANCE_REMINDER',
  EVC_UPDATE = 'EVC_UPDATE',
  ESCALATION = 'ESCALATION',
  SYSTEM = 'SYSTEM'
}

export enum NotificationSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  APPLICATION_CREATE = 'APPLICATION_CREATE',
  APPLICATION_UPDATE = 'APPLICATION_UPDATE',
  APPLICATION_SUBMIT = 'APPLICATION_SUBMIT',
  STAGE_TRANSITION = 'STAGE_TRANSITION',
  OFFICER_ASSIGNMENT = 'OFFICER_ASSIGNMENT',
  DOCUMENT_UPLOAD = 'DOCUMENT_UPLOAD',
  DOCUMENT_VERIFY = 'DOCUMENT_VERIFY',
  OCR_EXECUTE = 'OCR_EXECUTE',
  DEFICIENCY_FLAGGED = 'DEFICIENCY_FLAGGED',
  DEFICIENCY_RESOLVED = 'DEFICIENCY_RESOLVED',
  COMPLIANCE_CREATE = 'COMPLIANCE_CREATE',
  COMPLIANCE_RESOLVE = 'COMPLIANCE_RESOLVE',
  EVC_SCHEDULED = 'EVC_SCHEDULED',
  EVC_COMPLETED = 'EVC_COMPLETED',
  ESCALATION_TRIGGERED = 'ESCALATION_TRIGGERED',
  CONFIG_UPDATE = 'CONFIG_UPDATE',
  REPORT_EXPORT = 'REPORT_EXPORT'
}

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  region?: Region | null;
  institutionId?: string | null;
  institutionName?: string | null;
}

export interface AuthResponse {
  user: UserSummary;
  token: string;
}

export interface StageTransitionPayload {
  toStage: ApplicationStage;
  reason?: string;
  comments?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

