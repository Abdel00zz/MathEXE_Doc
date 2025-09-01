
import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, id, name, checked, onChange, ...props }, ref) => {
    const componentId = id || name;
    return (
      <div className="flex items-center">
        <input
          ref={ref}
          type="checkbox"
          id={componentId}
          name={name}
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 dark:bg-slate-800 dark:checked:bg-blue-600 dark:checked:border-transparent"
          {...props}
        />
        <label htmlFor={componentId} className="ml-3 block text-sm text-slate-700 dark:text-slate-300 select-none">
          {label}
        </label>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
export default Checkbox;