import React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, helperText, className = "", required, rows = 4, ...props },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-primary-black mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-primary-black 
            focus:outline-none focus:ring-2 focus:ring-accent-yellow/20 focus:border-accent-yellow
            disabled:bg-gray-100 disabled:cursor-not-allowed resize-none
            ${error ? "border-red-500" : "border-gray-200"}
            ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-text-secondary-black">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
