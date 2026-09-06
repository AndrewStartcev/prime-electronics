import React from "react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, helperText, options, className = "", required, ...props },
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
        <select
          ref={ref}
          className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-primary-black 
            focus:outline-none focus:ring-2 focus:ring-accent-yellow/20 focus:border-accent-yellow
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? "border-red-500" : "border-gray-200"}
            ${className}`}
          {...props}
        >
          <option value="">Выберите...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-text-secondary-black">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
