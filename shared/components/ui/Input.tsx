import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-400 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-slate-900 border rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
            error ? 'border-red-500/50 focus:ring-red-500/20' : 'border-slate-600 focus:border-blue-500'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-400 animate-fadeIn">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
