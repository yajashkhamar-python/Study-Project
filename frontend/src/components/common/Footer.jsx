import React from 'react';

export const Footer = () => {
  return (
    <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800">
      <p>© {new Date().getFullYear()} StudyPulse - Production Ready Student Planner</p>
    </footer>
  );
};
