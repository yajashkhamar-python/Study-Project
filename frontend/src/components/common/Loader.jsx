import React from 'react';

export const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div
      className={`${sizeClasses[size]} border-indigo-500 border-t-transparent rounded-full animate-spin`}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{spinner}</div>;
};
