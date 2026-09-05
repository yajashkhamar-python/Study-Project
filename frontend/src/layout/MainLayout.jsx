import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { Footer } from '../components/common/Footer';
import { X } from 'lucide-react';

export const MainLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glowing Orbs */}
      <div className="ambient-glow ambient-glow-indigo" />
      <div className="ambient-glow ambient-glow-purple" />

      <Navbar toggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
      
      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 max-w-xs w-full bg-slate-900 shadow-2xl z-10 flex flex-col animate-slideRight">
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
              <span className="font-extrabold text-lg text-white">Menu</span>
              <button 
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar isMobile onItemClick={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-1 relative z-10">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full transition-all duration-300">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};

