# SuperNexus AI — Technical RBAC Implementation Report

## 1. System Architecture Overview

The SuperNexus AI Role-Based Access Control (RBAC) architecture provides a comprehensive, defense-in-depth security model across all tiers of the application:
1. **Shared Domain Layer (`@regulaflow/shared`)**: Canonical role enums, 24 fine-grained permission codes, static role-to-permission mapping, and canonical role resolution.
2. **Database Persistence Layer (`Prisma ORM`)**: SQLite & PostgreSQL synchrony with relational models for `Department`, `User`, `UserTask`, and `AuditLog`.
3. **API & Middleware Layer (`@regulaflow/api`)**: JWT authentication, role aliasing normalization, `requireRole()`, and `requirePermission()` guards.
4. **Client-Side Presentation Layer (`@regulaflow/web`)**: Dynamic role-based navigation trees, collapsible sidebar, reactive layout context, tab-level permissions, and role switcher.

---

## 2. Core RBAC Engine (`@regulaflow/shared`)

### 2.1. Permission Definitions
The platform standardizes on 24 granular permissions categorized across system domains:

* **Applications**: `APPLICATION_VIEW_ALL`, `APPLICATION_VIEW_ASSIGNED`, `APPLICATION_CREATE`, `APPLICATION_EDIT`, `APPLICATION_ASSIGN`, `APPLICATION_TRANSITION`
* **Documents & OCR**: `DOCUMENT_VIEW`, `DOCUMENT_UPLOAD`, `DOCUMENT_VERIFY`, `DOCUMENT_DELETE`
* **Compliance & Validation**: `COMPLIANCE_VIEW`, `COMPLIANCE_EVALUATE`, `COMPLIANCE_RESOLVE`, `FINDING_RESOLVE`
* **Committee & EVC**: `COMMITTEE_VIEW`, `COMMITTEE_ASSIGN`, `EVC_CONDUCT`
* **Task Management**: `TASK_VIEW_OWN`, `TASK_VIEW_ALL`, `TASK_MANAGE`
* **Administration & Security**: `USER_MANAGE`, `DEPARTMENT_MANAGE`, `AUDIT_VIEW`, `SETTINGS_MANAGE`

### 2.2. Deterministic Permission Check Helper
```typescript
export function hasPermission(role: UserRole | string, permission: Permission): boolean {
  const canonical = getCanonicalRole(role);
  const permissions = ROLE_PERMISSIONS[canonical];
  return Array.isArray(permissions) && permissions.includes(permission);
}
```

---

## 3. Database Schema Extensions

### 3.1. `Department` Entity
```prisma
model Department {
  id          String   @id @default(uuid())
  name        String
  code        String   @unique // e.g., DEPT_SCRUTINY, DEPT_LEGAL, DEPT_EVC, DEPT_QUALITY
  description String?
  users       User[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 3.2. `UserTask` Entity
```prisma
model UserTask {
  id            String       @id @default(uuid())
  title         String
  description   String?
  type          String       @default("SCRUTINY") // SCRUTINY, VERIFICATION, COMPLIANCE, EVC_PREP, LEARNING
  status        String       @default("PENDING")  // PENDING, IN_PROGRESS, UNDER_REVIEW, COMPLETED, BLOCKED
  priority      String       @default("MEDIUM")   // LOW, MEDIUM, HIGH, URGENT
  progress      Int          @default(0)          // 0 to 100
  dueDate       DateTime?
  assignedToId  String
  assignedTo    User         @relation("AssignedTasks", fields: [assignedToId], references: [id])
  assignedById  String?
  assignedBy    User?        @relation("CreatedTasks", fields: [assignedById], references: [id])
  applicationId String?
  application   Application? @relation(fields: [applicationId], references: [id])
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}
```

### 3.3. Extended `User` and `Application` Relationships
- `User` now maintains relations to `department`, `assignedTasks`, and `createdTasks`.
- `Application` maintains relations to associated workflow tasks.

---

## 4. API Security & Enforcement Middleware

### 4.1. Token & Identity Extraction
`apps/api/src/middleware/auth.ts` verifies incoming JWT tokens and injects the authenticated identity:
```typescript
export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
  institutionId?: string;
  departmentId?: string;
  designation?: string;
  department?: { id: string; name: string; code: string };
  permissions?: Permission[];
}
```

### 4.2. Granular Permission Guard (`requirePermission`)
```typescript
export function requirePermission(...required: Permission[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const hasAll = required.every(p => hasPermission(req.user!.role, p));
    if (!hasAll) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions',
        required,
        role: req.user.role,
      });
      return;
    }
    next();
  };
}
```

### 4.3. Protected Endpoints Summary
* `/api/v1/tasks` (POST) — Protected by `requirePermission(Permission.TASK_MANAGE)`
* `/api/v1/admin/security-stats` (GET) — Protected by `requirePermission(Permission.AUDIT_VIEW)`
* `/api/v1/admin/departments` (GET) — Protected by `requirePermission(Permission.DEPARTMENT_MANAGE)`
* `/api/v1/ocr/:id/fields` (PUT) — Protected by `requirePermission(Permission.DOCUMENT_VERIFY)`
* `/api/v1/validation/findings/:id/resolve` (PUT) — Protected by `requirePermission(Permission.FINDING_RESOLVE)`
* `/api/v1/evc/:id/submit-report` (POST) — Protected by `requirePermission(Permission.EVC_CONDUCT)`

---

## 5. Frontend Dynamic Workspace Integration

1. **Collapsible Sidebar**: Implemented in `apps/web/src/layouts/AppLayout.tsx` supporting collapsed (icon-only with tooltips) and expanded states.
2. **Dynamic Navigation Filtering**: Renders tailored navigation trees per role with expandable nested submenus.
3. **Role Switcher Modal**: Persistent quick switcher in header allowing instantaneous role toggling for testing and demo purposes.
4. **Role Dashboards**: Role-specific hero banners, task worklists, and metric telemetry in `DashboardPage.tsx`.
5. **Specialized Workspaces**:
   - `TasksPage.tsx`: Interactive assignment board with filters, status advancement, and assignment modals.
   - `LearningWorkspacePage.tsx`: Dedicated module walkthrough and handbook center for Junior Evaluators / Freshers.
   - `AdminPage.tsx`: Unified administrative command center with tabbed sections for Users, Departments, Institutions, Roles Matrix, and Security Intel.
