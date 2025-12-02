import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'indigo';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = "", icon }) => {
  const variants = {
    default: "bg-slate-700 text-slate-200",
    outline: "bg-transparent border border-slate-600 text-slate-400",
    success: "bg-green-500/10 text-green-300 border border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20",
    indigo: "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${variants[variant]} ${className}`}>
      {icon && <span className="w-3 h-3">{icon}</span>}
      {children}
    </span>
  );
};
