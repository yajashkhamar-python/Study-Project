import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import { MainLayout } from './layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { TasksPage } from './pages/TasksPage';
import { ExamsPage } from './pages/ExamsPage';
import { GoalsPage } from './pages/GoalsPage';
import { NotesPage } from './pages/NotesPage';
import { CalendarPage } from './pages/CalendarPage';
import { FocusCenterPage } from './pages/FocusCenterPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AIAssistant } from './pages/AIAssistant';
import { AIPlannerPage } from './pages/AIPlannerPage';
import { Login } from './pages/Login';

import { Register } from './pages/Register';
import { Loader } from './components/common/Loader';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <Router>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Application Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="exams" element={<ExamsPage />} />
                  <Route path="goals" element={<GoalsPage />} />
                  <Route path="notes" element={<NotesPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="focus-center" element={<FocusCenterPage />} />
                  <Route path="pomodoro" element={<Navigate to="/focus-center" replace />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="ai-assistant" element={<AIAssistant />} />
                  <Route path="ai-planner" element={<AIPlannerPage />} />
                  <Route path="settings" element={<SettingsPage />} />

                </Route>



                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Router>
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
