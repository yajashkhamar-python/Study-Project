import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';

export const ChatMessage = ({ message }) => {
  const isAI = message.role === 'assistant';

  return (
    <div
      className={`flex gap-3 sm:gap-4 p-4 rounded-3xl transition-all duration-200 ${
        isAI
          ? 'bg-slate-200/50 dark:bg-slate-900/60 border border-slate-300/50 dark:border-slate-800/80 text-slate-800 dark:text-slate-100'
          : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 ml-auto max-w-[85%] sm:max-w-[75%]'
      }`}
    >
      {/* Icon Avatar */}
      <div className="flex-shrink-0">
        {isAI ? (
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Bot className="w-5 h-5" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
            <User className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 overflow-hidden space-y-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className={`text-xs font-bold ${isAI ? 'text-indigo-600 dark:text-indigo-400' : 'text-indigo-100'}`}>
            {isAI ? 'StudyPulse AI' : 'You'}
          </span>
          {message.timestamp && (
            <span className={`text-[10px] ${isAI ? 'text-slate-400 dark:text-slate-500' : 'text-indigo-200'}`}>
              {message.timestamp}
            </span>
          )}
        </div>

        {isAI ? (
          <div className="prose dark:prose-invert prose-sm max-w-none text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h1 className="text-lg font-bold my-2 text-indigo-600 dark:text-indigo-400" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-base font-bold my-1.5 text-purple-600 dark:text-purple-400" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-sm font-bold my-1 text-slate-900 dark:text-slate-100" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-2 pl-1" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-2 pl-1" {...props} />,
                li: ({ node, ...props }) => <li className="my-0.5" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
                code: ({ node, inline, ...props }) =>
                  inline ? (
                    <code className="bg-slate-300/50 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-600 dark:text-indigo-300" {...props} />
                  ) : (
                    <code className="block bg-slate-950 text-slate-200 p-3 rounded-2xl text-xs font-mono overflow-x-auto my-2 border border-slate-800" {...props} />
                  ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>
        )}
      </div>
    </div>
  );
};
