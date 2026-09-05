import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

export const ChatInput = ({ onSend, loading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-end gap-2 p-2 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 shadow-lg"
    >
      <div className="pl-3 pb-3 hidden sm:block text-slate-400">
        <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
      </div>

      <textarea
        ref={textareaRef}
        rows={1}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask StudyPulse AI (e.g. 'Plan my study schedule for today')..."
        disabled={loading}
        className="flex-1 bg-transparent border-0 focus:ring-0 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm resize-none py-3 px-2 max-h-36 overflow-y-auto outline-none disabled:opacity-50 font-medium"
      />

      <button
        type="submit"
        disabled={!input.trim() || loading}
        className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 flex-shrink-0"
        title="Send Message (Enter)"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
};
