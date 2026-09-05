import React, { useState, useEffect } from 'react';
import { examService } from '../services/examService';
import { ExamCard } from '../components/exams/ExamCard';
import { ExamForm } from '../components/exams/ExamForm';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import { useToast } from '../context/ToastContext';
import { Plus, GraduationCap, Calendar, Sparkles } from 'lucide-react';

export const ExamsPage = () => {
  const { addToast } = useToast();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await examService.getExams();
      setExams(res.data);
    } catch (err) {
      addToast('Failed to load exams', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreateOrUpdate = async (examData) => {
    try {
      if (editingExam) {
        await examService.updateExam(editingExam._id, examData);
        addToast('Exam details updated', 'success');
      } else {
        await examService.createExam(examData);
        addToast('New exam scheduled!', 'success');
      }
      setIsModalOpen(false);
      setEditingExam(null);
      fetchExams();
    } catch (err) {
      addToast('Failed to save exam', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam schedule?')) return;
    try {
      await examService.deleteExam(id);
      addToast('Exam deleted', 'warning');
      fetchExams();
    } catch (err) {
      addToast('Failed to delete exam', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-indigo-500" />
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Exams & Test Schedules
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Never miss an exam date. Track syllabus, exam venues, and live countdown timers.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingExam(null);
            setIsModalOpen(true);
          }}
          variant="primary"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Schedule Exam
        </Button>
      </div>

      {loading ? (
        <Loader />
      ) : exams.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center border border-slate-200/80 dark:border-slate-800">
          <Calendar className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-60" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No upcoming exams scheduled!</p>
          <p className="text-xs text-slate-400 mt-1">Add your upcoming midterms and finals to stay prepared.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <ExamCard
              key={exam._id}
              exam={exam}
              onEdit={(e) => {
                setEditingExam(e);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExam ? 'Edit Exam Schedule' : 'Schedule New Exam'}
      >
        <ExamForm
          initialData={editingExam || {}}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

