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
  Building,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { CommandPalette } from '../components/CommandPalette';
import { notificationService } from '../services/api';

export const AppLayout: React.FC = () => {
  const { user, logout, switchDemoRole, theme, toggleTheme } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Applications', path: '/applications', icon: FileText },
    { name: 'Document Intelligence', path: '/documents', icon: FileCheck2 },
    { name: 'Compliance Center', path: '/compliance', icon: ShieldAlert },
    { name: 'EVC & Committees', path: '/evc', icon: CalendarCheck2 },
    { name: 'Regulatory Assistant', path: '/assistant', icon: Bot },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { name: 'Audit Trail', path: '/audit', icon: History },
  ];

  if (user?.role === UserRole.SYSTEM_ADMIN || user?.role === UserRole.BUREAU_OFFICER) {
    navItems.push({ name: 'System Administration', path: '/admin', icon: Settings });
  }

  const roleLabels: Record<UserRole, { label: string; color: string }> = {
    [UserRole.INSTITUTION_USER]: { label: 'Institution Principal', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
    [UserRole.REGIONAL_OFFICER]: { label: 'Regional Officer (North)', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    [UserRole.BUREAU_OFFICER]: { label: 'Bureau Officer (HQ)', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
    [UserRole.COMMITTEE_MEMBER]: { label: 'EVC Committee Expert', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    [UserRole.SYSTEM_ADMIN]: { label: 'System Administrator', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />

      {/* Top Banner Notice for SIH 2026 Evaluation */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-slate-300 px-4 py-1.5 text-xs flex justify-between items-center border-b border-indigo-900/50">
        <div className="flex items-center space-x-2">
          <span className="font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] tracking-wide uppercase border border-indigo-500/30">
            SIH 2026 • SIH26262
          </span>
          <span className="hidden sm:inline">
            Integrated AICTE Approval Workflow Automation, Compliance Monitoring and Alert Management System
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="text-slate-400">Connected Sandbox Database: SQLite/Prisma Active</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-0 -translate-x-full'
          }`}
        >
          {/* Logo Brand Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-base text-white tracking-tight flex items-center">
                  RegulaFlow <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300">AI</span>
                </span>
                <p className="text-[10px] text-slate-400 font-medium">AICTE Regulatory Suite</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 mr-3 shrink-0" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Active Jurisdiction / Role Indicator */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-semibold text-xs border border-slate-700">
                {user?.fullName.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.role && roleLabels[user.role]?.label}
                </p>
              </div>
            </div>
          </div>
        </aside>

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
                  Search applications, rules, compliance...
                </span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded">
                  Ctrl+K
                </kbd>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              {/* Demo Role Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden md:inline">Role:</span>
                  <span className="font-semibold truncate max-w-[140px]">
                    {user?.role ? roleLabels[user.role]?.label : 'Switch Role'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50">
                    <p className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      SIH 2026 Demo Role Switcher
                    </p>
                    {Object.entries(roleLabels).map(([roleKey, roleVal]) => (
                      <button
                        key={roleKey}
                        onClick={() => {
                          switchDemoRole(roleKey as UserRole);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          user?.role === roleKey
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{roleVal.label}</span>
                        {user?.role === roleKey && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Notification Center Popover */}
              <div className="relative">
                <button
                  onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Regulatory Notifications ({unreadCount} unread)
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
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {notif.title}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
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

