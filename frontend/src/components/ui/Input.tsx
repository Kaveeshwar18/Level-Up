import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, Props>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`glass-input px-4 py-3 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary/25 ${
            error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-400 font-medium mt-0.5">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
