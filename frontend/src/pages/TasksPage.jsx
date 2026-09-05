import React, { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskForm } from '../components/tasks/TaskForm';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Loader } from '../components/common/Loader';
import { Pagination } from '../components/common/Pagination';
import { useToast } from '../context/ToastContext';
import { Plus, Search, Filter, Download, ListTodo, Sparkles } from 'lucide-react';

export const TasksPage = () => {
  const { addToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await taskService.getTasks({
        page,
        limit: 12,
        search,
        subject: subjectFilter,
        priority: priorityFilter,
        status: statusFilter,
      });
      setTasks(res.data);
      setTotalPages(res.pages);
    } catch (err) {
      addToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, search, subjectFilter, priorityFilter, statusFilter]);

  const handleCreateOrUpdate = async (taskData) => {
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask._id, taskData);
        addToast('Task updated successfully!', 'success');
      } else {
        await taskService.createTask(taskData);
        addToast('New task created!', 'success');
      }
      setIsModalOpen(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      addToast('Failed to save task', 'error');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskService.updateTaskStatus(taskId, status);
      addToast(`Task marked as ${status}`, 'info');
      fetchTasks();
    } catch (err) {
      addToast('Failed to update task status', 'error');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(taskId);
      addToast('Task deleted', 'warning');
      fetchTasks();
    } catch (err) {
      addToast('Failed to delete task', 'error');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Title', 'Subject', 'Due Date', 'Priority', 'Status'];
    const rows = tasks.map((t) => [
      `"${t.title}"`,
      `"${t.subject}"`,
      new Date(t.dueDate).toLocaleDateString(),
      t.priority,
      t.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `study_planner_tasks_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-indigo-500" />
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Tasks Planner
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Organize, prioritize, and conquer your study assignments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </Button>
          <Button
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            variant="primary"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Task
          </Button>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <Input
            icon={Search}
            placeholder="Search tasks by title or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Tasks List Grid */}
      {loading ? (
        <Loader />
      ) : tasks.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center border border-slate-200/80 dark:border-slate-800">
          <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-3 opacity-60" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No tasks found matching your filters.</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search or add a new task.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onStatusChange={handleStatusChange}
              onEdit={(t) => {
                setEditingTask(t);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Modal for Task Create / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
      >
        <TaskForm
          initialData={editingTask || {}}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

