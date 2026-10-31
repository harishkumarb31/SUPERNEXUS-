import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FileCheck2,
  CalendarCheck2,
  ShieldAlert,
  Bot,
  BarChart3,
  History,
  Settings,
  Bell,
  Sun,
  Moon,
  Search,
  LogOut,
  ChevronDown,
  ChevronRight,
  Building,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  ExternalLink,
  CheckSquare,
  GraduationCap,
  Eye,
  Layers,
  Award,
  Users,
  Key,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { CommandPalette } from '../components/CommandPalette';
import { notificationService } from '../services/api';

interface NavGroup {
  title?: string;
  items: NavItem[];
}

interface NavItem {
  name: string;
  path: string;
  icon: any;
  badge?: string;
  children?: { name: string; path: string }[];
}

export const AppLayout: React.FC = () => {
  const { user, logout, switchDemoRole, theme, toggleTheme } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('supernexus_sidebar_collapsed') === 'true';
  });
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Organization: true,
    Applications: false,
    ApprovalWorkflow: false,
    'Document Management': true,
  });

  const toggleSidebarCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('supernexus_sidebar_collapsed', String(next));
      return next;
    });
  };

  const toggleGroupExpand = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationService.list();
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      } catch (e) {
        // ignore
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.read) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (e) {
        console.error('Failed to mark notification as read:', e);
      }
    }
    if (notif.link) navigate(notif.link);
    setNotifMenuOpen(false);
  };

  // Role Labels mapping for display & 1-click demo switcher
  const roleLabels: Record<string, { label: string; badge: string; color: string }> = {
    [UserRole.SUPER_ADMIN]: { label: 'Super Administrator', badge: 'Super Admin', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    [UserRole.ADMIN]: { label: 'Administrator', badge: 'Admin', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    [UserRole.DEPARTMENT_OFFICER]: { label: 'HR / Dept Officer', badge: 'Dept Officer', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    [UserRole.EVALUATOR]: { label: 'Employee / Evaluator', badge: 'Evaluator', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    [UserRole.FRESHER]: { label: 'Fresher / Junior Trainee', badge: 'Fresher', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    [UserRole.VIEWER]: { label: 'Viewer (Read-Only)', badge: 'Viewer', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
    [UserRole.INSTITUTION_USER]: { label: 'Institution Principal', badge: 'Principal', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
    // Domain Compatibility mappings
    [UserRole.REGIONAL_OFFICER]: { label: 'Regional Officer (North)', badge: 'Regional', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    [UserRole.BUREAU_OFFICER]: { label: 'Bureau Officer (HQ)', badge: 'Bureau Chief', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    [UserRole.COMMITTEE_MEMBER]: { label: 'EVC Committee Expert', badge: 'EVC Chairman', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    [UserRole.SYSTEM_ADMIN]: { label: 'System Administrator', badge: 'Sys Admin', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  };

  // Generate Navigation Structure based on Authenticated Role
  const getNavGroups = (): NavGroup[] => {
    const role = user?.role;

    // 1. Super Admin & System Admin
    if (role === UserRole.SUPER_ADMIN || role === UserRole.SYSTEM_ADMIN) {
      return [
        {
          items: [{ name: 'Overview', path: '/dashboard', icon: LayoutDashboard }],
        },
        {
          title: 'Organization',
          items: [
            {
              name: 'Organization Studio',
              path: '/admin',
              icon: Building,
              children: [
                { name: 'Institutions Directory', path: '/admin?tab=institutions' },
                { name: 'Departments & Units', path: '/admin?tab=departments' },
                { name: 'User Management', path: '/admin?tab=users' },
                { name: 'Roles & Permissions', path: '/admin?tab=roles' },
              ],
            },
          ],
        },
        {
          title: 'Regulatory Lifecycle',
          items: [
            {
              name: 'Applications',
              path: '/applications',
              icon: FileText,
              children: [
                { name: 'All Applications', path: '/applications' },
                { name: 'Under Scrutiny', path: '/applications?stage=UNDER_SCRUTINY' },
                { name: 'Approval Decisions', path: '/applications?stage=AWAITING_DECISION' },
              ],
            },
            {
              name: 'Document Management',
              path: '/documents',
              icon: FileCheck2,
              children: [
                { name: 'Document Overview', path: '/documents?tab=overview' },
                { name: 'Upload Documents', path: '/documents?tab=upload' },
                { name: 'Document Repository', path: '/documents?tab=repository' },
                { name: 'Verification Queue', path: '/documents?tab=verification' },
                { name: 'Verified Documents', path: '/documents?tab=verified' },
                { name: 'Rejected Documents', path: '/documents?tab=rejected' },
                { name: 'Document Requests', path: '/documents?tab=requests' },
                { name: 'Pending Requests', path: '/documents?tab=pending-requests' },
                { name: 'Document Categories', path: '/documents?tab=categories' },
                { name: 'OCR & AI Scrutiny', path: '/documents?tab=ocr-intelligence' },
              ],
            },
            { name: 'Compliance Monitor', path: '/compliance', icon: ShieldAlert },
            { name: 'EVC Committees', path: '/evc', icon: CalendarCheck2 },
            { name: 'Task Assignments', path: '/tasks', icon: CheckSquare },
          ],
        },
        {
          title: 'Intelligence & Audit',
          items: [
            { name: 'Regulatory AI Assistant', path: '/assistant', icon: Bot },
            { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
            { name: 'Security & Audit Logs', path: '/admin?tab=security', icon: Shield },
            { name: 'Immutable Audit Trail', path: '/audit', icon: History },
            { name: 'System Settings', path: '/admin?tab=health', icon: Settings },
          ],
        },
      ];
    }

    // 2. Administrator & Bureau Officer
    if (role === UserRole.ADMIN || role === UserRole.BUREAU_OFFICER) {
      return [
        {
          items: [{ name: 'Executive Overview', path: '/dashboard', icon: LayoutDashboard }],
        },
        {
          title: 'Operations',
          items: [
            {
              name: 'Organization',
              path: '/admin',
              icon: Building,
              children: [
                { name: 'Institutions', path: '/admin?tab=institutions' },
                { name: 'Departments', path: '/admin?tab=departments' },
                { name: 'Users Directory', path: '/admin?tab=users' },
              ],
            },
            { name: 'Applications Registry', path: '/applications', icon: FileText },
            {
              name: 'Document Management',
              path: '/documents',
              icon: FileCheck2,
              children: [
                { name: 'Document Overview', path: '/documents?tab=overview' },
                { name: 'Upload Documents', path: '/documents?tab=upload' },
                { name: 'Document Repository', path: '/documents?tab=repository' },
                { name: 'Verification Queue', path: '/documents?tab=verification' },
                { name: 'Verified Documents', path: '/documents?tab=verified' },
                { name: 'Rejected Documents', path: '/documents?tab=rejected' },
                { name: 'Document Requests', path: '/documents?tab=requests' },
                { name: 'Pending Requests', path: '/documents?tab=pending-requests' },
                { name: 'Document Categories', path: '/documents?tab=categories' },
                { name: 'OCR & AI Scrutiny', path: '/documents?tab=ocr-intelligence' },
              ],
            },
            { name: 'Compliance Center', path: '/compliance', icon: ShieldAlert },
            { name: 'EVC Inspections', path: '/evc', icon: CalendarCheck2 },
            { name: 'Assigned Tasks', path: '/tasks', icon: CheckSquare },
          ],
        },
        {
          title: 'Intelligence & Reports',
          items: [
            { name: 'AI Regulatory Assistant', path: '/assistant', icon: Bot },
            { name: 'Operational Reports', path: '/reports', icon: BarChart3 },
            { name: 'Audit Trail', path: '/audit', icon: History },
          ],
        },
      ];
    }

    // 3. HR / Department Officer & Regional Officer
    if (role === UserRole.DEPARTMENT_OFFICER || role === UserRole.REGIONAL_OFFICER) {
      return [
        {
          items: [{ name: 'Department Dashboard', path: '/dashboard', icon: LayoutDashboard }],
        },
        {
          title: 'Scrutiny & Tasks',
          items: [
            { name: 'Applications Queue', path: '/applications', icon: FileText },
            {
              name: 'Document Management',
              path: '/documents',
              icon: FileCheck2,
              children: [
                { name: 'Document Dashboard', path: '/documents?tab=overview' },
                { name: 'Upload Documents', path: '/documents?tab=upload' },
                { name: 'Document Repository', path: '/documents?tab=repository' },
                { name: 'Verification Queue', path: '/documents?tab=verification' },
                { name: 'Verified Documents', path: '/documents?tab=verified' },
                { name: 'Rejected Documents', path: '/documents?tab=rejected' },
                { name: 'Employee Document Requests', path: '/documents?tab=requests' },
                { name: 'Document Categories', path: '/documents?tab=categories' },
                { name: 'OCR & AI Scrutiny', path: '/documents?tab=ocr-intelligence' },
              ],
            },
            { name: 'Compliance Checklist', path: '/compliance', icon: ShieldAlert },
            { name: 'Department Tasks', path: '/tasks', icon: CheckSquare },
            { name: 'EVC Committee Reviews', path: '/evc', icon: CalendarCheck2 },
          ],
        },
        {
          title: 'Analytics & Tools',
          items: [
            { name: 'Regulatory Assistant', path: '/assistant', icon: Bot },
            { name: 'Regional Reports', path: '/reports', icon: BarChart3 },
            { name: 'My Activity Logs', path: '/audit', icon: History },
            { name: 'My Profile', path: '/profile', icon: User },
          ],
        },
      ];
    }

    // 4. Employee / Evaluator & Committee Member
    if (role === UserRole.EVALUATOR || role === UserRole.COMMITTEE_MEMBER) {
      return [
        {
          items: [{ name: 'Evaluator Dashboard', path: '/dashboard', icon: LayoutDashboard }],
        },
        {
          title: 'Assigned Workload',
          items: [
            { name: 'My Assigned Cases', path: '/applications?assigned=me', icon: FileText },
            {
              name: 'Document Management',
              path: '/documents',
              icon: FileCheck2,
              children: [
                { name: 'My Documents', path: '/documents?tab=my-docs' },
                { name: 'Upload Documents', path: '/documents?tab=upload' },
                { name: 'Verified Documents', path: '/documents?tab=verified' },
                { name: 'Pending Verification', path: '/documents?tab=verification' },
                { name: 'Rejected Documents', path: '/documents?tab=rejected' },
                { name: 'Request a Document', path: '/documents?tab=request-new' },
                { name: 'My Document Requests', path: '/documents?tab=my-requests' },
                { name: 'Document Repository', path: '/documents?tab=repository' },
              ],
            },
            { name: 'EVC Inspections & Scoring', path: '/evc', icon: CalendarCheck2 },
            { name: 'Compliance Checklist', path: '/compliance', icon: ShieldAlert },
            { name: 'My Tasks Queue', path: '/tasks', icon: CheckSquare },
          ],
        },
        {
          title: 'Reference & Personal',
          items: [
            { name: 'Regulatory Handbook AI', path: '/assistant', icon: Bot },
            { name: 'My Activity', path: '/audit', icon: History },
            { name: 'Profile Settings', path: '/profile', icon: User },
          ],
        },
      ];
    }

    // 5. Fresher / Junior Evaluator
    if (role === UserRole.FRESHER) {
      return [
        {
          items: [{ name: 'Fresher Dashboard', path: '/dashboard', icon: LayoutDashboard }],
        },
        {
          title: 'Learning & Tasks',
          items: [
            { name: 'Learning Workspace', path: '/learning', icon: GraduationCap },
            { name: 'Assigned Practice Tasks', path: '/tasks', icon: CheckSquare },
            {
              name: 'Document Management',
              path: '/documents',
              icon: FileCheck2,
              children: [
                { name: 'My Documents', path: '/documents?tab=my-docs' },
                { name: 'Upload Documents', path: '/documents?tab=upload' },
                { name: 'Verification Status', path: '/documents?tab=verification' },
                { name: 'Request a Document', path: '/documents?tab=request-new' },
                { name: 'My Requests', path: '/documents?tab=my-requests' },
                { name: 'Authorized Documents', path: '/documents?tab=repository' },
              ],
            },
            { name: 'Verification Guidelines', path: '/assistant', icon: BookOpen },
          ],
        },
        {
          title: 'Personal',
          items: [
            { name: 'Notifications', path: '/notifications', icon: Bell },
            { name: 'My Activity Record', path: '/audit', icon: History },
            { name: 'My Profile', path: '/profile', icon: User },
          ],
        },
      ];
    }

    // 6. Viewer (Read-Only)
    if (role === UserRole.VIEWER) {
      return [
        {
          items: [{ name: 'Transparency Overview', path: '/dashboard', icon: LayoutDashboard }],
        },
        {
          title: 'Oversight',
          items: [
            { name: 'Application Tracking', path: '/applications', icon: FileText },
            {
              name: 'Document Management',
              path: '/documents',
              icon: FileCheck2,
              children: [
                { name: 'Authorized Documents', path: '/documents?tab=repository' },
                { name: 'Verified Documents', path: '/documents?tab=verified' },
                { name: 'Document Overview', path: '/documents?tab=overview' },
              ],
            },
            { name: 'Authorized Reports', path: '/reports', icon: BarChart3 },
            { name: 'Regulatory Assistant', path: '/assistant', icon: Bot },
          ],
        },
        {
          title: 'Personal',
          items: [
            { name: 'Notifications', path: '/notifications', icon: Bell },
            { name: 'My Profile', path: '/profile', icon: User },
          ],
        },
      ];
    }

    // 7. Institution User (Applicant)
    return [
      {
        items: [{ name: 'Institution Dashboard', path: '/dashboard', icon: LayoutDashboard }],
      },
      {
        title: 'Application & Compliance',
        items: [
          { name: 'My Approval Applications', path: '/applications', icon: FileText },
          {
            name: 'Document Management',
            path: '/documents',
            icon: FileCheck2,
            children: [
              { name: 'Document Vault', path: '/documents?tab=repository' },
              { name: 'Upload Documents', path: '/documents?tab=upload' },
              { name: 'My Documents', path: '/documents?tab=my-docs' },
            ],
          },
          { name: 'Compliance Covenants', path: '/compliance', icon: ShieldAlert },
          { name: 'AI Regulatory Assistant', path: '/assistant', icon: Bot },
        ],
      },
      {
        title: 'Account',
        items: [
          { name: 'Notifications', path: '/notifications', icon: Bell },
          { name: 'My Activity Logs', path: '/audit', icon: History },
          { name: 'Institutional Profile', path: '/profile', icon: User },
        ],
      },
    ];
  };

  const navGroups = getNavGroups();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />

      {/* Top Banner Notice for Evaluation */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-slate-300 px-4 py-1.5 text-xs flex justify-between items-center border-b border-indigo-900/50">
        <div className="flex items-center space-x-2">
          <span className="font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] tracking-wide uppercase border border-indigo-500/30">
            SuperNexus AI • SIH26262
          </span>
          <span className="hidden sm:inline">
            Enterprise Multi-Role Organization Portal & AICTE Approval Workflow Automation
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="text-slate-400">
            Active Role: <strong className="text-indigo-300">{user?.role}</strong>
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out lg:static ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64 border-r border-slate-800`}
        >
          {/* Logo Brand Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
                <Building className="w-5 h-5 text-white" />
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <span className="font-bold text-base text-white tracking-tight flex items-center">
                    SuperNexus <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300">AI</span>
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium truncate">
                    {user?.departmentName || 'Enterprise Operations'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={toggleSidebarCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Groups */}
          <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {group.title && !isCollapsed && (
                  <h4 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {group.title}
                  </h4>
                )}
                {group.title && isCollapsed && (
                  <div className="border-t border-slate-800/80 my-2 mx-1"></div>
                )}

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedGroups[item.name];

                  if (hasChildren && !isCollapsed) {
                    return (
                      <div key={item.name} className="space-y-1">
                        <button
                          onClick={() => toggleGroupExpand(item.name)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
                        >
                          <div className="flex items-center">
                            <Icon className="w-4 h-4 mr-3 shrink-0 text-indigo-400" />
                            <span>{item.name}</span>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="pl-9 space-y-1">
                            {item.children!.map((child) => {
                              const isChildActive = child.path.includes('?')
                                ? (location.pathname + location.search) === child.path
                                : location.pathname === child.path && !location.search;

                              return (
                                <NavLink
                                  key={child.path}
                                  to={child.path}
                                  onClick={() => setSidebarOpen(false)}
                                  className={`block px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                                    isChildActive
                                      ? 'bg-indigo-600/30 text-indigo-300 font-semibold border-l-2 border-indigo-500'
                                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                  }`}
                                >
                                  {child.name}
                                </NavLink>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      title={isCollapsed ? item.name : undefined}
                      className={({ isActive }) =>
                        `flex items-center ${
                          isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2'
                        } rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Icon className={`w-4 h-4 ${isCollapsed ? '' : 'mr-3'} shrink-0`} />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User Profile & Role Indicator Card */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
            <div
              onClick={() => navigate('/profile')}
              className={`flex items-center ${
                isCollapsed ? 'justify-center' : 'space-x-3'
              } p-2 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer`}
              title="View Profile & Credentials"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30 shrink-0">
                {user?.fullName.charAt(0) || 'U'}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {user?.role && (roleLabels[user.role]?.badge || user.role)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          ></div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Navigation Bar */}
          <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Global Search Button */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center space-x-2 px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors w-48 sm:w-72 justify-between border border-slate-200 dark:border-slate-700"
              >
                <span className="flex items-center truncate">
                  <Search className="w-3.5 h-3.5 mr-2 text-slate-400" />
                  Search applications, rules, tasks...
                </span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded">
                  Ctrl+K
                </kbd>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              {/* Enterprise Role Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-subtle"
                >
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden md:inline text-slate-400">Switch Role:</span>
                  <span className="font-bold truncate max-w-[140px]">
                    {user?.role ? roleLabels[user.role]?.badge || user.role : 'Switch Role'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                    <div className="p-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Enterprise Role Profiles
                      </p>
                      {[
                        UserRole.SUPER_ADMIN,
                        UserRole.ADMIN,
                        UserRole.DEPARTMENT_OFFICER,
                        UserRole.EVALUATOR,
                        UserRole.FRESHER,
                        UserRole.VIEWER,
                        UserRole.INSTITUTION_USER,
                      ].map((rKey) => (
                        <button
                          key={rKey}
                          onClick={() => {
                            switchDemoRole(rKey);
                            setRoleMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            user?.role === rKey
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{roleLabels[rKey]?.label}</div>
                            <div className="text-[10px] text-slate-400">{rKey}</div>
                          </div>
                          {user?.role === rKey && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                        </button>
                      ))}
                    </div>

                    <div className="p-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        AICTE Domain Roles
                      </p>
                      {[
                        UserRole.REGIONAL_OFFICER,
                        UserRole.BUREAU_OFFICER,
                        UserRole.COMMITTEE_MEMBER,
                        UserRole.SYSTEM_ADMIN,
                      ].map((rKey) => (
                        <button
                          key={rKey}
                          onClick={() => {
                            switchDemoRole(rKey);
                            setRoleMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            user?.role === rKey
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="truncate">{roleLabels[rKey]?.label}</span>
                          {user?.role === rKey && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Toggle Dark / Light Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Notification Center Popover */}
              <div className="relative">
                <button
                  onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Statutory Alerts & Notifications ({unreadCount} unread)
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                          No notifications at this time
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                              !notif.read ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                            }`}
                            onClick={() => handleNotificationClick(notif)}
                          >
                            <div className="flex items-start justify-between">
                              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {notif.title}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                              {notif.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center">
                      <button
                        onClick={() => {
                          setNotifMenuOpen(false);
                          navigate('/notifications');
                        }}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Open Notification Center →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Main Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
