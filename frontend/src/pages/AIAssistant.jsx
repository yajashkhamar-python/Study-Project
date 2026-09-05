import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Trash2, AlertCircle, Plus, MessageSquare, Menu, X, Clock } from 'lucide-react';
import { ChatMessage } from '../components/ai/ChatMessage';
import { ChatInput } from '../components/ai/ChatInput';
import { QuickActions } from '../components/ai/QuickActions';
import { aiService } from '../services/aiService';
import { useToast } from '../context/ToastContext';

export const AIAssistant = () => {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const messagesEndRef = useRef(null);
  const { addToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load conversation history on page mount
  const fetchConversations = async (autoSelectFirst = false) => {
    try {
      const res = await aiService.getConversations();
      if (res.success && Array.isArray(res.data)) {
        setConversations(res.data);
        if (autoSelectFirst && res.data.length > 0 && !currentConversationId) {
          handleSelectConversation(res.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversation history:', err);
    }
  };

  useEffect(() => {
    fetchConversations(true);
  }, []);

  // Handle selecting an existing conversation from history
  const handleSelectConversation = async (id) => {
    if (id === currentConversationId) return;

    setError(null);
    setLoadingChat(true);
    setCurrentConversationId(id);
    setIsMobileSidebarOpen(false);

    try {
      const res = await aiService.getConversation(id);
      if (res.success && res.data) {
        const formattedMsgs = (res.data.messages || []).map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.createdAt
            ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
        }));
        setMessages(formattedMsgs);
      } else {
        addToast('Unable to load selected chat', 'error');
      }
    } catch (err) {
      console.error('Error opening conversation:', err);
      addToast('Failed to load conversation details', 'error');
    } finally {
      setLoadingChat(false);
    }
  };

  // Start a new chat (Clear view to Quick Actions)
  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setError(null);
    setIsMobileSidebarOpen(false);
  };

  // Send message
  const handleSendMessage = async (text) => {
    if (!text.trim() || loading) return;

    setError(null);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await aiService.sendMessage(text, conversationHistory, currentConversationId);

      if (res.success && res.message) {
        const aiMsg = {
          role: 'assistant',
          content: res.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);

        if (res.conversationId && res.conversationId !== currentConversationId) {
          setCurrentConversationId(res.conversationId);
        }

        // Refresh sidebar conversation list
        fetchConversations();
      } else {
        const errMsg = res.message || 'Unable to process your request.';
        setError(errMsg);
        addToast(errMsg, 'error');
      }
    } catch (err) {
      console.error('AI Error:', err);
      const errMsg = err.response?.data?.message || 'Sorry, I couldn\'t connect to StudyPulse AI right now. Please try again.';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await aiService.deleteConversation(id);
      if (res.success) {
        setConversations((prev) => prev.filter((c) => c._id !== id));
        addToast('Chat deleted', 'info');
        if (currentConversationId === id) {
          handleNewChat();
        }
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      addToast('Failed to delete conversation', 'error');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex h-[calc(100vh-100px)] max-w-7xl mx-auto gap-4 animate-fadeIn relative">
      {/* Sidebar Panel for History (Desktop & Drawer Mobile) */}
      <div
        className={`fixed md:relative inset-y-0 left-0 z-40 w-72 glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col p-4 transition-transform duration-300 md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0 bg-slate-900/95 shadow-2xl' : '-translate-x-full md:flex'
        }`}
      >
        {/* Mobile close button header */}
        <div className="flex items-center justify-between md:hidden mb-3 pb-2 border-b border-slate-800">
          <span className="font-extrabold text-sm text-white">Chat History</span>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-95 mb-4"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          <div className="px-2 py-1 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Recent Chats</span>
          </div>

          {conversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 font-medium">
              No saved chats yet. Start a conversation!
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv._id === currentConversationId;
              const isDeleting = deleteConfirmId === conv._id;

              return (
                <div
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv._id)}
                  className={`group relative flex items-center justify-between p-3 rounded-2xl cursor-pointer text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1 mr-2">
                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-500' : 'opacity-60'}`} />
                    <div className="truncate">
                      <div className="truncate text-slate-900 dark:text-slate-100 font-bold">{conv.title}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                        {formatDateLabel(conv.updatedAt)}
                      </div>
                    </div>
                  </div>

                  {/* Delete Button / Confirmation */}
                  {isDeleting ? (
                    <div className="flex items-center gap-1 bg-rose-500/20 p-1 rounded-xl" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDeleteConversation(e, conv._id)}
                        className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-bold"
                      >
                        Delete
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(null);
                        }}
                        className="px-1.5 py-0.5 text-slate-400 text-[10px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(conv._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Header Bar */}
        <div className="glass-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shadow-md mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle button */}
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="p-2 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 flex-shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  StudyPulse AI
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  GEMINI AI
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Your personal study companion & learning advisor
              </p>
            </div>
          </div>

          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-all duration-200"
            title="Start New Chat"
          >
            <Plus className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-6 overflow-y-auto space-y-4 shadow-inner flex flex-col justify-between mb-4">
          {loadingChat ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-medium">Loading conversation...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <QuickActions onSelectAction={handleSendMessage} />
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <ChatMessage key={idx} message={msg} />
              ))}

              {/* Typing / Loading Indicator */}
              {loading && (
                <div className="flex items-center gap-3 p-4 rounded-3xl bg-slate-200/50 dark:bg-slate-900/60 border border-slate-300/50 dark:border-slate-800/80 max-w-xs animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      StudyPulse AI is thinking...
                    </div>
                    <div className="flex gap-1 pt-0.5">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message Banner */}
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0">
          <ChatInput onSend={handleSendMessage} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
