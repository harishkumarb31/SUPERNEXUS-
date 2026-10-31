import React from 'react';
import {
  User,
  Shield,
  Key,
  Mail,
  Building,
  Phone,
  Calendar,
  CheckCircle2,
  Lock,
  Layers,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const roleDescriptions: Record<string, string> = {
    [UserRole.SUPER_ADMIN]: 'Full system-wide administrative control, security auditing, and organization management.',
    [UserRole.ADMIN]: 'Operational workflow management, department oversight, and evaluator assignment.',
    [UserRole.DEPARTMENT_OFFICER]: 'Departmental scrutiny authority, document verification, and compliance monitoring.',
    [UserRole.EVALUATOR]: 'Field/desk inspection evaluation, checklist grading, and report recommendations.',
    [UserRole.FRESHER]: 'Supervised scrutiny verification, training coursework, and learning assignments.',
    [UserRole.VIEWER]: 'Statutory oversight, read-only status tracking, and public observer analytics.',
    [UserRole.INSTITUTION_USER]: 'Institutional principal / registrar for application filing and compliance evidence.',
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
          <User className="w-6 h-6 mr-2.5 text-indigo-600 dark:text-indigo-400" />
          Enterprise User Profile & Access Identity
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Cryptographically signed session details, role permissions, and organization affiliation
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 px-6 flex items-end pb-4">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 p-1 shadow-xl border-2 border-indigo-500 flex items-center justify-center text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {user?.fullName.charAt(0) || 'U'}
          </div>
        </div>

        <div className="p-6 pt-3 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {user?.fullName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.designation || 'Regulatory Officer'} • {user?.email}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {user?.role.replace(/_/g, ' ')}
              </span>
              <span className="flex items-center text-xs text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active Session
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Assigned Department / Bureau
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                <Building className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                {user?.departmentName || 'Central Regulatory Directorate'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Regional Jurisdiction
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                <Layers className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                {user?.region ? `${user.region} Regional Office` : 'National AICTE Headquarters (HQ)'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Security Identity ID
              </span>
              <p className="font-mono text-slate-600 dark:text-slate-400 truncate">
                {user?.id}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Affiliated Institution
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {user?.institutionName || 'AICTE Regulatory Governance Body'}
              </p>
            </div>
          </div>

          {/* Role Responsibilities Summary */}
          <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
            <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider flex items-center mb-1">
              <Shield className="w-3.5 h-3.5 mr-1.5 text-indigo-600 dark:text-indigo-400" />
              Role Authority Scope
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {roleDescriptions[user?.role || ''] || 'Standard role permissions granted by organizational policy.'}
            </p>
          </div>

          {/* Granted Permissions List */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Granted RBAC Permissions ({user?.permissions?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(user?.permissions || []).map((perm) => (
                <span
                  key={perm}
                  className="px-2 py-1 rounded-md text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {perm}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
