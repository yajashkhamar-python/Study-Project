import React, { useState, useEffect } from 'react';
import { calendarService } from '../services/calendarService';
import { taskService } from '../services/taskService';
import { examService } from '../services/examService';
import { goalService } from '../services/goalService';

import { Loader } from '../components/common/Loader';
import { CalendarHeader } from '../components/calendar/CalendarHeader';
import { CalendarFilterBar } from '../components/calendar/CalendarFilterBar';
import { CalendarEventModal } from '../components/calendar/CalendarEventModal';
import { TodayPanel } from '../components/calendar/TodayPanel';
import { UpcomingEventsList } from '../components/calendar/UpcomingEventsList';
import { CustomCalendarGrid } from '../components/calendar/CustomCalendarGrid';

import { TaskForm } from '../components/tasks/TaskForm';
import { ExamForm } from '../components/exams/ExamForm';
import { GoalModal } from '../components/goals/GoalModal';

import { useToast } from '../context/ToastContext';
import { X, AlertCircle } from 'lucide-react';

export const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month' | 'week' | 'day' | 'agenda'
  const [events, setEvents] = useState([]);
  const [todayData, setTodayData] = useState(null);
  const [nextExam, setNextExam] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState(['exam', 'task', 'milestone', 'focus']);

  // Modals state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const { addToast } = useToast();

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await calendarService.getCalendarData();
      if (res.success && res.data) {
        setEvents(res.data.events || []);
        setTodayData(res.data.today || null);
        setNextExam(res.data.nextExam || null);
      } else {
        setError('Failed to load calendar events.');
      }
    } catch (err) {
      console.error('Calendar load error:', err);
      setError(err.response?.data?.message || 'Unable to load your study calendar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  const handleNavigate = (action) => {
    const newDate = new Date(currentDate);
    if (action === 'PREV') {
      if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
      else if (view === 'week') newDate.setDate(newDate.getDate() - 7);
      else newDate.setDate(newDate.getDate() - 1);
    } else if (action === 'NEXT') {
      if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
      else if (view === 'week') newDate.setDate(newDate.getDate() + 7);
      else newDate.setDate(newDate.getDate() + 1);
    } else if (action === 'TODAY') {
      setCurrentDate(new Date());
      return;
    }
    setCurrentDate(newDate);
  };

  const handleToggleFilter = (filterId) => {
    if (activeFilters.includes(filterId)) {
      setActiveFilters(activeFilters.filter((f) => f !== filterId));
    } else {
      setActiveFilters([...activeFilters, filterId]);
    }
  };

  const handleQuickAdd = (type) => {
    if (type === 'task') setIsTaskModalOpen(true);
    else if (type === 'exam') setIsExamModalOpen(true);
    else if (type === 'goal') setIsGoalModalOpen(true);
  };

  // Quick Add Submissions
  const handleCreateTask = async (data) => {
    try {
      const res = await taskService.createTask(data);
      if (res.success) {
        setIsTaskModalOpen(false);
        addToast('Task added to calendar', 'success');
        fetchCalendar();
      }
    } catch (err) {
      addToast('Failed to create task', 'error');
    }
  };

  const handleCreateExam = async (data) => {
    try {
      const res = await examService.createExam(data);
      if (res.success) {
        setIsExamModalOpen(false);
        addToast('Exam added to calendar', 'success');
        fetchCalendar();
      }
    } catch (err) {
      addToast('Failed to create exam', 'error');
    }
  };

  const handleCreateGoal = async (data) => {
    try {
      const res = await goalService.createGoal(data);
      if (res.success) {
        setIsGoalModalOpen(false);
        addToast('Goal added to calendar', 'success');
        fetchCalendar();
      }
    } catch (err) {
      addToast('Failed to create goal', 'error');
    }
  };

  // Filtering & Search
  const filteredEvents = events.filter((evt) => {
    if (!activeFilters.includes(evt.type)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const titleMatch = evt.title.toLowerCase().includes(q);
      const subjectMatch = evt.subject && evt.subject.toLowerCase().includes(q);
      return titleMatch || subjectMatch;
    }
    return true;
  });

  if (loading && events.length === 0) return <Loader fullScreen />;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Calendar Header & View Switcher */}
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onNavigate={handleNavigate}
        onQuickAdd={handleQuickAdd}
        search={search}
        onSearchChange={setSearch}
      />

      {/* Filter Bar */}
      <CalendarFilterBar activeFilters={activeFilters} onToggleFilter={handleToggleFilter} />

      {/* Main Grid: Custom Calendar Grid + Today Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Box (3 Cols on Desktop) */}
        <div className="lg:col-span-3 glass-card p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 h-[650px] overflow-hidden text-slate-900 dark:text-slate-100 shadow-xl">
          <CustomCalendarGrid
            currentDate={currentDate}
            view={view}
            events={filteredEvents}
            onSelectEvent={(evt) => setSelectedEvent(evt)}
            onDateClick={(d) => setCurrentDate(d)}
          />
        </div>

        {/* Today Panel (1 Col on Desktop) */}
        <div className="lg:col-span-1">
          <TodayPanel
            todayData={todayData}
            nextExam={nextExam}
            onTaskStatusChanged={fetchCalendar}
          />
        </div>
      </div>

      {/* Upcoming Agenda Banner */}
      <UpcomingEventsList events={events} onSelectEvent={(evt) => setSelectedEvent(evt)} />

      {/* Event Details Popover Modal */}
      <CalendarEventModal
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
      />

      {/* Quick Add Task Modal Overlay */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card w-full max-w-lg p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">Add Task to Calendar</h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setIsTaskModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Quick Add Exam Modal Overlay */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card w-full max-w-lg p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">Add Exam to Calendar</h3>
              <button
                onClick={() => setIsExamModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ExamForm
              onSubmit={handleCreateExam}
              onCancel={() => setIsExamModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Quick Add Goal Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSubmit={handleCreateGoal}
      />
    </div>
  );
};

export default CalendarPage;
