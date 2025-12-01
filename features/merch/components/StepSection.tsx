
import React from 'react';

interface StepSectionProps {
  number: number;
  title: string;
  children: React.ReactNode;
}

export const StepSection: React.FC<StepSectionProps> = ({ number, title, children }) => (
  <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
    <div className="flex items-center gap-3 mb-4">
       <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">{number}</div>
       <h3 className="font-semibold text-slate-200">{title}</h3>
    </div>
    {children}
  </div>
);
