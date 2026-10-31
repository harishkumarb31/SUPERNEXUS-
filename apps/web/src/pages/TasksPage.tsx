import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Plus,
  BookOpen,
  FileCheck2,
  Calendar,
  UserCheck,
  Building,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/api';
import { UserTask, UserRole } from '../types';

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form state for creating a task
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('VERIFICATION');
  const [newPriority, setNewPriority] = useState('NORMAL');
  const [newDueDate, setNewDueDate] = useState('');
  const [newAssignedToId, setNewAssignedToId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isManager = [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.BUREAU_OFFICER,
    UserRole.DEPARTMENT_OFFICER,
    UserRole.REGIONAL_OFFICER,
  ].includes(user?.role as UserRole);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterType !== 'ALL') params.type = filterType;
      if (filterStatus !== 'ALL') params.status = filterStatus;
      if (filterPriority !== 'ALL') params.priority = filterPriority;

      const [data, statsData] = await Promise.all([
        taskService.list(params),
        taskService.getStats(),
      ]);

      setTasks(data || []);
      setStats(statsData || null);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filterType, filterStatus, filterPriority, user]);

  const handleUpdateStatus = async (taskId: string, currentStatus: string) => {
    try {
      let nextStatus = 'IN_PROGRESS';
      let progress = 50;
      if (currentStatus === 'IN_PROGRESS') {
        nextStatus = 'COMPLETED';
        progress = 100;
      } else if (currentStatus === 'COMPLETED') {
        nextStatus = 'PENDING';
        progress = 0;
      }

      await taskService.update(taskId, { status: nextStatus, progress });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: nextStatus as any, progress } : t
        )
      );
      // Refresh stats in background
      taskService.getStats().then((s) => setStats(s));
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    try {
      await taskService.create({
        title: newTitle,
        description: newDesc,
        type: newType,
        priority: newPriority,
        dueDate: newDueDate || undefined,
        assignedToId: newAssignedToId || user?.id,
      });

      setCreateModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      await fetchTasks();
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LEARNING':
        return <BookOpen className="w-3.5 h-3.5 text-blue-500" />;
      case 'SCRUTINY':
        return <FileCheck2 className="w-3.5 h-3.5 text-indigo-500" />;
      case 'EVALUATION':
        return <CheckSquare className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';
      case 'LOW':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
            <CheckSquare className="w-6 h-6 mr-2.5 text-indigo-600 dark:text-indigo-400" />
            Enterprise Tasks & Workflow Assignments
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Role-governed verification checklists, scrutiny assignments, learning roadmap & deadline enforcement
          </p>
        </div>

        {isManager && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Assign New Task</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tasks</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {stats?.total ?? tasks.length}
          </div>
          <span className="text-[10px] text-slate-400">Assigned Workload</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">In Progress</span>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {stats?.inProgress ?? tasks.filter((t) => t.status === 'IN_PROGRESS').length}
          </div>
          <span className="text-[10px] text-slate-400">Active Review</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Pending</span>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {stats?.pending ?? tasks.filter((t) => t.status === 'PENDING').length}
          </div>
          <span className="text-[10px] text-slate-400">Awaiting Pickup</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Completed</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {stats?.completed ?? tasks.filter((t) => t.status === 'COMPLETED').length}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> 100% Verified
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Urgent Attention</span>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {stats?.urgent ?? tasks.filter((t) => t.priority === 'URGENT' && t.status !== 'COMPLETED').length}
          </div>
          <span className="text-[10px] text-rose-500">Critical Deadlines</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Filters:</span>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="VERIFICATION">Verification</option>
            <option value="SCRUTINY">Scrutiny</option>
            <option value="EVALUATION">Evaluation</option>
            <option value="LEARNING">Learning Roadmap</option>
            <option value="COMPLIANCE">Compliance</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <span className="text-slate-400 text-[11px]">
          Showing {tasks.length} active assignments
        </span>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading task matrix...</div>
        ) : tasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 text-xs">
            No tasks match the selected filter criteria.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-xl bg-white dark:bg-slate-900 border transition-all shadow-subtle ${
                task.status === 'COMPLETED'
                  ? 'border-emerald-200 dark:border-emerald-950/60 opacity-80'
                  : task.priority === 'URGENT'
                  ? 'border-rose-300 dark:border-rose-900'
                  : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleUpdateStatus(task.id, task.status)}
                    title="Click to advance status"
                    className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : task.status === 'IN_PROGRESS'
                        ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-400'
                        : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                    }`}
                  >
                    {task.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : task.status === 'IN_PROGRESS' ? (
                      <Clock className="w-3.5 h-3.5" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        {task.title}
                      </span>

                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {getTypeIcon(task.type)}
                        <span>{task.type}</span>
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-slate-400">
                      {task.application && (
                        <span className="flex items-center font-mono text-indigo-600 dark:text-indigo-400">
                          <Building className="w-3 h-3 mr-1" />
                          {task.application.applicationNumber} ({task.application.institution?.name})
                        </span>
                      )}

                      {task.assignedTo && (
                        <span className="flex items-center">
                          <UserCheck className="w-3 h-3 mr-1 text-slate-400" />
                          Assigned: <strong className="ml-1 text-slate-600 dark:text-slate-300">{task.assignedTo.fullName}</strong>
                        </span>
                      )}

                      {task.dueDate && (
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 sm:w-36 gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2 w-full">
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          task.progress === 100
                            ? 'bg-emerald-500'
                            : task.progress > 50
                            ? 'bg-indigo-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-[11px] font-bold font-mono text-slate-600 dark:text-slate-300">
                      {task.progress}%
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : task.status === 'IN_PROGRESS'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {task.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Task Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Assign New Verification / Scrutiny Task
            </h2>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scrutinize Land Title Deed & Boundary Deeds"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Verification Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter specific verification requirements, handbook clauses or checklist items..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Task Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="VERIFICATION">Verification</option>
                    <option value="SCRUTINY">Scrutiny</option>
                    <option value="EVALUATION">Evaluation</option>
                    <option value="LEARNING">Learning Assignment</option>
                    <option value="COMPLIANCE">Compliance Audit</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent (48 hrs)</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
